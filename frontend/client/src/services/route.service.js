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

export const createRoute = async (routeData) => {
  return handleResponse(api.post("/routes", routeData));
};

export const getRoutesByParent = async () => {
  return handleResponse(api.get("/routes"));
};

export const getRouteById = async (routeId) => {
  return handleResponse(api.get(`/routes/${routeId}`));
};
