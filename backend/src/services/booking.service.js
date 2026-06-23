import Booking from "../models/operational/booking.model.js";
import Trip from "../models/operational/trip.model.js";
import Route from "../models/operational/route.model.js";
import Driver from "../models/core/driver.model.js";
import Vehicle from "../models/core/vehicle.model.js";
import Notification from "../models/support/notification.model.js";
import mongoose from "mongoose";
import { getIo } from "../sockets/socketManager.js";
import { getNearbyDrivers, getDriverByUserId } from "./driver.service.js";
import { driverStartPickup } from "./trip.service.js";
import redisClient from "../config/redisClient.js";

// Memory Object lưu trữ luồng hệ thống để có thể ngắt bất kì lúc nào
const activeBookingTimers = {};
const activeBookingQueues = {};

const addRejectedDriverToRedis = async (bookingId, driverId) => {
  const key = `booking:rejected:${bookingId}`;
  await redisClient.sadd(key, driverId.toString());
  await redisClient.expire(key, 300); // TTL 5 phút
};

/**
 * Xóa toàn bộ các Timer đếm giờ của một booking
 */
const clearBookingTimer = (bookingId) => {
  if (activeBookingTimers[bookingId]) {
    activeBookingTimers[bookingId].forEach((timer) => clearTimeout(timer));
    delete activeBookingTimers[bookingId];
  }
  if (activeBookingQueues[bookingId]) {
    clearTimeout(activeBookingQueues[bookingId].timer);
    delete activeBookingQueues[bookingId];
  }
  const key = `booking:rejected:${bookingId}`;
  redisClient.del(key).catch(e => console.error("Lỗi xóa blacklist booking từ Redis:", e));
};

const sendParentBookingNotification = async (
  booking,
  title,
  body,
  type,
  tripId = null,
) => {
  const notification = new Notification({
    recipientId: booking.parentId,
    recipientType: "parent",
    type,
    title,
    body,
    tripId,
  });
  await notification.save();
  return notification;
};

const isDriverRelatedToBooking = (booking, driverId) => {
  const driverIdStr = driverId?.toString();
  if (
    booking?.assignedDriverId?.toString() === driverIdStr ||
    booking?.preferredDriverId?.toString() === driverIdStr
  ) {
    return true;
  }

  if (activeBookingQueues[booking._id]) {
    const queue = activeBookingQueues[booking._id];
    if (queue.currentIndex > 0 && queue.drivers[queue.currentIndex - 1] === driverIdStr) {
      return true;
    }
  }
  return false;
};

/**
 * Ngắt kèo tự động do Timeout 5 phút
 */
const triggerTimeoutCancel = async (bookingId) => {
  try {
    const booking = await Booking.findById(bookingId);
    if (
      booking &&
      (booking.status === "pending" ||
        (booking.status === "matched" && booking.preferredDriverId))
    ) {
      booking.status = "cancelled";
      booking.assignedDriverId = null;
      await booking.save();

      const io = getIo();
      let message =
        "Rất tiếc không có tài xế rảnh nào tiếp nhận yêu cầu, hệ thống đã hủy ghép xe.";

      if (booking.preferredDriverId) {
        message =
          "Tài xế ưu tiên không nhận cuốc. Hệ thống đã hủy chuyến xe, vui lòng đặt lại.";
      }

      // Bắn cho phụ huynh dể họ tìm cuốc mới
      io.of("/parent").to(booking.parentId.toString()).emit("pairing_timeout", {
        message,
        bookingId: booking._id,
      });
      console.log(
        `[Timer] Booking ${bookingId} cancelled due to timeout.`,
      );
    }
  } catch (e) {
    console.error("Lỗi timeout booking ngầm:", e);
  } finally {
    clearBookingTimer(bookingId);
  }
};

/**
 * Lọc mảng Redis trả về để kiếm xem ông xế nào thực sự Rảnh rang, ưu tiên certificationLevel cao
 */
const filterFreeDrivers = async (nearbyDriverIdArray) => {
  if (!nearbyDriverIdArray || nearbyDriverIdArray.length === 0) return [];

  // nearbyDriverIdArray: [["id1", "0.5"], ["id2", "1.2"]]
  const ids = nearbyDriverIdArray.map((item) => item[0]);

  const freeDrivers = await Driver.find({
    _id: { $in: ids },
    isOnline: true,
    rideStatus: "free", // CHỈ bắt xế free
  })
    .sort({ certificationLevel: -1 })
    .select("_id");
  console.log("da tim thay driver ranh trong pham vi:", freeDrivers);
  return freeDrivers.map((d) => d._id.toString());
};

