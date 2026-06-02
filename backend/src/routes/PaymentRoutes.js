import express from "express";
import {
  createPayment,
  previewPayment,
  getPayment,
  updatePaymentStatus,
} from "../controllers/PaymentController.js";
import {
  authenticateToken,
  authorize,
} from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  validatePaymentIdParam,
  validateCreatePayment,
  validatePreviewPayment,
  validateUpdatePaymentStatus,
} from "../validators/paymentValidators.js";

const router = express.Router();

// Yêu cầu đăng nhập cho tất cả API thanh toán
router.use(authenticateToken);

/**
 * POST /api/v1/payments/preview
 * Tính giá thanh toán
 */
router.post(
  "/preview",
  authorize("parent"),
  validatePreviewPayment,
  validate,
  previewPayment
);

/**
 * POST /api/v1/payments
 * Tạo mới một khoản thanh toán. Chỉ dành cho parent.
 */
router.post(
  "/",
  authorize("parent"),
  validateCreatePayment,
  validate,
  createPayment
);

/**
 * GET /api/v1/payments/:paymentId
 * Lấy chi tiết thông tin thanh toán. Cả parent và driver đều dùng được.
 */
router.get(
  "/:paymentId",
  authorize("parent", "driver", "admin"),
  validatePaymentIdParam,
  validate,
  getPayment
);

/**
 * PATCH /api/v1/payments/:paymentId/status
 * Cập nhật trạng thái thanh toán. Cả parent và driver đều dùng được.
 */
router.patch(
  "/:paymentId/status",
  authorize("parent", "driver"),
  validateUpdatePaymentStatus,
  validate,
  updatePaymentStatus
);

export default router;
