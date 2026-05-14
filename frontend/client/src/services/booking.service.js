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

// --- Booking (One-time) ---

export const createBooking = async (bookingData) => {
  return handleResponse(api.post("/bookings", bookingData));
};

export const getBookings = async () => {
  return handleResponse(api.get("/bookings"));
};

// --- Trip Schedule (Recurring) ---

export const createTripSchedule = async (scheduleData) => {
  return handleResponse(api.post("/bookings/schedules", scheduleData));
};

export const getTripSchedules = async () => {
  return handleResponse(api.get("/bookings/schedules"));
};
