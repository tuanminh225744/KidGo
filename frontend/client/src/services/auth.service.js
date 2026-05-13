import api from "../api/axios.js";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const PENDING_EMAIL_KEY = "authPendingEmail";

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

export const registerUser = async (payload) => {
  return handleResponse(api.post("/auth/register", payload));
};

export const loginUser = async (email, password) => {
  return handleResponse(api.post("/auth/login", { email, password }));
};

export const sendOtp = async (email) => {
  return handleResponse(api.post("/auth/send-otp", { email }));
};

export const verifyOtp = async (email, otp) => {
  return handleResponse(api.post("/auth/verify-otp", { email, otp }));
};

export const refreshAuthToken = async (refreshToken) => {
  return handleResponse(api.post("/auth/refresh", { refreshToken }));
};

export const setAuthTokens = ({ accessToken, refreshToken }) => {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const clearAuthTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const savePendingEmail = (email) => {
  if (email) {
    localStorage.setItem(PENDING_EMAIL_KEY, email);
  }
};

export const getPendingEmail = () => {
  return localStorage.getItem(PENDING_EMAIL_KEY) || "";
};

export const clearPendingEmail = () => {
  localStorage.removeItem(PENDING_EMAIL_KEY);
};
