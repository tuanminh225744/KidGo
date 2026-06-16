import * as paymentService from "../services/payment.service.js";
import { AuthorizationError, AppError } from "../utils/AppError.js";
import { success, error } from "../utils/response.js";

import TripSchedule from "../models/operational/tripSchedule.model.js";

/**
 * POST /api/v1/payments
 * Khách hàng tạo thanh toán (khi đặt chuyến)
 */
export const createPayment = async (req, res, next) => {
  try {
    const { tripScheduleId, method } = req.body;

    // Lấy thông tin lịch trình để tính giá
    const schedule = await TripSchedule.findById(tripScheduleId)
      .populate("routeId")
      .populate("subscriptionId");

    if (!schedule) {
      throw new AppError("Không tìm thấy Lịch trình (TripSchedule).", 404);
    }
    if (!schedule.endDate) {
      throw new AppError(
        "Lịch trình phải có ngày kết thúc (endDate) để tính tổng thanh toán.",
        400,
      );
    }

    // Đếm số chuyến
    let tripCount = 0;
    const start = new Date(schedule.startDate);
    const end = new Date(schedule.endDate);

    const maxDays = 366;
    let daysPassed = 0;

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (daysPassed++ > maxDays) break; // Tránh lặp vô hạn nếu có lỗi logic

      const dayOfWeek = d.getDay(); // 0(CN) - 6(T7)
      if (schedule.repeatDays && schedule.repeatDays.length > 0) {
        if (schedule.repeatDays.includes(dayOfWeek)) {
          tripCount++;
        }
      } else {
        // Lịch không lặp (một lần)
        tripCount = 1;
        break;
      }
    }

    if (tripCount === 0) {
      throw new AppError(
        "Không có ngày đi học nào nằm trong khoảng thời gian này.",
        400,
      );
    }

    // Tính giá từng chuyến: 15k base + 5k/km
    const distance = schedule.routeId?.estimatedDistance || 0;
    const pricePerTrip = 15000 + distance * 5000;

    // Tính giảm giá (discount) dựa trên subscription
    let discount = 0;
    if (schedule.subscriptionId) {
      if (schedule.subscriptionId.plan === "monthly") {
        discount = 0.05;
      } else if (schedule.subscriptionId.plan === "yearly") {
        discount = 0.1;
      }
    }

    // Tổng tiền & thu nhập tài xế
    const amount = pricePerTrip * tripCount * (1 - discount);
    const driverEarning = amount * 0.8;

    const paymentData = {
      userId: req.user.id,
      tripScheduleId,
      amount,
      driverEarning,
      method,
      status: "pending",
    };

    const paymentResult = await paymentService.createPayment(paymentData);

    // Cập nhật paymentId ngược lại vào Lịch trình
    schedule.paymentId = paymentResult.data._id;
    await schedule.save();

    return success(
      res,
      { payment: paymentResult.data, tripCount, pricePerTrip, discount },
      paymentResult.message || "Tạo thanh toán tự động thành công.",
      201,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/payments/preview
 * Tính toán trước giá tiền (dành cho màn hình chọn phương thức)
 */
export const previewPayment = async (req, res, next) => {
  try {
    const { tripScheduleId } = req.body;

    // Lấy thông tin lịch trình để tính giá
    const schedule = await TripSchedule.findById(tripScheduleId)
      .populate("routeId")
      .populate("subscriptionId");

    if (!schedule) {
      throw new AppError("Không tìm thấy Lịch trình (TripSchedule).", 404);
    }
    if (!schedule.endDate) {
      throw new AppError(
        "Lịch trình phải có ngày kết thúc (endDate) để tính tổng thanh toán.",
        400,
      );
    }

    // Đếm số chuyến
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
      throw new AppError(
        "Không có ngày đi học nào nằm trong khoảng thời gian này.",
        400,
      );
    }

    // Tính giá
    const distance = schedule.routeId?.estimatedDistance || 0;
    const pricePerTrip = 15000 + distance * 5000;

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

    return success(
      res,
      { tripCount, pricePerTrip, discount, amount, driverEarning },
      "Payment preview calculated",
      200,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/payments/:paymentId
 * Lấy chi tiết thanh toán
 */
export const getPayment = async (req, res, next) => {
  try {
    const result = await paymentService.getPaymentById(req.params.paymentId);
    const payment = result.data;

    // Phân quyền: Phụ huynh chỉ xem được thanh toán của mình.
    // Tài xế (driver) và Admin được phép xem thông tin thanh toán (phục vụ app tài xế).
    if (
      req.user.role === "parent" &&
      payment.userId.toString() !== req.user.id.toString()
    ) {
      throw new AuthorizationError(
        "Bạn không có quyền xem thông tin thanh toán này.",
      );
    }

    return success(res, payment, result.message, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/payments/:paymentId/status
 * Cập nhật trạng thái thanh toán (Thành công/Thất bại)
 */
export const updatePaymentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const fetchResult = await paymentService.getPaymentById(
      req.params.paymentId,
    );
    const payment = fetchResult.data;

    // Xử lý phân quyền theo vai trò
    if (req.user.role === "driver") {
      // Tài xế chỉ được phép xác nhận (completed) khi phương thức là tiền mặt (cash)
      if (payment.method !== "cash") {
        throw new AuthorizationError(
          "Tài xế chỉ được phép xác nhận thanh toán đối với phương thức Tiền mặt (cash).",
        );
      }
    } else if (req.user.role === "parent") {
      // Phụ huynh phải là chủ của payment
      if (payment.userId.toString() !== req.user.id.toString()) {
        throw new AuthorizationError(
          "Bạn không có quyền cập nhật thanh toán này.",
        );
      }
    }

    const updated = await paymentService.updatePaymentStatus(
      req.params.paymentId,
      status,
    );
    return success(
      res,
      updated.data,
      updated.message || "Cập nhật trạng thái thanh toán thành công.",
      200,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/payments/:paymentId/confirm-cash
 * Tài xế xác nhận đã nhận tiền mặt
 */
export const confirmCashPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const fetchResult = await paymentService.getPaymentById(paymentId);
    const payment = fetchResult.data;

    if (req.user.role !== "driver") {
      throw new AuthorizationError(
        "Chỉ tài xế mới có quyền xác nhận nhận tiền mặt.",
      );
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

    const updatedPayment = await paymentService.updatePaymentStatus(
      paymentId,
      "completed",
    );

    // Lấy model Driver và cập nhật cashReceived
    const Driver = (await import("../models/core/driver.model.js")).default;
    await Driver.findOneAndUpdate(
      { user: req.user.id },
      { $inc: { cashReceived: payment.amount } },
    );

    return success(
      res,
      updatedPayment.data,
      updatedPayment.message || "Xác nhận nhận tiền mặt thành công.",
      200,
    );
  } catch (error) {
    next(error);
  }
};
