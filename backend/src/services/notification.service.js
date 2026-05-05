import Notification from "../models/support/notification.model.js";
import { AppError, NotFoundError } from "../utils/AppError.js";

/**
 * Tạo notification mới (admin)
 */
export const createNotification = async (data) => {
  const notification = new Notification(data);
  await notification.save();
  return notification;
};

/**
 * Lấy danh sách notifications (có phân trang)
 * - Admin: lấy tất cả
 * - Parent/Driver: chỉ lấy của mình
 */
export const getNotifications = async (user, { page = 1, limit = 30 } = {}) => {
  const query = user.role === "admin" ? {} : { recipientId: user.id };
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments(query),
  ]);

  return { page, total, totalPages: Math.ceil(total / limit), notifications };
};

/**
 * Đánh dấu một notification đã đọc
 */
export const markOneRead = async (notifId, userId) => {
  const notif = await Notification.findById(notifId);
  if (!notif) throw new NotFoundError("Thông báo không tồn tại.");
  if (notif.recipientId.toString() !== userId.toString()) {
    throw new AppError("Bạn không có quyền đánh dấu thông báo này.", 403);
  }

  notif.isRead = true;
  notif.readAt = new Date();
  await notif.save();
  return notif;
};

/**
 * Đánh dấu tất cả notifications của user là đã đọc
 */
export const markAllRead = async (userId) => {
  const result = await Notification.updateMany(
    { recipientId: userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
  return { updatedCount: result.modifiedCount };
};

/**
 * Đếm số thông báo chưa đọc của user
 */
export const getUnreadCount = async (userId) => {
  const count = await Notification.countDocuments({
    recipientId: userId,
    isRead: false,
  });
  return { unreadCount: count };
};
