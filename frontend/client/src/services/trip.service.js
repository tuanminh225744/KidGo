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

export const startTrip = async (tripId) => {
  return api.post(`/trips/${tripId}/start`);
};

export const verifyOtp = async (tripId, data) => {
  return api.post(`/trips/${tripId}/verify-otp`, data);
};

export const verifyPickupPhoto = async (tripId, data) => {
  if (data instanceof File || data instanceof Blob) {
    const formData = new FormData();
    formData.append("photo", data);
    return api.post(`/trips/${tripId}/verify-pickup-photo`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  }
  return api.post(`/trips/${tripId}/verify-pickup-photo`, { photo: data });
};

export const verifyDropoffPhoto = async (tripId, data) => {
  if (data instanceof File || data instanceof Blob) {
    const formData = new FormData();
    formData.append("photo", data);
    return api.post(`/trips/${tripId}/verify-dropoff-photo`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  }
  return api.post(`/trips/${tripId}/verify-dropoff-photo`, { photo: data });
};

export const verifySecurityQuestion = async (tripId, data) => {
  return api.post(`/trips/${tripId}/verify-security-question`, data);
};

export const confirmPickup = async (tripId) => {
  return api.post(`/trips/${tripId}/confirm-pickup`);
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

export const updateEstimatedWaypoints = async (tripId, data) => {
  return api.post(`/trips/${tripId}/estimated-waypoints`, data);
};
