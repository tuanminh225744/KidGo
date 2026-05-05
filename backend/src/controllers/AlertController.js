import {
  getParentAlerts,
  getAlertById,
  acknowledgeAlert,
  resolveAlert,
  escalateAlert,
} from "../services/alert.service.js";
import { AppError } from "../utils/AppError.js";

/**
 * GET /api/v1/alerts
 * Danh sách alert của phụ huynh (filter + phân trang)
 * Role: parent
 */
export const getParentAlertsHandler = async (req, res, next) => {
  try {
    const parentId = req.user.id;
    const { status, type, page, limit } = req.query;
    const result = await getParentAlerts(parentId, {
      status,
      type,
      page: +page,
      limit: +limit,
    });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/alerts/:alertId
 * Chi tiết alert (parent + admin)
 */
export const getAlertDetail = async (req, res, next) => {
  try {
    const { alertId } = req.params;
    const alert = await getAlertById(alertId);

    // Parent chỉ xem alert của mình
    if (
      req.user.role === "parent" &&
      alert.parentId.toString() !== req.user.id.toString()
    ) {
      return next(new AppError("Bạn không có quyền xem cảnh báo này.", 403));
    }

    res.status(200).json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/alerts/:alertId/acknowledge
 * Phụ huynh xác nhận đã biết
 * Role: parent
 */
export const acknowledgeAlertHandler = async (req, res, next) => {
  try {
    const { alertId } = req.params;
    const parentId = req.user.id;
    const alert = await acknowledgeAlert(alertId, parentId);
    res.status(200).json({
      success: true,
      message: "Đã xác nhận cảnh báo.",
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/alerts/:alertId/resolve
 * Đóng alert (parent hoặc admin)
 */
export const resolveAlertController = async (req, res, next) => {
  try {
    const { alertId } = req.params;
    const resolvedBy = req.user.role; // "parent" | "admin"
    const { note } = req.body;
    const alert = await resolveAlert(alertId, resolvedBy, note);
    res.status(200).json({
      success: true,
      message: "Cảnh báo đã được đóng.",
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/alerts/:alertId/escalate
 * Phụ huynh yêu cầu admin hỗ trợ
 * Role: parent
 */
export const escalateAlertController = async (req, res, next) => {
  try {
    const { alertId } = req.params;
    const alert = await escalateAlert(alertId);
    res.status(200).json({
      success: true,
      message: "Đã gửi yêu cầu hỗ trợ đến admin.",
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};
