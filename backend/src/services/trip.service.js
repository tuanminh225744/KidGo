import Trip from "../models/operational/trip.model.js";
import Driver from "../models/core/driver.model.js";
import Kid from "../models/core/kid.model.js";
import { getIo } from "../sockets/socketManager.js";
import redisClient from "../config/redisClient.js";
import { AppError, NotFoundError } from "../utils/AppError.js";

/**
 * 1. Tài xế bắt đầu di chuyển đến điểm đón
 * Sinh mã OTP bảo mật giao quyền chốt chuyến cho Phụ huynh
 */
export const driverStartPickup = async (tripId) => {
  try {
    const trip = await Trip.findById(tripId);
    if (!trip) throw new Error("Hành trình không tồn tại.");

    if (!["scheduled", "picking_up"].includes(trip.status)) {
      throw new Error(`Không thể bắt đầu đón ở trạng thái ${trip.status}.`);
    }

    trip.status = "picking_up";
    await trip.save();

    await Driver.findByIdAndUpdate(trip.driverId, {
      rideStatus: "driving_to_pickup",
    });

    const kid = await Kid.findById(trip.kidId).select("securitySettings");
    console.log("kid?.securitySettings", kid?.securitySettings);

    trip.otp = {
      required: !!kid?.securitySettings?.otp,
      status: kid?.securitySettings?.otp ? "pending" : "not_required",
      data: null,
      verifiedAt: null,
    };
    trip.pickupPhoto = {
      required: !!kid?.securitySettings?.pickupPhoto,
      status: kid?.securitySettings?.pickupPhoto ? "pending" : "not_required",
      data: null,
      verifiedAt: null,
    };
    trip.dropoffPhoto = {
      required: !!kid?.securitySettings?.dropoffPhoto,
      status: kid?.securitySettings?.dropoffPhoto ? "pending" : "not_required",
      data: null,
      verifiedAt: null,
    };
    trip.securityQuestion = {
      required: !!kid?.securitySettings?.securityQuestion,
      status: kid?.securitySettings?.securityQuestion
        ? "pending"
        : "not_required",
      data: null,
      verifiedAt: null,
    };

    const otpCode = trip.otp.required
      ? Math.floor(100000 + Math.random() * 900000).toString()
      : null;
    if (otpCode) {
      await redisClient.setex(`trip_otp:${trip._id}`, 7200, otpCode);
    }
    trip.markModified("otp");
    trip.markModified("pickupPhoto");
    trip.markModified("dropoffPhoto");
    trip.markModified("securityQuestion");

    await trip.save();

    const io = getIo();

    // Bắn Socket 1: Xe đang nổ máy di chuyển
    io.of("/parent").to(trip.parentId.toString()).emit("driver_is_coming", {
      title: "Tài xế đang quay xe tới!",
      message: "Tài xế đã bắt đầu di chuyển đến điểm đón bé.",
      tripId: trip._id,
    });

    // Bắn Socket 2: Bàn giao chìa khóa OTP cho Mẹ
    if (otpCode) {
      io.of("/parent").to(trip.parentId.toString()).emit("trip_otp_created", {
        title: "Mã PIN đón con",
        otp: otpCode,
        message:
          "Khi tài xế chui ra mở cửa, vui lòng đọc hoặc Chat gửi MÃ PIN NÀY cho bác tài để chứng minh đón đúng mã bé.",
        tripId: trip._id,
      });
    }

    return { success: true, message: "Driver started pickup", data: trip };
  } catch (error) {
    throw new Error(`Lỗi cập nhật chặng đường: ${error.message}`);
  }
};

/**
 * 2. Tài xế tới gặp mặt Bé
 */
export const verifyTripOtp = async (tripId, enteredOtp) => {
  try {
    const trip = await Trip.findById(tripId);
    if (!trip) throw new Error("Hành trình không tồn tại.");

    if (!trip.otp?.required)
      throw new Error("Chuyến đi này không yêu cầu OTP.");

    const storedOtp = await redisClient.get(`trip_otp:${trip._id}`);
    if (!storedOtp || storedOtp !== enteredOtp.toString()) {
      throw new Error("Mã OTP không chính xác hoặc đã hết hạn.");
    }

    await redisClient.del(`trip_otp:${trip._id}`);

    trip.otp = {
      ...(trip.otp.toObject?.() || trip.otp),
      status: "passed",
      data: { otpVerified: true },
      verifiedAt: new Date(),
    };

    await trip.save();
    return { success: true, message: "OTP verified", data: trip };
  } catch (error) {
    throw new Error(`Xác thực OTP thất bại: ${error.message}`);
  }
};

export const verifyTripPickupPhoto = async (tripId, photo) => {
  try {
    const trip = await Trip.findById(tripId);
    if (!trip) throw new Error("Hành trình không tồn tại.");

    if (!trip.pickupPhoto?.required)
      throw new Error("Chuyến đi này không yêu cầu chụp ảnh đón.");

    trip.pickupPhoto = {
      ...(trip.pickupPhoto.toObject?.() || trip.pickupPhoto),
      status: "passed",
      data: { photo: photo || null },
      verifiedAt: new Date(),
    };

    await trip.save();
    return { success: true, message: "Pickup photo verified", data: trip };
  } catch (error) {
    throw new Error(`Xác thực ảnh đón thất bại: ${error.message}`);
  }
};

