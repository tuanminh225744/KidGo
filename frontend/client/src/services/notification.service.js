import api from "../api/axios.js";

export const getUnreadCount = async () => {
  return api.get("/notifications/unread-count");
};
