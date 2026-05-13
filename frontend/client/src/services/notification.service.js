import api from "../api/axios.js";

const handleResponse = async (promise) => {
  try {
    const { data } = await promise;
    return data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Đã có lỗi xảy ra khi gọi API",
    };
  }
};

export const getUnreadCount = async () => {
  return handleResponse(api.get("/notifications/unread-count"));
};
