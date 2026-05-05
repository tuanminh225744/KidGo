import Alert from "../models/safetyAndLogs/alert.model.js";
import { resolveAlert, markFalsePositive } from "../services/alert.service.js";
import { NotFoundError } from "../utils/AppError.js";

/**
 * GET /api/v1/admin/alerts
 * Tất cả alert (filter theo status, type, driverId, phân trang)
 * Role: admin
 */
export const getAllAlerts = async (req, res, next) => {
  try {
    const { status, type, driverId, tripId, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (driverId) query.driverId = driverId;
    if (tripId) query.tripId = tripId;

    const skip = (+page - 1) * +limit;
    const [alerts, total] = await Promise.all([
      Alert.find(query)
        .sort({ detectedAt: -1 })
        .skip(skip)
        .limit(+limit)
        .populate("tripId", "status plannedRoute scheduledPickupTime")
        .populate("driverId", "user licenseNumber")
        .populate("parentId", "fullName phone"),
      Alert.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      page: +page,
      total,
      totalPages: Math.ceil(total / +limit),
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/alerts/open
 * Tất cả alert đang mở (open + escalated)
 * Role: admin
 * ⚠ PHẢI đặt trước /:alertId
 */
export const getOpenAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.find({
      status: { $in: ["open", "escalated"] },
    })
      .sort({ detectedAt: -1 })
      .populate("tripId", "status plannedRoute")
      .populate("driverId", "user licenseNumber")
      .populate("parentId", "fullName phone");

    res.status(200).json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/alerts/:alertId/resolve
 * Admin đóng alert
 * Role: admin
 */
export const resolveAlertAdmin = async (req, res, next) => {
  try {
    const { alertId } = req.params;
    const { note } = req.body;
    const alert = await resolveAlert(alertId, "admin", note);
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
 * PATCH /api/v1/admin/alerts/:alertId/false-positive
 * Admin đánh dấu cảnh báo sai
 * Role: admin
 */
export const markFalsePositiveHandler = async (req, res, next) => {
  try {
    const { alertId } = req.params;
    const alert = await markFalsePositive(alertId);
    res.status(200).json({
      success: true,
      message: "Đã đánh dấu là cảnh báo sai.",
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};
