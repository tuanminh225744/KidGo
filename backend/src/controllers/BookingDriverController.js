import * as bookingService from "../services/booking.service.js";
import { AppError, AuthorizationError } from "../utils/AppError.js";
import Booking from "../models/operational/booking.model.js";
import Driver from "../models/core/driver.model.js";
import { getDriverByUserId } from "../services/driver.service.js";

/**
 * GET /api/v1/drivers/me/booking-requests
 * Danh sách booking đang mời
 */
export const getBookingRequests = async (req, res, next) => {
  try {
    const driver = await getDriverByUserId(req.user.id);

    const bookings = await Booking.find({
      $or: [
        { preferredDriverId: driver._id, status: "pending" },
        {
          assignedDriverId: driver._id,
          status: { $in: ["pending", "matched"] },
        },
      ],
    })
      .populate("kidId", "fullName avatar")
      .populate("routeId", "name pickupAddress dropoffAddress")
      .populate("parentId", "fullName phone");

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
 * POST /api/v1/drivers/me/booking-requests/:bookingId/accept
 * Chấp nhận chuyến
 */
export const acceptBooking = async (req, res, next) => {
  try {
    const driverId = (await getDriverByUserId(req.user.id))._id;

    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      throw new AppError("Không tìm thấy booking.", 404);
    }

    if (
      booking.assignedDriverId?.toString() !== driverId.toString() &&
      booking.preferredDriverId?.toString() !== driverId.toString()
    ) {
      throw new AuthorizationError("Bạn không có quyền chấp nhận booking này.");
    }

    const updatedBooking = await bookingService.driverAcceptBooking(
      booking._id,
      driverId,
    );

    res.status(200).json({
      success: true,
      message: "Chấp nhận chuyến thành công.",
      data: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/drivers/me/booking-requests/:bookingId/reject
 * Từ chối chuyến
 */
export const rejectBooking = async (req, res, next) => {
  try {
    const driverId = (await getDriverByUserId(req.user.id))._id;

    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      throw new AppError("Không tìm thấy booking.", 404);
    }

    if (
      booking.assignedDriverId?.toString() !== driverId.toString() &&
      booking.preferredDriverId?.toString() !== driverId.toString()
    ) {
      throw new AuthorizationError("Bạn không có quyền từ chối booking này.");
    }

    const updatedBooking = await bookingService.driverCancelBooking(
      req.params.bookingId,
      driverId,
    );

    res.status(200).json({
      success: true,
      message: "Từ chối chuyến thành công.",
      data: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};
