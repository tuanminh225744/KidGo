import express from "express";
import {
  getTrips,
  getActiveTripsList,
  getTripDetails,
  getLocationLog,
  startTrip,
  confirmPickup,
  confirmDropoff,
  cancelTripHandler,
  gpsTick,
} from "../controllers/TripController.js";
import {
  authenticateToken,
  authorize,
} from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  validateTripIdParam,
  validateGpsTick,
  validateConfirmPickup,
  validateTripsQuery,
} from "../validators/tripValidators.js";

const router = express.Router();

// Tất cả routes yêu cầu xác thực
router.use(authenticateToken);

/**
 * GET /api/v1/trips
 * Lịch sử chuyến của phụ huynh
 * Role: parent
 */
router.get(
  "/",
  authorize("parent"),
  validateTripsQuery,
  validate,
  getTrips
);

/**
 * GET /api/v1/trips/active
 * Tất cả chuyến đang chạy của các con
 * Role: parent
 * ⚠ PHẢI đặt trước /:tripId để không bị conflict
 */
router.get(
  "/active",
  authorize("parent"),
  getActiveTripsList
);

/**
 * GET /api/v1/trips/:tripId
 * Chi tiết chuyến (parent, driver, admin)
 */
router.get(
  "/:tripId",
  validateTripIdParam,
  validate,
  getTripDetails
);

/**
 * GET /api/v1/trips/:tripId/location-log
 * Log GPS toàn bộ chuyến
 * Role: parent
 */
router.get(
  "/:tripId/location-log",
  authorize("parent"),
  validateTripIdParam,
  validate,
  getLocationLog
);

/**
 * POST /api/v1/trips/:tripId/start
 * Tài xế bắt đầu chuyến
 * Role: driver
 */
router.post(
  "/:tripId/start",
  authorize("driver"),
  validateTripIdParam,
  validate,
  startTrip
);

/**
 * POST /api/v1/trips/:tripId/confirm-pickup
 * Tài xế xác nhận đã đón trẻ (nhập OTP)
 * Role: driver
 */
router.post(
  "/:tripId/confirm-pickup",
  authorize("driver"),
  validateTripIdParam,
  validateConfirmPickup,
  validate,
  confirmPickup
);

/**
 * POST /api/v1/trips/:tripId/confirm-dropoff
 * Tài xế xác nhận đã trả trẻ
 * Role: driver
 */
router.post(
  "/:tripId/confirm-dropoff",
  authorize("driver"),
  validateTripIdParam,
  validate,
  confirmDropoff
);

/**
 * POST /api/v1/trips/:tripId/cancel
 * Huỷ chuyến (parent hoặc driver)
 */
router.post(
  "/:tripId/cancel",
  authorize("parent", "driver"),
  validateTripIdParam,
  validate,
  cancelTripHandler
);

/**
 * POST /api/v1/trips/:tripId/gps-tick
 * Gửi vị trí GPS realtime
 * Role: driver
 */
router.post(
  "/:tripId/gps-tick",
  authorize("driver"),
  validateTripIdParam,
  validateGpsTick,
  validate,
  gpsTick
);

export default router;
