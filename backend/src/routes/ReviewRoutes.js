import express from "express";
import { upsertReview, getDriverReviewsHandler } from "../controllers/ReviewController.js";
import {
  authenticateToken,
  authorize,
} from "../middlewares/auth.middleware.js";
import { validateUpsertReview } from "../validators/reviewValidators.js";
import { validate } from "../middlewares/validate.middleware.js";
import { param, query } from "express-validator";

const router = express.Router();

// Tất cả routes yêu cầu xác thực
router.use(authenticateToken);

/**
 * POST /api/v1/reviews
 * Phụ huynh đánh giá sau chuyến (create or update)
 * Role: parent
 */
router.post(
  "/",
  authorize("parent"),
  validateUpsertReview,
  validate,
  upsertReview
);

/**
 * GET /api/v1/reviews/driver/:driverId
 * Xem đánh giá của một tài xế
 * Role: parent
 */
router.get(
  "/driver/:driverId",
  authorize("parent"),
  [
    param("driverId").isMongoId().withMessage("driverId không hợp lệ."),
    query("page").optional().isInt({ min: 1 }).withMessage("page phải là số nguyên dương."),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit phải từ 1 đến 100."),
  ],
  validate,
  getDriverReviewsHandler
);

export default router;
