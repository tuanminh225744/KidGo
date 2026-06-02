import express from "express";
import {
  getCurrentSubscription,
  createSubscription,
  cancelSubscription,
  getSubscriptionUsage,
} from "../controllers/SubscriptionController.js";
import {
  authenticateToken,
  authorize,
} from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  validateSubscriptionIdParam,
  validateCreateSubscription,
} from "../validators/subscriptionValidators.js";

const router = express.Router();

// Tất cả routes yêu cầu xác thực và quyền parent
router.use(authenticateToken, authorize("parent"));

/**
 * GET /api/v1/subscriptions/me
 * Gói tháng hiện tại
 */
router.get("/me", getCurrentSubscription);

/**
 * POST /api/v1/subscriptions
 * Đăng ký gói tháng
 */
router.post("/", validateCreateSubscription, validate, createSubscription);

/**
 * PATCH /api/v1/subscriptions/:subId/cancel
 * Hủy gói tháng
 */
router.patch(
  "/:subId/cancel",
  validateSubscriptionIdParam,
  validate,
  cancelSubscription,
);

/**
 * GET /api/v1/subscriptions/:subId/usage
 * Thống kê số chuyến đã dùng
 */
router.get(
  "/:subId/usage",
  validateSubscriptionIdParam,
  validate,
  getSubscriptionUsage,
);

export default router;
