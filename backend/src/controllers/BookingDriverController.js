import * as bookingService from "../services/booking.service.js";
import { AppError, AuthorizationError } from "../utils/AppError.js";
import Booking from "../models/operational/booking.model.js";
import Driver from "../models/core/driver.model.js";
import { getDriverByUserId } from "../services/driver.service.js";
import { success, error } from "../utils/response.js";

/**
 * GET /api/v1/drivers/me/booking-requests
 * Danh sách booking đang mời
 */
export const getBookingRequests = async (req, res, next) => {
  try {
    const driverRes = await getDriverByUserId(req.user.id);
    const driver = driverRes?.data;
    if (!driver) throw new AppError("Không tìm thấy tài xế.", 404);

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
      .populate(
        "routeId",
        "estimatedPickupAddress estimatedDropoffAddress estimatedDistance estimatedDuration actualPickupAddress actualDropoffAddress actualDistance actualDuration",
      )
      .populate("parentId", "fullName phone");

    return success(res, bookings, "Booking requests fetched", 200);
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
    const result = await bookingService.driverAcceptBooking(
      req.params.bookingId,
      req.user.id,
    );
    return success(
      res,
      result.data,
      result.message || "Chấp nhận chuyến thành công.",
      200,
    );
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
    const result = await bookingService.driverCancelBooking(
      req.params.bookingId,
      req.user.id,
    );
    return success(
      res,
      result.data,
      result.message || "Từ chối chuyến thành công.",
      200,
    );
  } catch (error) {
    next(error);
  }
};
