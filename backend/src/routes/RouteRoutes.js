import express from "express";
import {
  getRoutes,
  createRoute,
  getRouteDetail,
  updateRoute,
  deleteRoute,
} from "../controllers/RouteController.js";
import {
  authenticateToken,
  authorize,
} from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  validateRouteIdParam,
  validateCreateRoute,
  validateUpdateRoute,
} from "../validators/routeValidators.js";

const router = express.Router();

// Tất cả routes yêu cầu xác thực và quyền parent
router.use(authenticateToken, authorize("parent"));

/**
 * GET /api/v1/routes
 * Danh sách lộ trình đã lưu
 */
router.get("/", getRoutes);

/**
 * POST /api/v1/routes
 * Tạo lộ trình mới
 */
router.post("/", validateCreateRoute, validate, createRoute);

/**
 * GET /api/v1/routes/:routeId
 * Chi tiết lộ trình
 */
router.get("/:routeId", validateRouteIdParam, validate, getRouteDetail);

/**
 * PUT /api/v1/routes/:routeId
 * Cập nhật lộ trình
 */
router.put("/:routeId", validateUpdateRoute, validate, updateRoute);

/**
 * DELETE /api/v1/routes/:routeId
 * Xóa lộ trình
 */
router.delete("/:routeId", validateRouteIdParam, validate, deleteRoute);

export default router;
