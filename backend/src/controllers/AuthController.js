import * as authService from "../services/authentication.service.js";
import { success, error } from "../utils/response.js";

// POST /api/v1/auth/register
export const registerUser = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    if (!result.success) {
      return error(res, result.message, 400);
    }
    return success(res, result.data, result.message, 201);
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/register-driver
export const registerDriver = async (req, res, next) => {
  try {
    const result = await authService.registerDriver(req.body);
    if (!result.success) {
      return error(res, result.message, 400);
    }
    return success(res, result.data, result.message, 201);
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    console.log(result);
    if (!result.success) {
      return error(res, result.message, 401);
    }
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/send-otp
export const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.sendOTP(email);
    if (!result.success) return error(res, result.message, 400);
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/verify-otp
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyOTPAndLogin(email, otp);
    if (!result.success) {
      return error(res, result.message, 400);
    }
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/refresh
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    if (!result.success) {
      return error(res, result.message, 401);
    }
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/logout
export const logout = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await authService.logout(userId);
    if (!result.success) return error(res, result.message, 400);
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};
