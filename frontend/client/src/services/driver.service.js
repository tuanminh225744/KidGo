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

export const getDriverVehicleByDriverId = async (driverId) => {
  return api.get(`/drivers/${driverId}/vehicle`);
};

export const uploadVehiclePhoto = async (vehicleId, file) => {
  const formData = new FormData();
  formData.append("photo", file);
  return api.post(`/drivers/me/vehicles/${vehicleId}/photo`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getDriverById = async (driverId) => {
  return api.get(`/drivers/${driverId}`);
};

export const getDriverLocation = async (driverId) => {
  return api.get(`/drivers/${driverId}/location`);
};

export const getDriverEarningsStats = async (driverId, params = {}) => {
  return api.get(`/drivers/${driverId}/stats/earnings`, { params });
};

export const getDriverTripsStats = async (driverId, params = {}) => {
  return api.get(`/drivers/${driverId}/stats/trips`, { params });
};

export const getDriverMeEarnings = async (params = {}) => {
  return api.get('/drivers/me/earnings', { params });
};

export const getDriverMeTripsStats = async (params = {}) => {
  return api.get('/drivers/me/stats/trips', { params });
};

export const getDriverDailySchedules = async (date) => {
  return api.get('/drivers/me/schedules/daily', { params: { date } });
};

export const getDriverSubscriptionSchedules = async () => {
  return api.get('/drivers/me/schedules/subscriptions');
};
