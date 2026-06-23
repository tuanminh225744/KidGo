import Payment from "../models/operational/payment.model.js";
import { AuthorizationError, AppError } from "../utils/AppError.js";
import TripSchedule from "../models/operational/tripSchedule.model.js";

/**
 * Tạo mới một bản ghi thanh toán
 */
export const createPayment = async (data) => {
  try {
    const newPayment = new Payment(data);
    await newPayment.save();
    return { success: true, message: "Payment created", data: newPayment };
  } catch (error) {
    throw new Error(`Lỗi tạo thanh toán: ${error.message}`);
  }
};

/**
 * Lấy chi tiết thông tin thanh toán theo ID
 */
export const getPaymentById = async (paymentId) => {
  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) throw new Error("Không tìm thấy thông tin thanh toán.");
    return { success: true, message: "Payment fetched", data: payment };
  } catch (error) {
    throw new Error(
      error.message || `Lỗi lấy thông tin thanh toán: ${error.message}`,
    );
  }
};

/**
 * Cập nhật trạng thái thanh toán
 */
export const updatePaymentStatus = async (paymentId, status) => {
  try {
    const updateFields = { status };
    if (status === "completed") {
      updateFields.paidAt = new Date();
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      { $set: updateFields },
      { new: true, runValidators: true },
    );

    if (!updatedPayment) throw new Error("Thanh toán không tồn tại.");
    return { success: true, message: "Payment updated", data: updatedPayment };
  } catch (error) {
    throw new Error(
      error.message || `Lỗi cập nhật thanh toán: ${error.message}`,
    );
  }
};

/**
 * Tài xế xác nhận đã nhận tiền mặt
 */
export const confirmCashPayment = async (paymentId, userRole) => {
  if (userRole !== "driver") {
    throw new AuthorizationError(
      "Chỉ tài xế mới có quyền xác nhận nhận tiền mặt.",
    );
  }

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new AppError("Không tìm thấy thông tin thanh toán.", 404);
  }

  if (payment.method !== "cash") {
    throw new AppError(
      "Thanh toán này không phải là thanh toán tiền mặt.",
      400,
    );
  }
  if (payment.status === "completed") {
    throw new AppError("Thanh toán này đã được hoàn thành.", 400);
  }

  payment.status = "completed";
  payment.paidAt = new Date();
  await payment.save();

  return {
    success: true,
    message: "Xác nhận nhận tiền mặt thành công.",
    data: payment,
  };
};

export const previewPayment = async (tripScheduleId, preferredDriverId = null) => {
  try {
    const schedule = await TripSchedule.findById(tripScheduleId)
      .populate("routeId")
      .populate("subscriptionId");

    if (!schedule) {
      throw new Error("Không tìm thấy Lịch trình (TripSchedule).");
    }
    if (!schedule.endDate) {
      throw new Error("Lịch trình phải có ngày kết thúc (endDate) để tính tổng thanh toán.");
    }

    let tripCount = 0;
    const start = new Date(schedule.startDate);
    const end = new Date(schedule.endDate);

    const maxDays = 366;
    let daysPassed = 0;

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (daysPassed++ > maxDays) break;

      const dayOfWeek = d.getDay();
      if (schedule.repeatDays && schedule.repeatDays.length > 0) {
        if (schedule.repeatDays.includes(dayOfWeek)) {
          tripCount++;
        }
      } else {
        tripCount = 1;
        break;
      }
    }

    if (tripCount === 0) {
      throw new Error("Không có ngày đi học nào nằm trong khoảng thời gian này.");
    }

    const distance = schedule.routeId?.estimatedDistance || 0;
    let pricePerTrip = 15000 + distance * 5000;

    if (preferredDriverId) {
      pricePerTrip += 10000; // Phụ phí 10k cho tài xế ưu tiên
    }

    let discount = 0;
    if (schedule.subscriptionId) {
      if (schedule.subscriptionId.plan === "monthly") {
        discount = 0.05;
      } else if (schedule.subscriptionId.plan === "yearly") {
        discount = 0.1;
      }
    }

    const amount = pricePerTrip * tripCount * (1 - discount);
    const driverEarning = amount * 0.8;

    return {
      success: true,
      message: "Payment preview calculated",
      data: { tripCount, pricePerTrip, discount, amount, driverEarning },
    };
  } catch (error) {
    throw new Error(`Lỗi tính toán trước giá tiền: ${error.message}`);
  }
};