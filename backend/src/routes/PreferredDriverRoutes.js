import express from "express";
import {
  getPreferredDrivers,
  addPreferredDriver,
  updatePreferredDriver,
  removePreferredDriver,
} from "../controllers/PreferredDriverController.js";
import {
  authenticateToken,
  authorize,
} from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  validateDriverIdParam,
  validateAddPreferredDriver,
  validateUpdatePreferredDriver,
} from "../validators/preferredDriverValidators.js";

const router = express.Router();

// Tất cả routes yêu cầu xác thực và quyền parent
router.use(authenticateToken, authorize("parent"));

/**
 * GET /api/v1/preferred-drivers
 * Danh sách tài xế ưu tiên
 */
router.get("/", getPreferredDrivers);

/**
 * POST /api/v1/preferred-drivers
 * Thêm tài xế vào danh sách ưu tiên
 */
router.post("/", validateAddPreferredDriver, validate, addPreferredDriver);

/**
 * PUT /api/v1/preferred-drivers/:driverId
 * Cập nhật nickname, priority
 */
router.put(
  "/:driverId",
  validateUpdatePreferredDriver,
  validate,
  updatePreferredDriver,
);

/**
 * DELETE /api/v1/preferred-drivers/:driverId
 * Xóa khỏi danh sách ưu tiên
 */
router.delete(
  "/:driverId",
  validateDriverIdParam,
  validate,
  removePreferredDriver,
);

export default router;
