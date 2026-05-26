import api from "../api/axios.js";

export const getDrivers = async (params = {}) => {
  return api.get("/admin/drivers", { params });
};

export const approveDriver = async (driverId) => {
  return api.patch(`/admin/drivers/${driverId}/approve`);
};

export const rejectDriver = async (driverId) => {
  return api.patch(`/admin/drivers/${driverId}/reject`);
};

export const getDriverDetail = async (driverId) => {
  return api.get(`/admin/drivers/${driverId}`);
};
