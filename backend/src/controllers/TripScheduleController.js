import * as tripScheduleService from "../services/tripSchedule.service.js";
import { AppError, AuthorizationError } from "../utils/AppError.js";

/**
 * GET /api/v1/bookings/schedules
 * Danh sách lịch định kỳ
 */
export const getSchedules = async (req, res, next) => {
  try {
    const { date } = req.query;
    const schedules = date
      ? await tripScheduleService.getSchedulesByParentAndDate(req.user.id, date)
      : await tripScheduleService.getSchedulesByParent(req.user.id);

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules,
    });
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

    const schedule = await tripScheduleService.createTripSchedule(scheduleData);

    res.status(201).json({
      success: true,
      message: "Tạo lịch định kỳ thành công.",
      data: schedule,
    });
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
    const schedule = await tripScheduleService.getTripScheduleById(
      req.params.scheduleId,
    );

    // Verify ownership
    if (schedule.parentId.toString() !== req.user.id.toString()) {
      throw new AuthorizationError("Bạn không có quyền truy cập lịch này.");
    }

    res.status(200).json({
      success: true,
      data: schedule,
    });
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
    const schedule = await tripScheduleService.getTripScheduleById(
      req.params.scheduleId,
    );

    // Verify ownership
    if (schedule.parentId.toString() !== req.user.id.toString()) {
      throw new AuthorizationError("Bạn không có quyền cập nhật lịch này.");
    }

    const updated = await tripScheduleService.updateTripSchedule(
      req.params.scheduleId,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Cập nhật lịch định kỳ thành công.",
      data: updated,
    });
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

    const schedule = await tripScheduleService.getTripScheduleById(
      req.params.scheduleId,
    );

    // Verify ownership
    if (schedule.parentId.toString() !== req.user.id.toString()) {
      throw new AuthorizationError("Bạn không có quyền thay đổi lịch này.");
    }

    const updated = await tripScheduleService.updateTripSchedule(
      req.params.scheduleId,
      { isActive },
    );

    res.status(200).json({
      success: true,
      message: `${isActive ? "Bật" : "Tắt"} lịch định kỳ thành công.`,
      data: updated,
    });
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
    const schedule = await tripScheduleService.getTripScheduleById(
      req.params.scheduleId,
    );

    // Verify ownership
    if (schedule.parentId.toString() !== req.user.id.toString()) {
      throw new AuthorizationError("Bạn không có quyền xóa lịch này.");
    }

    await tripScheduleService.cancelTripSchedule(req.params.scheduleId);

    res.status(200).json({
      success: true,
      message: "Xóa lịch định kỳ thành công.",
    });
  } catch (error) {
    next(error);
  }
};
