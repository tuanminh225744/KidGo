import Notification from "../models/support/notification.model.js";

export const createNotification = async (data) => {
  const notification = new Notification(data);
  await notification.save();
  return notification;
};

export const getNotifications = async (user) => {
  // Admin lấy tất cả
  if (user.role === "admin") {
    return await Notification.find().sort({ createdAt: -1 });
  }
  
  // Phụ huynh và Tài xế lấy của chính họ
  return await Notification.find({ recipientId: user.id }).sort({ createdAt: -1 });
};
