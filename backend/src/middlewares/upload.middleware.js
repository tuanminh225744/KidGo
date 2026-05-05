import multer from "multer";
import path from "path";
import fs from "fs";
import { AppError } from "../utils/AppError.js";

// Đảm bảo thư mục uploads tồn tại
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Thư mục riêng cho ảnh xác nhận chuyến
const confirmationDir = path.join(process.cwd(), "uploads", "confirmations");
if (!fs.existsSync(confirmationDir)) {
  fs.mkdirSync(confirmationDir, { recursive: true });
}

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new AppError("Chỉ hỗ trợ upload file ảnh!", 400), false);
  }
};

// ── Avatar ──────────────────────────────────────────────────────────────
const avatarStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const userId = req.user?.id || "guest";
    cb(null, `avatar-${userId}-${Date.now()}${ext}`);
  },
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ── Ảnh xác nhận chuyến (pickup / dropoff) ──────────────────────────────
const confirmationStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, confirmationDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const driverId = req.user?.id || "unknown";
    cb(null, `confirmation-${driverId}-${Date.now()}${ext}`);
  },
});

export const uploadConfirmation = multer({
  storage: confirmationStorage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
