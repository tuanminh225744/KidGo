import api from "../api/axios.js";

export const getTrips = async (params = {}) => {
  return api.get("/trips", { params });
};

export const getActiveTripsList = async () => {
  return api.get("/trips/active");
};

export const getTripDetails = async (tripId) => {
  return api.get(`/trips/${tripId}`);
};

export const getLocationLog = async (tripId) => {
  return api.get(`/trips/${tripId}/location-log`);
};

export const startTrip = async (tripId) => {
  return api.post(`/trips/${tripId}/start`);
};

export const confirmPickup = async (tripId, data) => {
  return api.post(`/trips/${tripId}/confirm-pickup`, data);
};

export const confirmDropoff = async (tripId) => {
  return api.post(`/trips/${tripId}/confirm-dropoff`);
};

export const cancelTrip = async (tripId, data) => {
  return api.post(`/trips/${tripId}/cancel`, data);
};

export const gpsTick = async (tripId, data) => {
  return api.post(`/trips/${tripId}/gps-tick`, data);
};
