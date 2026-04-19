import * as reviewService from "../services/review.service.js";

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
      message: review.isNew ? "Đã gửi đánh giá thành công." : "Đã cập nhật đánh giá thành công.",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};
