import express from "express";
import {
  getParentAlertsHandler,
  getAlertDetail,
  acknowledgeAlertHandler,
  resolveAlertController,
  escalateAlertController,
} from "../controllers/AlertController.js";
import {
  authenticateToken,
  authorize,
} from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  validateAlertId,
  validateAlertQueryParams,
  validateResolveAlertBody,
} from "../validators/alertValidators.js";

const router = express.Router();

// Tất cả routes yêu cầu xác thực
router.use(authenticateToken);

/**
 * GET /api/v1/alerts
 * Danh sách alert của phụ huynh
 * Role: parent
 */
router.get(
  "/",
  authorize("parent"),
  validateAlertQueryParams,
  validate,
  getParentAlertsHandler
);

/**
 * GET /api/v1/alerts/:alertId
 * Chi tiết alert (parent + admin)
 * ⚠ PHẢI đặt trước các route có suffix (/acknowledge, /resolve, /escalate)
 */
router.get(
  "/:alertId",
  validateAlertId,
  validate,
  getAlertDetail
);

/**
 * PATCH /api/v1/alerts/:alertId/acknowledge
 * Phụ huynh xác nhận đã biết
 * Role: parent
 */
router.patch(
  "/:alertId/acknowledge",
  authorize("parent"),
  validateAlertId,
  validate,
  acknowledgeAlertHandler
);

/**
 * PATCH /api/v1/alerts/:alertId/resolve
 * Đóng alert (parent hoặc admin)
 */
router.patch(
  "/:alertId/resolve",
  authorize("parent", "admin"),
  validateAlertId,
  validateResolveAlertBody,
  validate,
  resolveAlertController
);

/**
 * PATCH /api/v1/alerts/:alertId/escalate
 * Phụ huynh yêu cầu admin hỗ trợ
 * Role: parent
 */
router.patch(
  "/:alertId/escalate",
  authorize("parent"),
  validateAlertId,
  validate,
  escalateAlertController
);

export default router;