export const verifyTripDropoffPhoto = async (tripId, photo) => {
  try {
    const trip = await Trip.findById(tripId);
    if (!trip) throw new Error("Hành trình không tồn tại.");

    if (!trip.dropoffPhoto?.required)
      throw new Error("Chuyến đi này không yêu cầu chụp ảnh trả.");

    trip.dropoffPhoto = {
      ...(trip.dropoffPhoto.toObject?.() || trip.dropoffPhoto),
      status: "passed",
      data: { photo: photo || null },
      verifiedAt: new Date(),
    };

    await trip.save();
    return { success: true, message: "Dropoff photo verified", data: trip };
  } catch (error) {
    throw new Error(`Xác thực ảnh trả thất bại: ${error.message}`);
  }
};

export const verifyTripSecurityQuestion = async (tripId, answer) => {
  try {
    const trip = await Trip.findById(tripId);
    if (!trip) throw new Error("Hành trình không tồn tại.");

    if (!trip.securityQuestion?.required)
      throw new Error("Chuyến đi này không yêu cầu câu hỏi bảo mật.");

    trip.securityQuestion = {
      ...(trip.securityQuestion.toObject?.() || trip.securityQuestion),
      status: "passed",
      data: {
        answer: answer || null,
      },
      verifiedAt: new Date(),
    };

    await trip.save();
    return { success: true, message: "Security question verified", data: trip };
  } catch (error) {
    throw new Error(`Xác thực câu hỏi bảo mật thất bại: ${error.message}`);
  }
};

/**
 * 2. Tài xế tới gặp mặt Bé - Chốt xác nhận (kiểm tra requirement)
 */
export const driverPickupKid = async (tripId) => {
  try {
    const trip = await Trip.findById(tripId);
    if (!trip) throw new Error("Hành trình không tồn tại.");

    if (trip.otp?.required && trip.otp?.status !== "passed") {
      throw new Error("Chưa xác thực OTP.");
    }

    if (trip.pickupPhoto?.required && trip.pickupPhoto?.status !== "passed") {
      throw new Error("Chưa xác thực chụp ảnh đón.");
    }

    if (
      trip.securityQuestion?.required &&
      trip.securityQuestion?.status !== "passed"
    ) {
      throw new Error("Chưa xác thực câu hỏi bảo mật.");
    }

    trip.status = "in_progress";
    await trip.save();

    // Nâng cấp trạng thái ông xế lên "Đang bon bon trên cầu"
    await Driver.findByIdAndUpdate(trip.driverId, { rideStatus: "in_trip" });

    const io = getIo();
    io.of("/parent").to(trip.parentId.toString()).emit("kid_picked_up", {
      title: "Đã đón bé - Rất An Toàn!",
      message:
        "Xác thực MÃ PIN thành công. Hành khách nhí đã yên vị trên ghế và bắt đầu di chuyển.",
      tripId: trip._id,
    });

    return { success: true, message: "Kid picked up", data: trip };
  } catch (error) {
    throw new Error(`Lỗi quá trình tiếp nhận bé: ${error.message}`);
  }
};

/**
 * 3. Tài xế đến nơi, kết thúc chuyến xe mỹ mãn
 */
export const driverDropoffKid = async (tripId) => {
  try {
    const trip = await Trip.findById(tripId);
    if (!trip) throw new Error("Hành trình không tồn tại.");

    if (trip.dropoffPhoto?.required && trip.dropoffPhoto?.status !== "passed") {
      throw new Error("Chưa xác thực chụp ảnh trả.");
    }

    trip.status = "completed";
    await trip.save();

    // Cập nhật tổng thu nhập cho tài xế nếu chuyến có payment
    if (trip.paymentId) {
      const payment = await import("../models/operational/payment.model.js")
        .then((m) => m.default)
        .then((Payment) => Payment.findById(trip.paymentId));
      if (payment && payment.driverEarning) {
        await Driver.findByIdAndUpdate(trip.driverId, {
          $inc: { totalEarnings: payment.driverEarning },
        });
      }
    }

    // Chuyến đi dứt điểm, Thả xích ông xế về Trạng thái "Tự Do 100%"
    await Driver.findByIdAndUpdate(trip.driverId, { rideStatus: "free" });

    const io = getIo();
    io.of("/parent").to(trip.parentId.toString()).emit("kid_dropped_off", {
      title: "Hành trình Mỹ Vãn",
      message:
        "Bé con đã được thả xuống điểm trả một cách hoàn hảo. Cảm ơn Mẹ đã giao phó cho KidGo!",
      tripId: trip._id,
    });

    return { success: true, message: "Trip completed", data: trip };
  } catch (error) {
    throw new Error(`Lỗi ấn nút trả khách: ${error.message}`);
  }
};

/**
 * 6. Lấy danh sách chuyến của phụ huynh (có thể filter theo status)
 */
