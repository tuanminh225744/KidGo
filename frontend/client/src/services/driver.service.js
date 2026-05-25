import api from "../api/axios.js";

export const getDriverProfile = async () => {
  return api.get("/drivers/me");
};

export const updateDriverProfile = async (profileData) => {
  return api.put("/drivers/me", profileData);
};

export const toggleDriverStatus = async (statusData) => {
  return api.patch("/drivers/me/status", statusData);
};

export const updateDriverLocation = async (locationData) => {
  return api.put("/drivers/me/location", locationData);
};

export const getDriverTrips = async (params = {}) => {
  return api.get("/drivers/me/trips", { params });
};

export const getDriverEarnings = async (params = {}) => {
  return api.get("/drivers/me/earnings", { params });
};

export const getDriverReviews = async (params = {}) => {
  return api.get("/drivers/me/reviews", { params });
};

export const addVehicle = async (vehicleData) => {
  return api.post("/drivers/me/vehicles", vehicleData);
};

export const getDriverVehicles = async () => {
  return api.get("/drivers/me/vehicles");
};

export const setActiveVehicle = async (vehicleId) => {
  return api.patch(`/drivers/me/vehicles/${vehicleId}/active`);
};

export const getBookingRequests = async () => {
  return api.get("/drivers/me/booking-requests");
};

export const acceptBooking = async (bookingId) => {
  return api.post(`/drivers/me/booking-requests/${bookingId}/accept`);
};

export const rejectBooking = async (bookingId) => {
  return api.post(`/drivers/me/booking-requests/${bookingId}/reject`);
};
