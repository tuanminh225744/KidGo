import express from "express";
import {
  getSchedules,
  createSchedule,
  getScheduleDetail,
  updateSchedule,
  toggleSchedule,
  deleteSchedule,
} from "../controllers/TripScheduleController.js";
import {
  authenticateToken,
  authorize,
} from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  validateScheduleIdParam,
  validateCreateSchedule,
  validateUpdateSchedule,
  validateToggleSchedule,
} from "../validators/tripScheduleValidators.js";

const router = express.Router();

// Tất cả routes yêu cầu xác thực và quyền parent
router.use(authenticateToken, authorize("parent"));

/**
 * GET /api/v1/bookings/schedules
 * Danh sách lịch định kỳ
 */
router.get("/", getSchedules);

/**
 * POST /api/v1/bookings/schedules
 * Tạo lịch định kỳ
 */
router.post("/", validateCreateSchedule, validate, createSchedule);

/**
 * GET /api/v1/bookings/schedules/:scheduleId
 * Chi tiết lịch định kỳ
 */
router.get(
  "/:scheduleId",
  validateScheduleIdParam,
  validate,
  getScheduleDetail,
);

/**
 * PUT /api/v1/bookings/schedules/:scheduleId
 * Cập nhật lịch định kỳ
 */
router.put("/:scheduleId", validateUpdateSchedule, validate, updateSchedule);

/**
 * PATCH /api/v1/bookings/schedules/:scheduleId/toggle
 * Bật/tắt lịch định kỳ
 */
router.patch(
  "/:scheduleId/toggle",
  validateToggleSchedule,
  validate,
  toggleSchedule,
);

/**
 * DELETE /api/v1/bookings/schedules/:scheduleId
 * Xóa lịch định kỳ
 */
router.delete(
  "/:scheduleId",
  validateScheduleIdParam,
  validate,
  deleteSchedule,
);

export default router;
