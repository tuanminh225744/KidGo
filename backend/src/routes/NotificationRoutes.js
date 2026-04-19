import express from "express";
import {
  createNotification,
  getNotifications,
} from "../controllers/NotificationController.js";
import {
  authenticateToken,
  authorize,
} from "../middlewares/auth.middleware.js";
import { validateCreateNotification } from "../validators/notificationValidators.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = express.Router();

router.use(authenticateToken);

// Chỉ Admin mới được phép gọi API tạo thông báo hệ thống
router.post(
  "/",
  authorize("admin"),
  validateCreateNotification,
  validate,
  createNotification
);

// Mọi User (đã đăng nhập) đều lấy được danh sách theo quyền của mình
router.get("/", getNotifications);

export default router;
