import express from "express";
import {
  createReport,
  getReportsByTripIdHandler,
  deleteReportHandler,
  adminReplyHandler,
  getReportsByParentIdHandler,
} from "../controllers/ReportController.js";
import {
  authenticateToken,
  authorize,
} from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  validateCreateReport,
  validateTripIdParam,
  validateReportIdParam,
  validateAdminReply,
} from "../validators/reportValidators.js";

const router = express.Router();

router.use(authenticateToken);

/**
 * POST /api/v1/reports
 * Tạo report mới
 * Role: parent
 */
router.post(
  "/",
  authorize("parent"),
  validateCreateReport,
  validate,
  createReport,
);

/**
 * GET /api/v1/reports/me
 * Lấy danh sách report của phụ huynh
 * Role: parent
 */
router.get(
  "/me",
  authorize("parent"),
  getReportsByParentIdHandler,
);

/**
 * GET /api/v1/reports/trip/:tripId
 * Lấy danh sách report theo tripId
 * Role: parent | admin
 */
router.get(
  "/trip/:tripId",
  authorize("parent", "admin"),
  validateTripIdParam,
  validate,
  getReportsByTripIdHandler,
);

/**
 * DELETE /api/v1/reports/:reportId
 * Xóa report theo id
 * Role: parent | admin
 */
router.delete(
  "/:reportId",
  authorize("parent", "admin"),
  validateReportIdParam,
  validate,
  deleteReportHandler,
);

/**
 * POST /api/v1/reports/:reportId/reply
 * Admin trả lời report
 */
router.post(
  "/:reportId/reply",
  authorize("admin"),
  validateReportIdParam,
  validateAdminReply,
  validate,
  adminReplyHandler,
);

export default router;
