import * as bookingService from "../services/booking.service.js";
import {
  AppError,
  NotFoundError,
  AuthorizationError,
} from "../utils/AppError.js";

/**
 * GET /api/v1/bookings
 * Danh sách booking của phụ huynh
 */
export const getBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getBookingsByParent(req.user.id);

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
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
    const { kidId, routeId, scheduledTime, preferredDriverId } = req.body;

    const bookingData = {
      parentId: req.user.id,
      kidId,
      routeId,
      scheduledTime,
      preferredDriverId: preferredDriverId || null,
      type: "one_time",
    };

    const booking = await bookingService.createBooking(bookingData);

    res.status(201).json({
      success: true,
      message: "Tạo booking thành công.",
      data: booking,
    });
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
    const booking = await bookingService.getBookingById(req.params.bookingId);

    // Verify ownership
    if (booking.parentId.toString() !== req.user.id.toString()) {
      throw new AuthorizationError("Bạn không có quyền truy cập booking này.");
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
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
    const booking = await bookingService.getBookingById(req.params.bookingId);

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

    const cancelledBooking = await bookingService.cancelBooking(
      req.params.bookingId,
      req.user.id,
    );

    res.status(200).json({
      success: true,
      message: "Hủy booking thành công.",
      data: cancelledBooking,
    });
  } catch (error) {
    next(error);
  }
};
