import express from "express";
import { authenticateToken, authorize } from "../middlewares/auth.middleware.js";
import { uploadAvatar } from "../middlewares/upload.middleware.js";
import {
  getCurrentProfile,
  updateProfile,
  updateDeviceToken,
  uploadUserAvatar,
} from "../controllers/UserController.js";

const router = express.Router();

// Lấy profile phụ huynh hiện tại
router.get("/me", authenticateToken, authorize("parent"), getCurrentProfile);

// Cập nhật tên, email, avatar (cho parent)
router.put("/me", authenticateToken, authorize("parent"), updateProfile);

// Cập nhật FCM token (cho tất cả các role hợp lệ)
router.put("/me/device-token", authenticateToken, updateDeviceToken);

// Upload ảnh đại diện (cho tất cả user đăng nhập)
router.post(
  "/upload-avatar",
  authenticateToken,
  uploadAvatar.single("avatar"),
  uploadUserAvatar
);

export default router;
