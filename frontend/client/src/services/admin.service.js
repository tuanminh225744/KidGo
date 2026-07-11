import api from "../api/axios.js";

export const getDrivers = async (params = {}) => {
  return api.get("/admin/drivers", { params });
};

export const getFullAdminDashboard = async () => {
  return api.get("/admin/dashboard/full");
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

export const getDriverEarnings = async (driverId, params = {}) => {
  return api.get(`/admin/drivers/${driverId}/earnings`, { params });
};

export const suspendDriver = async (driverId) => {
  return api.patch(`/admin/drivers/${driverId}/suspend`);
};

export const reactivateDriver = async (driverId) => {
  return api.patch(`/admin/drivers/${driverId}/reactivate`);
};

export const updateDriverCertification = async (driverId, certificationLevel) => {
  return api.patch(`/admin/drivers/${driverId}/certification`, { certificationLevel });
};

// Users / Parents
export const getParents = async (params = {}) => {
  return api.get("/admin/users", { params });
};

export const getParentDetail = async (userId) => {
  return api.get(`/admin/users/${userId}`);
};

export const suspendParent = async (userId) => {
  return api.patch(`/admin/users/${userId}/suspend`);
};

export const reactivateParent = async (userId) => {
  return api.patch(`/admin/users/${userId}/reactivate`);
};
