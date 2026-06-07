import * as tripScheduleService from "../services/tripSchedule.service.js";
import { AppError, AuthorizationError } from "../utils/AppError.js";
import { success, error } from "../utils/response.js";

/**
 * GET /api/v1/bookings/schedules
 * Danh sách lịch định kỳ
 */
export const getSchedules = async (req, res, next) => {
  try {
    const { date } = req.query;
    const result = date
      ? await tripScheduleService.getSchedulesByParentAndDate(req.user.id, date)
      : await tripScheduleService.getSchedulesByParent(req.user.id);
    return success(
      res,
      { count: result.data.length, data: result.data },
      result.message,
      200,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/bookings/schedules
 * Tạo lịch định kỳ
 */
export const createSchedule = async (req, res, next) => {
  try {
    const {
      kidId,
      routeId,
      repeatDays,
      pickupTime,
      startDate,
      endDate,
      preferredDriverId,
      subscriptionId,
    } = req.body;

    const scheduleData = {
      parentId: req.user.id,
      kidId,
      routeId,
      repeatDays,
      pickupTime,
      startDate,
      endDate,
      preferredDriverId: preferredDriverId || null,
      subscriptionId: subscriptionId || null,
      isActive: false,
    };

    const result = await tripScheduleService.createTripSchedule(scheduleData);
    return success(
      res,
      result.data,
      result.message || "Tạo lịch định kỳ thành công.",
      201,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/bookings/schedules/:scheduleId
 * Chi tiết lịch định kỳ
 */
export const getScheduleDetail = async (req, res, next) => {
  try {
    const result = await tripScheduleService.getTripScheduleById(
      req.params.scheduleId,
    );
    const schedule = result.data;
    // Verify ownership
    if (schedule.parentId.toString() !== req.user.id.toString()) {
      throw new AuthorizationError("Bạn không có quyền truy cập lịch này.");
    }
    return success(res, schedule, result.message, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/bookings/schedules/:scheduleId
 * Cập nhật lịch định kỳ
 */
export const updateSchedule = async (req, res, next) => {
  try {
    const fetch = await tripScheduleService.getTripScheduleById(
      req.params.scheduleId,
    );
    const schedule = fetch.data;
    // Verify ownership
    if (schedule.parentId.toString() !== req.user.id.toString()) {
      throw new AuthorizationError("Bạn không có quyền cập nhật lịch này.");
    }
    const updated = await tripScheduleService.updateTripSchedule(
      req.params.scheduleId,
      req.body,
    );
    return success(
      res,
      updated.data,
      updated.message || "Cập nhật lịch định kỳ thành công.",
      200,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/bookings/schedules/:scheduleId/toggle
 * Bật/tắt lịch định kỳ
 */
export const toggleSchedule = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    const fetch = await tripScheduleService.getTripScheduleById(
      req.params.scheduleId,
    );
    const schedule = fetch.data;
    // Verify ownership
    if (schedule.parentId.toString() !== req.user.id.toString()) {
      throw new AuthorizationError("Bạn không có quyền thay đổi lịch này.");
    }
    const updated = await tripScheduleService.updateTripSchedule(
      req.params.scheduleId,
      { isActive },
    );
    return success(
      res,
      updated.data,
      updated.message || `${isActive ? "Bật" : "Tắt"} lịch định kỳ thành công.`,
      200,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/bookings/schedules/:scheduleId
 * Xóa lịch định kỳ
 */
export const deleteSchedule = async (req, res, next) => {
  try {
    const fetch = await tripScheduleService.getTripScheduleById(
      req.params.scheduleId,
    );
    const schedule = fetch.data;
    // Verify ownership
    if (schedule.parentId.toString() !== req.user.id.toString()) {
      throw new AuthorizationError("Bạn không có quyền xóa lịch này.");
    }
    await tripScheduleService.cancelTripSchedule(req.params.scheduleId);
    return success(res, null, "Xóa lịch định kỳ thành công.", 200);
  } catch (error) {
    next(error);
  }
};
