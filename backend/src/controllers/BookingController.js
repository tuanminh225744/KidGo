import * as bookingService from "../services/booking.service.js";
import {
  AppError,
  NotFoundError,
  AuthorizationError,
} from "../utils/AppError.js";
import { success, error } from "../utils/response.js";

/**
 * GET /api/v1/bookings
 * Danh sách booking của phụ huynh
 */
export const getBookings = async (req, res, next) => {
  try {
    const result = await bookingService.getBookingsByParent(req.user.id);
    return success(
      res,
      { count: result.data.length, data: result.data },
      result.message,
      200,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/bookings
 * Tạo booking một lần
 */
export const createBooking = async (req, res, next) => {
  try {
    const {
      kidId,
      routeId,
      scheduleId,
      scheduledTime,
      preferredDriverId,
      paymentId,
    } = req.body;

    const bookingData = {
      parentId: req.user.id,
      kidId,
      routeId,
      scheduleId: scheduleId || null,
      scheduledTime,
      preferredDriverId: preferredDriverId || null,
      paymentId,
      type: "one_time",
    };

    const result = await bookingService.createBooking(bookingData);
    return success(
      res,
      result.data,
      result.message || "Tạo booking thành công.",
      201,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/bookings/:bookingId
 * Chi tiết booking
 */
export const getBookingDetail = async (req, res, next) => {
  try {
    const result = await bookingService.getBookingById(req.params.bookingId);
    const booking = result.data;
    // Verify ownership
    if (booking.parentId.toString() !== req.user.id.toString()) {
      throw new AuthorizationError("Bạn không có quyền truy cập booking này.");
    }
    return success(res, booking, result.message, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/bookings/:bookingId
 * Hủy booking
 */
export const cancelBooking = async (req, res, next) => {
  try {
    const resultFetch = await bookingService.getBookingById(
      req.params.bookingId,
    );
    const booking = resultFetch.data;
    // Verify ownership
    if (booking.parentId.toString() !== req.user.id.toString()) {
      throw new AuthorizationError("Bạn không có quyền hủy booking này.");
    }

    // Can only cancel pending or matched bookings
    if (!["pending", "matched"].includes(booking.status)) {
      throw new AppError(
        `Không thể hủy booking với trạng thái ${booking.status}.`,
        400,
      );
    }

    const cancelled = await bookingService.cancelBooking(
      req.params.bookingId,
      req.user.id,
    );
    return success(
      res,
      cancelled.data,
      cancelled.message || "Hủy booking thành công.",
      200,
    );
  } catch (error) {
    next(error);
  }
};