export const getParentTrips = async (
  parentId,
  { status, page = 1, limit = 20 } = {},
) => {
  const query = { parentId };
  if (status) query.status = status;

  const skip = (page - 1) * limit;
  const [trips, total] = await Promise.all([
    Trip.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("routeId")
      .populate({
        path: "driverId",
        select: "user licenseNumber rating",
        populate: { path: "user", select: "fullName avatar phone" },
      })
      .populate("kidId", "fullName avatar")
      .populate("vehicleId", "licensePlate model color")
      .populate("paymentId"),
    Trip.countDocuments(query),
  ]);

  return {
    success: true,
    message: "Parent trips fetched",
    data: { page, total, totalPages: Math.ceil(total / limit), trips },
  };
};

/**
 * 7b. Lấy danh sách chuyến của tài xế
 */
export const getTripsByDriver = async (
  driverId,
  { status, page = 1, limit = 20 } = {},
) => {
  const query = { driverId };
  if (status) query.status = status;

  const skip = (page - 1) * limit;
  const [trips, total] = await Promise.all([
    Trip.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("routeId")
      .populate({
        path: "driverId",
        select: "user licenseNumber rating currentLocation isOnline",
        populate: { path: "user", select: "fullName avatar phone" },
      })
      .populate("kidId", "fullName avatar")
      .populate("vehicleId", "licensePlate model color")
      .populate("paymentId"),
    Trip.countDocuments(query),
  ]);

  return {
    success: true,
    message: "Driver trips fetched",
    data: { page, total, totalPages: Math.ceil(total / limit), trips },
  };
};

/**
 * 7. Lấy tất cả chuyến đang chạy của các con (parent)
 */
export const getActiveTrips = async (parentId) => {
  const trips = await Trip.find({
    parentId,
    status: { $in: ["picking_up", "in_progress"] },
  })
    .populate("routeId")
    .populate({
      path: "driverId",
      select: "user licenseNumber rating currentLocation isOnline",
      populate: { path: "user", select: "fullName avatar phone" },
    })
    .populate("kidId", "fullName avatar")
    .populate("vehicleId", "licensePlate model color")
    .populate("paymentId");

  return { success: true, message: "Active trips fetched", data: trips };
};

/**
 * 8. Lấy chi tiết một chuyến
 */
export const getTripDetail = async (tripId, userId, role) => {
  const trip = await Trip.findById(tripId)
    .populate("routeId")
    .populate("driverId", "user licenseNumber rating")
    .populate("kidId", "fullName avatar")
    .populate("vehicleId", "licensePlate model color")
    .populate("bookingId")
    .populate("paymentId");

  if (!trip) throw new NotFoundError("Chuyến đi không tồn tại.");

  // Kiểm tra quyền truy cập
  if (role === "parent" && trip.parentId.toString() !== userId.toString()) {
    throw new AppError("Bạn không có quyền xem chuyến này.", 403);
  }
  if (
    role === "driver" &&
    trip.driverId._id?.toString() !== userId.toString()
  ) {
    throw new AppError("Bạn không có quyền xem chuyến này.", 403);
  }

  return { success: true, message: "Trip detail fetched", data: trip };
};

/**
 * 9. Huỷ chuyến (parent hoặc driver)
 */
export const cancelTrip = async (tripId, userId, role) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new NotFoundError("Chuyến đi không tồn tại.");

  if (["completed", "cancelled"].includes(trip.status)) {
    throw new AppError("Không thể huỷ chuyến đã hoàn thành hoặc đã huỷ.", 400);
  }

  // Kiểm tra quyền huỷ
  if (role === "parent" && trip.parentId.toString() !== userId.toString()) {
    throw new AppError("Bạn không có quyền huỷ chuyến này.", 403);
  }

  trip.status = "cancelled";
  await trip.save();

  // Giải phóng tài xế
  await Driver.findByIdAndUpdate(trip.driverId, { rideStatus: "free" });

  const io = getIo();
  io.of("/parent").to(trip.parentId.toString()).emit("trip_cancelled", {
    tripId: trip._id,
    message: "Chuyến đi đã bị huỷ.",
    cancelledBy: role,
  });

  return { success: true, message: "Trip cancelled", data: trip };
};

/**
 * 10. Ghi nhận GPS tick realtime từ tài xế
 */
export const recordGpsTick = async (
  tripId,
  driverId,
  { lat, lng, speed, heading, accuracy },
) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new NotFoundError("Chuyến đi không tồn tại.");
  if (trip.status !== "in_progress") {
    throw new AppError("Chuyến đi chưa bắt đầu hoặc đã kết thúc.", 400);
  }

  // Cập nhật vị trí hiện tại của driver trong Redis
  await redisClient.setex(
    `driver_location:${driverId}`,
    300,
    JSON.stringify({ lat, lng, speed, heading, updatedAt: new Date() }),
  );

  // Phát vị trí realtime qua Socket.IO cho parent
  const io = getIo();
  io.of("/parent").to(trip.parentId.toString()).emit("driver_location_update", {
    tripId,
    driverId,
    lat,
    lng,
    speed,
    heading,
    accuracy,
    time: new Date(),
  });

  return { success: true, message: "GPS tick recorded", data: { ok: true } };
};