const sendToNextInQueue = async (bookingId) => {
  const queue = activeBookingQueues[bookingId];
  if (!queue) return;

  clearTimeout(queue.timer);

  if (queue.currentIndex >= queue.drivers.length) {
    queue.sweepRadius = queue.sweepRadius === 2 ? 5 : (queue.sweepRadius === 5 ? 10 : null);
    if (queue.sweepRadius) {
      await sweepFn(bookingId, queue.sweepRadius);
    } else {
      triggerTimeoutCancel(bookingId);
    }
    return;
  }

  const driverId = queue.drivers[queue.currentIndex];
  queue.currentIndex++;

  const io = getIo();
  io.of("/driver")
    .to(driverId)
    .emit("new_booking_available", {
      message: `Có 1 cuốc đón vé trong bán kính ${queue.sweepRadius}km`,
      bookingId: bookingId,
    });
  console.log(`[Match Cycle] Booking ${bookingId} ping tài xế ${driverId}. Chờ 15s.`);

  queue.timer = setTimeout(async () => {
    console.log(`[Match Cycle] Tài xế ${driverId} bỏ qua, chuyển người tiếp theo.`);
    await addRejectedDriverToRedis(bookingId, driverId);
    sendToNextInQueue(bookingId);
  }, 15000);
};

const sweepFn = async (bookingId, radius) => {
  const checkBooking = await Booking.findById(bookingId);
  if (!checkBooking || checkBooking.status !== "pending") return;

  const route = await Route.findById(checkBooking.routeId);
  const pickupCoords =
    route?.estimatedPickupCoords?.coordinates ||
    route?.actualPickupCoords?.coordinates;
  if (!pickupCoords) return;
  const [lng, lat] = pickupCoords;

  const rawNearbyRes = await getNearbyDrivers(lat, lng, radius, "km");
  let rawNearby = rawNearbyRes && rawNearbyRes.data ? rawNearbyRes.data : [];

  const key = `booking:rejected:${bookingId}`;
  const rejectedIds = await redisClient.smembers(key);
  if (rejectedIds && rejectedIds.length > 0) {
    rawNearby = rawNearby.filter(item => !rejectedIds.includes(item[0].toString()));
  }

  const freeDriverIds = await filterFreeDrivers(rawNearby);

  activeBookingQueues[bookingId] = {
    drivers: freeDriverIds,
    currentIndex: 0,
    sweepRadius: radius,
    timer: null
  };

  await sendToNextInQueue(bookingId);
};

/**
 * Cơ chế Dò sóng: Vệt dầu loang 0'(2km) -> 1'(5km) -> 2'(10km) -> 5'(Timeout)
 */
const startGenericMatchingCycle = async (bookingId, lat, lng) => {
  activeBookingTimers[bookingId] = [];

  // Vừa vào nổ cú sóng đầu tiên
  await sweepFn(bookingId, 2);
};

export const createBooking = async (bookingData) => {
  try {
    const booking = new Booking({
      ...bookingData,
      status: "pending", // Chuyến mới luôn ở trạng thái chờ
    });
    await booking.save();

    const io = getIo();

    if (booking.preferredDriverId) {
      booking.assignedDriverId = booking.preferredDriverId;
      booking.status = "matched";
      await booking.save();

      // Push đích danh cho tài xế VIP
      io.of("/driver")
        .to(booking.preferredDriverId.toString())
        .emit("booking_assigned", {
          message:
            "Bạn nhận được 1 cuốc xe từ danh sách ưu tiên của phụ huynh!",
          bookingId: booking._id,
        });

      // Thiết lập Timeout 3 phút cho Xế ưu tiên
      activeBookingTimers[booking._id] = [
        setTimeout(() => triggerTimeoutCancel(booking._id), 180 * 1000),
      ];
    } else {
      console.log("tim tai xe xung quan voi", booking);
      const route = await Route.findById(booking.routeId);
      const pickupCoords =
        route?.estimatedPickupCoords?.coordinates ||
        route?.actualPickupCoords?.coordinates;
      if (!route || !pickupCoords) {
        throw new Error(
          "Không đủ tọa độ để khởi động Rada dò tìm cuốc (Route ID thiếu/sai).",
        );
      }

      const [lng, lat] = pickupCoords;
      // Tiến hành mở máy dò
      await startGenericMatchingCycle(booking._id, lat, lng);
    }

    return { success: true, message: "Booking created", data: booking };
  } catch (error) {
    throw new Error(`Lỗi tạo booking: ${error.message}`);
  }
};

