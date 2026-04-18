import Alert from "../models/safetyAndLogs/alert.model.js";
import Notification from "../models/support/notification.model.js";
import { getIo } from "../sockets/socketManager.js";

/**
 * Tạo một cảnh báo mới và gửi thông báo real-time
 * @param {Object} alertData - Dữ liệu cảnh báo
 * @param {String} alertData.tripId - ID chuyến đi
 * @param {String} alertData.driverId - ID tài xế
 * @param {String} alertData.parentId - ID phụ huynh
 * @param {String} alertData.type - Loại cảnh báo (detour, unplanned_stop, speed, gps_lost, early_end, major_detour)
 * @param {String} alertData.level - Mức độ (info, warning, critical)
 * @param {Object} alertData.location - Vị trí (GeoJSON Point)
 * @param {Object} alertData.metadata - Metadata bổ sung
 * @param {String} alertData.note - Ghi chú
 * @returns {Object} Alert document đã tạo
 */
export const createAlert = async (alertData) => {
  try {
    const alert = new Alert(alertData);
    await alert.save();

    // Tạo notification liên kết
    const notification = new Notification({
      recipientId: alertData.parentId,
      recipientType: "parent",
      type: "alert",
      title: getAlertTitle(alertData.type),
      body: getAlertMessage(alertData.type, alertData.metadata),
      refId: alert._id,
      channel: "push",
    });
    await notification.save();

    // Emit socket cho parent và driver
    const io = getIo();
    io.of("/parent")
      .to(alertData.parentId.toString())
      .emit("alert_created", {
        alertId: alert._id,
        type: alertData.type,
        level: alertData.level,
        message: getAlertMessage(alertData.type, alertData.metadata),
        location: alertData.location,
        tripId: alertData.tripId,
      });

    if (alertData.driverId) {
      io.of("/driver")
        .to(alertData.driverId.toString())
        .emit("alert_created", {
          alertId: alert._id,
          type: alertData.type,
          level: alertData.level,
          message: getAlertMessage(alertData.type, alertData.metadata),
          location: alertData.location,
          tripId: alertData.tripId,
        });
    }

    console.log(
      `[Alert Service] Cảnh báo ${alertData.type} đã được tạo cho trip ${alertData.tripId}`,
    );
    return alert;
  } catch (error) {
    console.error("[Alert Service Error] Lỗi tạo cảnh báo:", error);
    throw new Error(`Lỗi tạo cảnh báo: ${error.message}`);
  }
};

/**
 * Giải quyết cảnh báo
 * @param {String} alertId - ID cảnh báo
 * @param {String} resolvedBy - Người giải quyết (parent, driver, admin, system)
 * @param {String} note - Ghi chú giải quyết
 * @returns {Object} Alert đã cập nhật
 */
export const resolveAlert = async (alertId, resolvedBy, note = "") => {
  try {
    const alert = await Alert.findById(alertId);
    if (!alert) throw new Error("Cảnh báo không tồn tại");

    alert.status = "resolved";
    alert.resolvedAt = new Date();
    alert.resolvedBy = resolvedBy;
    alert.note = note;
    await alert.save();

    // Emit socket
    const io = getIo();
    io.of("/parent").to(alert.parentId.toString()).emit("alert_resolved", {
      alertId: alert._id,
      resolvedBy,
      note,
    });

    if (alert.driverId) {
      io.of("/driver").to(alert.driverId.toString()).emit("alert_resolved", {
        alertId: alert._id,
        resolvedBy,
        note,
      });
    }

    console.log(
      `[Alert Service] Cảnh báo ${alertId} đã được giải quyết bởi ${resolvedBy}`,
    );
    return alert;
  } catch (error) {
    console.error("[Alert Service Error] Lỗi giải quyết cảnh báo:", error);
    throw new Error(`Lỗi giải quyết cảnh báo: ${error.message}`);
  }
};

/**
 * Lấy danh sách cảnh báo theo trip
 * @param {String} tripId - ID chuyến đi
 * @param {Object} filters - Bộ lọc (status, type)
 * @returns {Array} Danh sách alerts
 */
export const getAlertsByTrip = async (tripId, filters = {}) => {
  try {
    const query = { tripId };
    if (filters.status) query.status = filters.status;
    if (filters.type) query.type = filters.type;

    const alerts = await Alert.find(query).sort({ detectedAt: -1 });
    return alerts;
  } catch (error) {
    console.error("[Alert Service Error] Lỗi lấy cảnh báo:", error);
    throw new Error(`Lỗi lấy cảnh báo: ${error.message}`);
  }
};

/**
 * Escalate cảnh báo (chuyển cho admin)
 * @param {String} alertId - ID cảnh báo
 * @returns {Object} Alert đã cập nhật
 */
export const escalateAlert = async (alertId) => {
  try {
    const alert = await Alert.findById(alertId);
    if (!alert) throw new Error("Cảnh báo không tồn tại");

    alert.status = "escalated";
    await alert.save();
    // Emit socket cho admin hoặc parent/driver
    const io = getIo();
    io.of("/parent").to(alert.parentId.toString()).emit("alert_escalated", {
      alertId: alert._id,
      message: "Cảnh báo đã được chuyển cho quản trị viên xử lý.",
    });

    if (alert.driverId) {
      io.of("/driver").to(alert.driverId.toString()).emit("alert_escalated", {
        alertId: alert._id,
        message: "Cảnh báo đã được chuyển cho quản trị viên xử lý.",
      });
    }
    // Có thể gửi email hoặc notification cho admin ở đây

    console.log(`[Alert Service] Cảnh báo ${alertId} đã được escalate`);
    return alert;
  } catch (error) {
    console.error("[Alert Service Error] Lỗi escalate cảnh báo:", error);
    throw new Error(`Lỗi escalate cảnh báo: ${error.message}`);
  }
};

// Helper functions
const getAlertTitle = (type) => {
  const titles = {
    detour: "Cảnh báo Lệch Tuyến",
    unplanned_stop: "Cảnh báo Dừng Bất Thường",
    speed: "Cảnh báo Tốc Độ",
    gps_lost: "Cảnh báo Mất Tín Hiệu GPS",
    early_end: "Cảnh báo Kết Thúc Sớm",
    major_detour: "Cảnh báo Lệch Tuyến Nghiêm Trọng",
  };
  return titles[type] || "Cảnh báo";
};

const getAlertMessage = (type, metadata = {}) => {
  const messages = {
    detour: `Tài xế đã lệch khỏi tuyến đường dự kiến khoảng ${metadata.deviation_meters || 0}m.`,
    unplanned_stop: `Tài xế đã dừng lại ngoài kế hoạch trong ${metadata.stop_duration || 0} phút.`,
    speed: `Tài xế đang chạy với tốc độ ${metadata.speed_kmh || 0}km/h.`,
    gps_lost: "Mất tín hiệu GPS từ thiết bị tài xế.",
    early_end: "Chuyến đi kết thúc sớm hơn dự kiến.",
    major_detour: `Tài xế đã lệch tuyến nghiêm trọng khoảng ${metadata.deviation_meters || 0}m.`,
  };
  return messages[type] || "Có cảnh báo an toàn.";
};
