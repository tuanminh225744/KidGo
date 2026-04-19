import * as authService from "../services/authentication.service.js";

// POST /api/v1/auth/register
export const registerUser = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
       return res.status(400).json({ success: false, message: "Email và mật khẩu là bắt buộc" });
    }
    const result = await authService.login(email, password);
    if (!result.success) {
      return res.status(401).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/send-otp
export const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email là bắt buộc" });
    }
    const result = await authService.sendOTP(email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/verify-otp
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email và mã OTP là bắt buộc" });
    }
    const result = await authService.verifyOTPAndLogin(email, otp);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/refresh
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: "RefreshToken là bắt buộc" });
    }
    const result = await authService.refreshAccessToken(refreshToken);
    if (!result.success) {
      return res.status(401).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/logout
export const logout = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await authService.logout(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
