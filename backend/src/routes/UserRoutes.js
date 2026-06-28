import express from "express";
import { authenticateToken, authorize } from "../middlewares/auth.middleware.js";
import { uploadAvatar } from "../middlewares/upload.middleware.js";
import {
  getCurrentProfile,
  updateProfile,
  uploadUserAvatar,
} from "../controllers/UserController.js";

const router = express.Router();

// Lấy profile phụ huynh hiện tại
router.get("/me", authenticateToken, authorize("parent"), getCurrentProfile);

// Cập nhật tên, email, avatar (cho parent)
router.put("/me", authenticateToken, authorize("parent"), updateProfile);

// Upload ảnh đại diện (cho tất cả user đăng nhập)
router.post(
  "/upload-avatar",
  authenticateToken,
  uploadAvatar.single("avatar"),
  uploadUserAvatar
);

export default router;
