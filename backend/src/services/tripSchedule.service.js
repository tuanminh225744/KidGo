import TripSchedule from "../models/operational/tripSchedule.model.js";
import Subscription from "../models/operational/subscription.model.js";

/**
 * 1. Khởi tạo Lịch trình lặp cố định
 */
export const createTripSchedule = async (scheduleData) => {
  try {
    // Kiểm tra rào cản validation với Gói cước (Subscription)
    if (scheduleData.subscriptionId) {
      const sub = await Subscription.findById(scheduleData.subscriptionId);
      if (!sub) throw new Error("Mã gói dịch vụ thanh toán không hợp lệ.");
      if (sub.status !== "active")
        throw new Error(
          `Không thể móc nối lịch vào gói dịch vụ đang bị ${sub.status}.`,
        );

      const schedStart = new Date(scheduleData.startDate);
      const schedEnd = scheduleData.endDate
        ? new Date(scheduleData.endDate)
        : null;

      // Lịch trình phải nằm bên trong Gói cước (Thời hạn Thẻ)
      if (schedStart < sub.startDate) {
        throw new Error(
          "Ngày bắt đầu của lịch trình không được sớm hơn ngày kích hoạt gói cước.",
        );
      }
      if (schedEnd && schedEnd > sub.endDate) {
        throw new Error(
          "Ngày kết thúc của lịch trình đang vượt ra ngoài giới hạn hạn sử dụng của gói cước.",
        );
      }
    }

    const newSchedule = new TripSchedule(scheduleData);
    await newSchedule.save();
    return {
      success: true,
      message: "Trip schedule created",
      data: newSchedule,
    };
  } catch (error) {
    throw new Error(`Lỗi lưu lịch cố định: ${error.message}`);
  }
};

/**
 * 2. Xem chi tiết thông tin Lịch trình
 */
export const getTripScheduleById = async (scheduleId) => {
  try {
    const schedule = await TripSchedule.findById(scheduleId);
    if (!schedule) throw new Error("Không tìm thấy bản ghi lịch trình.");
    return { success: true, message: "Trip schedule fetched", data: schedule };
  } catch (error) {
    throw new Error(`Lỗi truy xuất lịch trình: ${error.message}`);
  }
};

/**
 * 3. Chỉnh sửa Lịch trình cố định
 */
export const updateTripSchedule = async (scheduleId, updateData) => {
  try {
    /* Ghi chú Tương lai:
           - Nếu payload mảng `updateData` có chứa `startDate` hoặc `endDate` mới, 
             bạn phải lại query đến Subscription đắp lại luồng kiểm tra logic như hàm số 1 kia
             để nhỡ bệnh nhân cố tình dời lịch ra khỏi ngoài hạn Gói Cước nhé! */

    const updatedSched = await TripSchedule.findByIdAndUpdate(
      scheduleId,
      { $set: updateData },
      { returnDocument: "after", runValidators: true },
    );
    if (!updatedSched) throw new Error("Căn cứ Lịch trình không tồn tại!");
    return {
      success: true,
      message: "Trip schedule updated",
      data: updatedSched,
    };
  } catch (error) {
    throw new Error(`Lỗi cập nhật dữ liệu lịch: ${error.message}`);
  }
};

/**
 * 4. Hủy bỏ Lịch trình (Xóa Mềm - Soft Delete) - Trả kết quả false cho isActive
 */
export const cancelTripSchedule = async (scheduleId) => {
  try {
    const cancelledSched = await TripSchedule.findByIdAndUpdate(
      scheduleId,
      { $set: { isActive: false } },
      { returnDocument: "after" },
    );
    if (!cancelledSched)
      throw new Error("Không tra ra lịch trình cần khóa nòng.");
    return {
      success: true,
      message: "Trip schedule cancelled",
      data: cancelledSched,
    };
  } catch (error) {
    throw new Error(`Lỗi hủy lịch trình Database: ${error.message}`);
  }
};

/**
 * Lấy danh sách lịch trình của phụ huynh
 */
export const getSchedulesByParent = async (parentId) => {
  try {
    const schedules = await TripSchedule.find({ parentId })
      .populate("kidId", "fullName avatar")
      .populate(
        "routeId",
        "estimatedPickupAddress estimatedDropoffAddress estimatedDistance estimatedDuration actualPickupAddress actualDropoffAddress actualDistance actualDuration",
      )
      .populate("preferredDriverId", "user")
      .sort({ createdAt: -1 });
    return {
      success: true,
      message: "Trip schedules fetched",
      data: schedules,
    };
  } catch (error) {
    throw new Error(`Lỗi lấy danh sách lịch trình: ${error.message}`);
  }
};

