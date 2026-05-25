import api from "../api/axios.js";

export const getPreferredDrivers = async () => {
  return api.get("/preferred-drivers");
};

export const addPreferredDriver = async (driverData) => {
  return api.post("/preferred-drivers", driverData);
};

export const updatePreferredDriver = async (driverId, updateData) => {
  return api.put(`/preferred-drivers/${driverId}`, updateData);
};

export const removePreferredDriver = async (driverId) => {
  return api.delete(`/preferred-drivers/${driverId}`);
};
