import express from "express";
import {
  getTripConfirmations,
  uploadConfirmationPhoto,
} from "../controllers/ConfirmationController.js";
import {
  authenticateToken,
  authorize,
} from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { validateTripIdParam } from "../validators/tripValidators.js";
import { uploadConfirmation } from "../middlewares/upload.middleware.js";

const router = express.Router();

// Tất cả routes yêu cầu xác thực
router.use(authenticateToken);

/**
 * GET /api/v1/trips/:tripId/confirmations
 * Ảnh xác nhận đón + trả
 * Role: parent
 */
router.get(
  "/trips/:tripId/confirmations",
  authorize("parent"),
  validateTripIdParam,
  validate,
  getTripConfirmations
);

/**
 * POST /api/v1/upload/confirmation-photo
 * Upload ảnh xác nhận (đón / trả trẻ)
 * Role: driver
 * Form-data: file (image) + tripId + type (pickup | dropoff)
 */
router.post(
  "/upload/confirmation-photo",
  authorize("driver"),
  uploadConfirmation.single("file"),
  uploadConfirmationPhoto
);

export default router;
