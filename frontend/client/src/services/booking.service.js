import api from "../api/axios.js";

// --- Booking (One-time) ---

export const createBooking = async (bookingData) => {
  return api.post("/bookings", bookingData);
};

export const getBookings = async () => {
  return api.get("/bookings");
};

export const getBookingDetail = async (bookingId) => {
  return api.get(`/bookings/${bookingId}`);
};

export const cancelBooking = async (bookingId) => {
  return api.delete(`/bookings/${bookingId}`);
};

// --- Trip Schedule (Recurring) ---

export const createTripSchedule = async (scheduleData) => {
  return api.post("/bookings/schedules", scheduleData);
};

export const getTripSchedules = async () => {
  return api.get("/bookings/schedules");
};

export const getTripSchedulesByDate = async (date) => {
  return api.get("/bookings/schedules", { params: { date } });
};

export const toggleTripSchedule = async (scheduleId, isActive) => {
  return api.patch(`/bookings/schedules/${scheduleId}/toggle`, { isActive });
};

export const deleteTripSchedule = async (scheduleId) => {
  return api.delete(`/bookings/schedules/${scheduleId}`);
};
