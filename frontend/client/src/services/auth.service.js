import api from "../api/axios.js";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const PENDING_EMAIL_KEY = "authPendingEmail";

export const registerUser = async (payload) => {
  return api.post("/auth/register", payload);
};

export const registerDriver = async (payload) => {
  return api.post("/auth/register-driver", payload);
};

export const loginUser = async (email, password) => {
  return api.post("/auth/login", { email, password });
};

export const sendOtp = async (email) => {
  return api.post("/auth/send-otp", { email });
};

export const verifyOtp = async (email, otp) => {
  return api.post("/auth/verify-otp", { email, otp });
};

export const refreshAuthToken = async (refreshToken) => {
  return api.post("/auth/refresh", { refreshToken });
};

export const logoutApi = async () => {
  return api.post("/auth/logout");
};

export const setAuthTokens = ({ accessToken, refreshToken }) => {
  if (accessToken) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }
  if (refreshToken) {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const clearAuthTokens = () => {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const savePendingEmail = (email) => {
  if (email) {
    sessionStorage.setItem(PENDING_EMAIL_KEY, email);
  }
};

export const getPendingEmail = () => {
  return sessionStorage.getItem(PENDING_EMAIL_KEY) || "";
};

export const clearPendingEmail = () => {
  sessionStorage.removeItem(PENDING_EMAIL_KEY);
};
