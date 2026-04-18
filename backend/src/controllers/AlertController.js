import e from "cors";
import {
  getAlertsByTrip,
  resolveAlert,
  escalateAlert,
} from "../services/alert.service.js";
import { AppError, NotFoundError } from "../utils/AppError.js";

/**
 * Controller cho các API liên quan đến cảnh báo
 */

/**
 * Lấy danh sách cảnh báo cho một chuyến đi
 */
export const getAlerts = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { status, type } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (type) filters.type = type;

    const alerts = await getAlertsByTrip(tripId, filters);
    res.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Giải quyết cảnh báo
 */
export const resolveAlertController = async (req, res, next) => {
  try {
    const { alertId } = req.params;
    const { resolvedBy, note } = req.body;

    const alert = await resolveAlert(alertId, resolvedBy, note);
    res.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Escalate cảnh báo cho admin
 */
export const escalateAlertController = async (req, res, next) => {
  try {
    const { alertId } = req.params;

    const alert = await escalateAlert(alertId);
    res.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};
