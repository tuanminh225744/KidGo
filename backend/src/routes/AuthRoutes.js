import express from "express";
import {
  registerUser,
  loginUser,
  sendOtp,
  verifyOtp,
  refreshToken,
  logout,
} from "../controllers/AuthController.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/refresh", refreshToken);

// Protected routes (Bất cứ ai có token đều có thể đăng xuất)
router.post("/logout", authenticateToken, logout);

export default router;
