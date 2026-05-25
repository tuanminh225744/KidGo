import api from "../api/axios.js";

export const getNotifications = async (params = {}) => {
  return api.get("/notifications", { params });
};

export const getUnreadCount = async () => {
  return api.get("/notifications/unread-count");
};

export const markAllRead = async () => {
  return api.patch("/notifications/read-all");
};

export const markOneRead = async (notifId) => {
  return api.patch(`/notifications/${notifId}/read`);
};