/**
 * Lấy danh sách lịch trình theo ngày cụ thể của phụ huynh
 */
export const getSchedulesByParentAndDate = async (parentId, date) => {
  try {
    const targetDate = String(date);

    if (!targetDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      throw new Error("Ngày lọc không hợp lệ.");
    }

    const startOfDay = new Date(`${targetDate}T00:00:00.000Z`);
    const endOfDay = new Date(`${targetDate}T23:59:59.999Z`);
    const dayOfWeek = startOfDay.getUTCDay();

    const schedules = await TripSchedule.find({
      parentId,
      isActive: true,
      $and: [
        { startDate: { $lte: endOfDay } },
        { $or: [{ endDate: null }, { endDate: { $gte: startOfDay } }] },
        {
          $or: [
            { repeatDays: dayOfWeek },
            { repeatDays: [] },
            { repeatDays: { $size: 0 } },
          ],
        },
      ],
    })
      .populate("kidId", "fullName avatar")
      .populate(
        "routeId",
        "estimatedPickupAddress estimatedDropoffAddress estimatedDistance estimatedDuration actualPickupAddress actualDropoffAddress actualDistance actualDuration",
      )
      .populate("preferredDriverId", "user")
      .sort({ pickupTime: 1, createdAt: -1 });

    return {
      success: true,
      message: "Trip schedules by date fetched",
      data: schedules,
    };
  } catch (error) {
    throw new Error(`Lỗi lấy lịch trình theo ngày: ${error.message}`);
  }
};

/**
 * Lấy danh sách lịch trình theo ngày cụ thể của tài xế
 */
export const getSchedulesByDriverAndDate = async (driverId, date) => {
  try {
    const targetDate = String(date);

    if (!targetDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      throw new Error("Ngày lọc không hợp lệ. Vui lòng định dạng YYYY-MM-DD");
    }

    const startOfDay = new Date(`${targetDate}T00:00:00.000Z`);
    const endOfDay = new Date(`${targetDate}T23:59:59.999Z`);
    const dayOfWeek = startOfDay.getUTCDay();

    const schedules = await TripSchedule.find({
      preferredDriverId: driverId,
      isActive: true,
      $and: [
        { startDate: { $lte: endOfDay } },
        { $or: [{ endDate: null }, { endDate: { $gte: startOfDay } }] },
        {
          $or: [
            { repeatDays: dayOfWeek },
            { repeatDays: [] },
            { repeatDays: { $size: 0 } },
          ],
        },
      ],
    })
      .populate("parentId", "fullName phone")
      .populate("kidId", "fullName avatar")
      .populate(
        "routeId",
        "estimatedPickupAddress estimatedDropoffAddress estimatedDistance estimatedDuration actualPickupAddress actualDropoffAddress actualDistance actualDuration",
      )
      .sort({ pickupTime: 1, createdAt: -1 });

    return {
      success: true,
      message: "Driver's trip schedules by date fetched",
      data: schedules,
    };
  } catch (error) {
    throw new Error(`Lỗi lấy lịch trình tài xế theo ngày: ${error.message}`);
  }
};

/**
 * Lấy danh sách các chuyến định kì của tài xế đặt theo gói
 */
export const getSubscriptionSchedulesByDriver = async (driverId) => {
  try {
    const schedules = await TripSchedule.find({
      preferredDriverId: driverId,
      subscriptionId: { $ne: null },
      isActive: true,
    })
      .populate("parentId", "fullName phone")
      .populate("kidId", "fullName avatar")
      .populate("subscriptionId", "plan status startDate endDate usedTrips")
      .populate(
        "routeId",
        "estimatedPickupAddress estimatedDropoffAddress estimatedDistance estimatedDuration actualPickupAddress actualDropoffAddress actualDistance actualDuration",
      )
      .sort({ createdAt: -1 });

    return {
      success: true,
      message: "Driver's subscription schedules fetched",
      data: schedules,
    };
  } catch (error) {
    throw new Error(`Lỗi lấy danh sách lịch định kì theo gói của tài xế: ${error.message}`);
  }
};
