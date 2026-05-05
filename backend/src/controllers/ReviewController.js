import * as reviewService from "../services/review.service.js";
import { AppError } from "../utils/AppError.js";

/**
 * POST /api/v1/reviews
 * Phụ huynh tạo hoặc cập nhật đánh giá sau chuyến
 * Role: parent
 */
export const upsertReview = async (req, res, next) => {
  try {
    const parentId = req.user.id;
    const { tripId, rating, comment, tags } = req.body;

    const review = await reviewService.upsertReview(parentId, {
      tripId,
      rating,
      comment,
      tags,
    });

    res.status(200).json({
      success: true,
      message: review.isNew
        ? "Đã gửi đánh giá thành công."
        : "Đã cập nhật đánh giá thành công.",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/reviews/driver/:driverId
 * Xem tất cả đánh giá của một tài xế
 * Role: parent
 */
export const getDriverReviewsHandler = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const { page, limit } = req.query;
    const result = await reviewService.getDriverReviews(driverId, {
      page: +page || 1,
      limit: +limit || 20,
    });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
