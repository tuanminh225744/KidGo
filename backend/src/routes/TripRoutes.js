import express from "express";
import {
  getTrips,
  getActiveTripsList,
  getTripDetails,
  startTrip,
  verifyOtpHandler,
  verifyPickupPhotoHandler,
  verifyDropoffPhotoHandler,
  verifySecurityQuestionHandler,
  confirmPickup,
  confirmDropoff,
  cancelTripHandler,
  gpsTick,
  updateEstimatedWaypointsHandler,
} from "../controllers/TripController.js";
import {
  authenticateToken,
  authorize,
} from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  validateTripIdParam,
  validateGpsTick,
  validateVerifyOtp,
  validateVerifyPhoto,
  validateVerifySecurityQuestion,
  validateConfirmPickup,
  validateTripsQuery,
  validateEstimatedWaypoints,
} from "../validators/tripValidators.js";
import { uploadConfirmation } from "../middlewares/upload.middleware.js";

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
 * POST /api/v1/trips/:tripId/verify-otp
 * Tài xế xác thực OTP
 * Role: driver
 */
router.post(
  "/:tripId/verify-otp",
  authorize("driver"),
  validateTripIdParam,
  validateVerifyOtp,
  validate,
  verifyOtpHandler
);

/**
 * POST /api/v1/trips/:tripId/verify-pickup-photo
 * Tài xế xác thực ảnh đón
 * Role: driver
 */
router.post(
  "/:tripId/verify-pickup-photo",
  authorize("driver"),
  uploadConfirmation.single("photo"),
  validateTripIdParam,
  validate,
  verifyPickupPhotoHandler
);

/**
 * POST /api/v1/trips/:tripId/verify-dropoff-photo
 * Tài xế xác thực ảnh trả
 * Role: driver
 */
router.post(
  "/:tripId/verify-dropoff-photo",
  authorize("driver"),
  uploadConfirmation.single("photo"),
  validateTripIdParam,
  validate,
  verifyDropoffPhotoHandler
);

/**
 * POST /api/v1/trips/:tripId/verify-security-question
 * Tài xế xác thực câu hỏi bảo mật
 * Role: driver
 */
router.post(
  "/:tripId/verify-security-question",
  authorize("driver"),
  validateTripIdParam,
  validateVerifySecurityQuestion,
  validate,
  verifySecurityQuestionHandler
);

/**
 * POST /api/v1/trips/:tripId/confirm-pickup
 * Tài xế chốt xác nhận đón trẻ sau khi các phương thức bắt buộc đã pass
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

/**
 * POST /api/v1/trips/:tripId/estimated-waypoints
 * Tài xế cập nhật estimated waypoints cho route
 * Role: driver
 */
router.post(
  "/:tripId/estimated-waypoints",
  authorize("driver"),
  validateTripIdParam,
  validateEstimatedWaypoints,
  validate,
  updateEstimatedWaypointsHandler
);

export default router;
