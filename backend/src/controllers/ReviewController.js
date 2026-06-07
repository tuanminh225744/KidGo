import * as reviewService from "../services/review.service.js";
import { AppError } from "../utils/AppError.js";
import { success, error } from "../utils/response.js";

/**
 * POST /api/v1/reviews
 * Phụ huynh tạo hoặc cập nhật đánh giá sau chuyến
 * Role: parent
 */
export const upsertReview = async (req, res, next) => {
  try {
    const parentId = req.user.id;
    const { tripId, rating, comment, tags } = req.body;

    const result = await reviewService.upsertReview(parentId, {
      tripId,
      rating,
      comment,
      tags,
    });
    return success(res, result.data, result.message, 200);
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
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};
