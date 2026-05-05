import express from "express";
import {
  getBookings,
  createBooking,
  getBookingDetail,
  cancelBooking,
} from "../controllers/BookingController.js";
import {
  authenticateToken,
  authorize,
} from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  validateBookingIdParam,
  validateCreateBooking,
} from "../validators/bookingValidators.js";

const router = express.Router();

// Tất cả routes yêu cầu xác thực và quyền parent
router.use(authenticateToken, authorize("parent"));

/**
 * GET /api/v1/bookings
 * Danh sách booking
 */
router.get("/", getBookings);

/**
 * POST /api/v1/bookings
 * Tạo booking một lần
 */
router.post("/", validateCreateBooking, validate, createBooking);

/**
 * GET /api/v1/bookings/:bookingId
 * Chi tiết booking
 */
router.get("/:bookingId", validateBookingIdParam, validate, getBookingDetail);

/**
 * DELETE /api/v1/bookings/:bookingId
 * Hủy booking
 */
router.delete("/:bookingId", validateBookingIdParam, validate, cancelBooking);

export default router;
