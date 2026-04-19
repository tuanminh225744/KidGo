import express from "express";
import { toggleUserStatus } from "../controllers/AdminUserController.js";
import {
  authenticateToken,
  authorize,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticateToken);
router.use(authorize("admin"));

// Route: PUT /admin/users/:id/status
// Khóa hoặc mở khóa một tài khoản user (tự động đồng bộ với tài xế)
router.put("/:id/status", toggleUserStatus);

export default router;
