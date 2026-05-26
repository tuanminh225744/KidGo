import express from "express";
import {
  registerUser,
  registerDriver,
  loginUser,
  sendOtp,
  verifyOtp,
  refreshToken,
  logout,
} from "../controllers/AuthController.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  validateRegisterBody,
  validateRegisterDriverBody,
  validateLoginBody,
  validateSendOtpBody,
  validateVerifyOtpBody,
  validateRefreshTokenBody
} from "../validators/authValidators.js";

const router = express.Router();

// Public routes
router.post("/register", validateRegisterBody, validate, registerUser);
router.post("/register-driver", validateRegisterDriverBody, validate, registerDriver);
router.post("/login", validateLoginBody, validate, loginUser);
router.post("/send-otp", validateSendOtpBody, validate, sendOtp);
router.post("/verify-otp", validateVerifyOtpBody, validate, verifyOtp);
router.post("/refresh", validateRefreshTokenBody, validate, refreshToken);

// Protected routes (Bất cứ ai có token đều có thể đăng xuất)
router.post("/logout", authenticateToken, logout);

export default router;
