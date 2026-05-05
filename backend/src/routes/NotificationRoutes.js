import express from "express";
import {
  getNotifications,
  markOneRead,
  markAllRead,
  getUnreadCount,
  createNotification,
} from "../controllers/NotificationController.js";
import {
  authenticateToken,
  authorize,
} from "../middlewares/auth.middleware.js";
import { validateCreateNotification } from "../validators/notificationValidators.js";
import { validate } from "../middlewares/validate.middleware.js";
import { param } from "express-validator";

const router = express.Router();

// Tất cả routes yêu cầu xác thực
router.use(authenticateToken);

/**
 * POST /api/v1/notifications
 * Tạo thông báo hệ thống (Admin only)
 */
router.post(
  "/",
  authorize("admin"),
  validateCreateNotification,
  validate,
  createNotification
);

/**
 * GET /api/v1/notifications/unread-count
 * Số thông báo chưa đọc
 * ⚠ PHẢI đặt trước /:notifId để không bị conflict
 */
router.get("/unread-count", getUnreadCount);

/**
 * PATCH /api/v1/notifications/read-all
 * Đánh dấu tất cả đã đọc
 * ⚠ PHẢI đặt trước /:notifId/read để không bị conflict
 */
router.patch("/read-all", markAllRead);

/**
 * GET /api/v1/notifications
 * Lịch sử thông báo đã nhận (phân trang)
 * Role: tất cả
 */
router.get("/", getNotifications);

/**
 * PATCH /api/v1/notifications/:notifId/read
 * Đánh dấu một thông báo đã đọc
 */
router.patch(
  "/:notifId/read",
  [param("notifId").isMongoId().withMessage("notifId không hợp lệ.")],
  validate,
  markOneRead
);

export default router;
