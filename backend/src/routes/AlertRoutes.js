import express from "express";
import {
  getAlerts,
  resolveAlertController,
  escalateAlertController,
} from "../controllers/AlertController.js";
import {
  authenticateToken,
  authorize,
} from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  validateTripId,
  validateAlertId,
  validateAlertQueryParams,
  validateResolveAlertBody,
} from "../validators/alertValidators.js";

const router = express.Router();

/**
 * GET /alerts/:tripId
 * Lấy danh sách cảnh báo cho một chuyến đi
 * Query params: status (open, resolved, etc.), type (speed, detour, etc.)
 * Yêu cầu: Authentication + Validation
 */
router.get(
  "/:tripId",
  authenticateToken,
  validateTripId,
  validateAlertQueryParams,
  validate,
  getAlerts,
);

/**
 * PUT /alerts/:alertId/resolve
 * Giải quyết cảnh báo
 * Body: { resolvedBy: 'parent' | 'driver' | 'admin' | 'system', note?: string }
 * Yêu cầu: Authentication + Validation
 */
router.put(
  "/:alertId/resolve",
  authenticateToken,
  validateAlertId,
  validateResolveAlertBody,
  validate,
  resolveAlertController,
);

/**
 * POST /alerts/:alertId/escalate
 * Escalate cảnh báo cho admin
 * Yêu cầu: Authentication + Admin Role
 */
router.post(
  "/:alertId/escalate",
  authenticateToken,
  authorize("admin"),
  validateAlertId,
  validate,
  escalateAlertController,
);

export default router;