export const editBooking = async (bookingId, parentId, updateData) => {
  try {
    const booking = await Booking.findOne({ _id: bookingId, parentId });
    if (!booking)
      throw new Error("Không tìm thấy booking hoặc bạn không có quyền sửa.");

    if (["confirmed", "cancelled"].includes(booking.status)) {
      throw new Error(
        `Không thể chỉnh sửa chuyến đi vì trạng thái đã là ${booking.status}.`,
      );
    }

    Object.assign(booking, updateData);
    await booking.save();

    const io = getIo();

    io.of("/parent").to(parentId.toString()).emit("booking_updated", {
      message: "Lịch trình chuyến đi đã được bạn cập nhật thành công.",
      bookingId: booking._id,
    });

    if (booking.assignedDriverId) {
      io.of("/driver")
        .to(booking.assignedDriverId.toString())
        .emit("booking_updated", {
          message:
            "Phụ huynh vừa thay đổi thông tin địa điểm hay giờ đi, hãy kiểm tra lại!",
          bookingId: booking._id,
        });
    }

    return { success: true, message: "Booking updated", data: booking };
  } catch (error) {
    throw new Error(`Lỗi sửa booking: ${error.message}`);
  }
};

export const parentCancelBooking = async (bookingId, parentId) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: bookingId, parentId },
      { status: "cancelled" },
      { returnDocument: "after" },
    );

    if (!booking) throw new Error("Hủy thất bại. Booking không tồn tại.");

    // Xóa Timer quét xe trên bầu trời nếu phụ huynh nhột hủy ngang
    clearBookingTimer(booking._id);

    const io = getIo();
    if (booking.assignedDriverId) {
      // Báo sang máy ông xế biết đường mà về
      io.of("/driver")
        .to(booking.assignedDriverId.toString())
        .emit("booking_cancelled_by_parent", {
          message:
            "Phụ huynh đã hủy chuyến xe. Cuốc xe này tự động vô hiệu lực.",
          bookingId: booking._id,
        });
      // Update lại status ông xế là rảnh rang
      await Driver.findByIdAndUpdate(booking.assignedDriverId, {
        rideStatus: "free",
      });
    }

    return {
      success: true,
      message: "Booking cancelled by parent",
      data: booking,
    };
  } catch (error) {
    throw new Error(`Lỗi hủy booking: ${error.message}`);
  }
};

export const driverAcceptBooking = async (bookingId, userId) => {
  try {
    const driverRes = await getDriverByUserId(userId);
    const driver = driverRes?.data;
    if (!driver) throw new Error("Không tìm thấy tài xế.");
    const driverId = driver._id;

    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error("Không có booking này.");
    if (!isDriverRelatedToBooking(booking, driverId)) {
      throw new Error("Bạn không có quyền nhận booking này.");
    }
    if (!["pending", "matched"].includes(booking.status))
      throw new Error(
        `Cuốc xe đang ${booking.status}. Bàn tay của bạn chậm quá rồi!`,
      );

    booking.assignedDriverId = driverId;
    booking.status = "matched";
    await booking.save();

    // Xóa ngầm Timer gợn sóng hay Timeout 5 phút vì xe đã có chủ chốt
    clearBookingTimer(booking._id);

    // Khóa trạng thái tài xế
    await Driver.findByIdAndUpdate(driverId, {
      rideStatus: "driving_to_pickup",
    });

    // Tự động Khởi tạo Hành trình (Trip)
    const vehicle = await Vehicle.findOne({
      driverId: driverId,
      isActive: true,
    });
    const route = await Route.findById(booking.routeId);
    if (!route) {
      throw new Error("Không tìm thấy lộ trình cho booking này.");
    }

    const newTrip = new Trip({
      bookingId: booking._id,
      driverId: driverId,
      kidId: booking.kidId,
      parentId: booking.parentId,
      vehicleId: vehicle ? vehicle._id : new mongoose.Types.ObjectId(), // Dùng mock ID nếu test data chưa có xe
      routeId: route._id,
      paymentId: booking.paymentId,
      status: "picking_up",
    });
    await newTrip.save();

    const updatedTripRes = await driverStartPickup(newTrip._id);
    const updatedTrip =
      updatedTripRes && updatedTripRes.data ? updatedTripRes.data : null;

    await sendParentBookingNotification(
      booking,
      "Tài xế đã xác nhận chuyến",
      "Đã có tài xế xác nhận nhận chuyến của bạn.",
      "booking_confirmed",
      updatedTrip ? updatedTrip._id : null,
    );

    return {
      success: true,
      message: "Driver accepted booking",
      data: { booking: booking, trip: updatedTrip, route: route },
    };
  } catch (error) {
    throw new Error(`Lỗi tài xế nhận chuyến: ${error.message}`);
  }
};

