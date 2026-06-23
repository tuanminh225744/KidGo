import { createNotification } from "../../services/notification.service.js";
import { getIo } from "../../sockets/socketManager.js";
import User from "../../models/core/user.model.js";

/**
 * Gửi cảnh báo Alert (chỉ gửi cho Driver)
 */
export const sendAlert = async (trip, title, message) => {
  try {
    // 1. Tạo notification cho Driver
    await createNotification({
      recipientId: trip.driverId,
      recipientType: "driver",
      type: "alert",
      title,
      body: message,
      tripId: trip._id,
    });

    // 2. Bắn Socket.IO cho Driver
    const io = getIo();
    io.of("/driver").to(trip.driverId.toString()).emit("trip_alert", {
      tripId: trip._id,
      title,
      message,
      type: "alert",
    });
  } catch (error) {
    console.error("[TripMonitor] Lỗi khi gửi Alert:", error);
  }
};

/**
 * Gửi cảnh báo Danger (gửi cho Driver, Parent, Admin)
 */
export const sendDanger = async (trip, title, message) => {
  try {
    const io = getIo();

    // 1. Gửi cho Driver
    await createNotification({
      recipientId: trip.driverId,
      recipientType: "driver",
      type: "danger",
      title,
      body: message,
      tripId: trip._id,
    });
    io.of("/driver").to(trip.driverId.toString()).emit("trip_danger", {
      tripId: trip._id,
      title,
      message,
      type: "danger",
    });

    // 2. Gửi cho Parent
    if (trip.parentId) {
      await createNotification({
        recipientId: trip.parentId,
        recipientType: "parent",
        type: "danger",
        title,
        body: message,
        tripId: trip._id,
      });
      io.of("/parent").to(trip.parentId.toString()).emit("trip_danger", {
        tripId: trip._id,
        title,
        message,
        type: "danger",
      });
    }

    // 3. Gửi cho Admin (lấy admin đầu tiên)
    const adminUser = await User.findOne({ role: "admin" });
    if (adminUser) {
      await createNotification({
        recipientId: adminUser._id,
        recipientType: "admin",
        type: "danger",
        title,
        body: message,
        tripId: trip._id,
      });
      io.of("/admin").to(adminUser._id.toString()).emit("trip_danger", {
        tripId: trip._id,
        title,
        message,
        type: "danger",
      });
    }
  } catch (error) {
    console.error("[TripMonitor] Lỗi khi gửi Danger:", error);
  }
};
