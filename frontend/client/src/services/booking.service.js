import api from "../api/axios.js";

// --- Booking (One-time) ---

export const createBooking = async (bookingData) => {
  return api.post("/bookings", bookingData);
};

export const getBookings = async () => {
  return api.get("/bookings");
};

// --- Trip Schedule (Recurring) ---

export const createTripSchedule = async (scheduleData) => {
  return api.post("/bookings/schedules", scheduleData);
};

export const getTripSchedules = async () => {
  return api.get("/bookings/schedules");
};
