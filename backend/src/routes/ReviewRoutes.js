import express from "express";
import { upsertReview } from "../controllers/ReviewController.js";
import {
  authenticateToken,
  authorize,
} from "../middlewares/auth.middleware.js";
import { validateUpsertReview } from "../validators/reviewValidators.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = express.Router();

// Route: POST /api/reviews
// Phụ huynh có thể tạo hoặc cập nhật bài đánh giá
router.post(
  "/",
  authenticateToken,
  authorize("parent"),
  validateUpsertReview,
  validate,
  upsertReview
);

export default router;
