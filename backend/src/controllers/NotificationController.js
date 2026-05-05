import * as notificationService from "../services/notification.service.js";

/**
 * GET /api/v1/notifications
 * Lịch sử thông báo đã nhận (phân trang)
 * Role: tất cả (admin, parent, driver)
 */
export const getNotifications = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await notificationService.getNotifications(req.user, {
      page: +page || 1,
      limit: +limit || 30,
    });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/notifications/:notifId/read
 * Đánh dấu một thông báo đã đọc
 * Role: tất cả (chỉ notification của mình)
 */
export const markOneRead = async (req, res, next) => {
  try {
    const { notifId } = req.params;
    const notif = await notificationService.markOneRead(notifId, req.user.id);
    res.status(200).json({
      success: true,
      message: "Đã đánh dấu thông báo là đã đọc.",
      data: notif,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/notifications/read-all
 * Đánh dấu tất cả thông báo đã đọc
 * Role: tất cả
 * ⚠ PHẢI đặt trước /:notifId/read để không bị conflict
 */
export const markAllRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllRead(req.user.id);
    res.status(200).json({
      success: true,
      message: `Đã đánh dấu ${result.updatedCount} thông báo là đã đọc.`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/notifications/unread-count
 * Số thông báo chưa đọc
 * Role: tất cả
 */
export const getUnreadCount = async (req, res, next) => {
  try {
    const result = await notificationService.getUnreadCount(req.user.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/notifications  (Admin only)
 * Tạo thông báo hệ thống
 */
export const createNotification = async (req, res, next) => {
  try {
    const notification = await notificationService.createNotification(req.body);
    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};