export const driverCancelBooking = async (bookingId, userId) => {
  try {
    const driverRes = await getDriverByUserId(userId);
    const driver = driverRes?.data;
    if (!driver) throw new Error("Không tìm thấy tài xế.");
    const driverId = driver._id;

    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error("Không thể hủy lệnh đón không tồn tại.");
    if (!isDriverRelatedToBooking(booking, driverId)) {
      throw new Error("Bạn không có quyền hủy booking này.");
    }

    if (booking.preferredDriverId && booking.preferredDriverId.toString() === driverId.toString()) {
      booking.status = "cancelled";
      booking.assignedDriverId = null;
      await booking.save();

      clearBookingTimer(booking._id);

      await Driver.findByIdAndUpdate(driverId, { rideStatus: "free" });

      const io = getIo();
      io.of("/parent")
        .to(booking.parentId.toString())
        .emit("driver_rejected_booking", {
          title: "Tài xế hủy chuyến",
          message:
            "Tài xế có thể đã gặp trục trặc và vừa hủy lệnh đón bé. Vui lòng thao tác book một chuyến mới ngay nhé!",
          bookingId: booking._id,
        });

      await sendParentBookingNotification(
        booking,
        "Tài xế đã từ chối chuyến",
        "Tài xế được chỉ định đã từ chối chuyến. Vui lòng tạo một booking mới hoặc chờ hệ thống ghép tài xế khác.",
        "booking_rejected",
      );
    } else {
      if (booking.assignedDriverId && booking.assignedDriverId.toString() === driverId.toString()) {
        booking.assignedDriverId = null;
        booking.status = "pending";
        await booking.save();
      }

      await Driver.findByIdAndUpdate(driverId, { rideStatus: "free" });
      await addRejectedDriverToRedis(booking._id, driverId);

      if (activeBookingQueues[booking._id]) {
        sendToNextInQueue(booking._id);
      }
    }

    return {
      success: true,
      message: "Driver rejected booking",
      data: booking,
    };
  } catch (error) {
    throw new Error(`Lỗi tài xế hủy cuộc: ${error.message}`);
  }
};

/**
 * Lấy danh sách bookings của phụ huynh
 */
export const getBookingsByParent = async (parentId) => {
  try {
    const bookings = await Booking.find({ parentId })
      .populate("kidId", "fullName avatar")
      .populate(
        "routeId",
        "estimatedPickupAddress estimatedDropoffAddress estimatedDistance estimatedDuration actualPickupAddress actualDropoffAddress actualDistance actualDuration",
      )
      .populate("assignedDriverId", "user")
      .sort({ createdAt: -1 });
    return { success: true, message: "Bookings fetched", data: bookings };
  } catch (error) {
    throw new Error(`Lỗi lấy danh sách booking: ${error.message}`);
  }
};

/**
 * Lấy chi tiết một booking
 */
export const getBookingById = async (bookingId) => {
  try {
    const booking = await Booking.findById(bookingId)
      .populate("kidId", "fullName avatar")
      .populate(
        "routeId",
        "estimatedPickupAddress estimatedDropoffAddress estimatedDistance estimatedDuration actualPickupAddress actualDropoffAddress actualDistance actualDuration",
      )
      .populate("assignedDriverId", "user");

    if (!booking) {
      throw new Error("Không tìm thấy booking.");
    }
    return { success: true, message: "Booking fetched", data: booking };
  } catch (error) {
    throw new Error(`Lỗi lấy chi tiết booking: ${error.message}`);
  }
};

/**
 * Hủy booking (wrapper cho parentCancelBooking)
 */
export const cancelBooking = async (bookingId, parentId) => {
  return parentCancelBooking(bookingId, parentId);
};
