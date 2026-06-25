import express from "express";
import {
  listParents,
  getParentDetail,
  suspendUser,
  reactivateUser,
  toggleUserStatus,
} from "../controllers/AdminUserController.js";
import {
  authenticateToken,
  authorize,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticateToken);
router.use(authorize("admin"));

// Route: GET /admin/users
// Danh sách phụ huynh (filter, search, phân trang)
router.get("/", listParents);

// Route: GET /admin/users/:userId
// Chi tiết phụ huynh
router.get("/:userId", getParentDetail);

// Route: PATCH /admin/users/:userId/suspend
// Khóa tài khoản phụ huynh
router.patch("/:userId/suspend", suspendUser);

// Route: PATCH /admin/users/:userId/reactivate
// Mở khóa tài khoản phụ huynh
router.patch("/:userId/reactivate", reactivateUser);

// Route: PUT /admin/users/:id/status
// Khóa hoặc mở khóa một tài khoản user (tự động đồng bộ với tài xế)
router.put("/:id/status", toggleUserStatus);

export default router;
