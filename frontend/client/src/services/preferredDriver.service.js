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

export const getPreferredDrivers = async () => {
  return handleResponse(api.get("/preferred-drivers"));
};

export const addPreferredDriver = async (driverData) => {
  return handleResponse(api.post("/preferred-drivers", driverData));
};

export const updatePreferredDriver = async (driverId, updateData) => {
  return handleResponse(api.put(`/preferred-drivers/${driverId}`, updateData));
};

export const removePreferredDriver = async (driverId) => {
  return handleResponse(api.delete(`/preferred-drivers/${driverId}`));
};
