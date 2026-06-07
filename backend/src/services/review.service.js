import Review from "../models/support/review.model.js";
import Trip from "../models/operational/trip.model.js";
import { AppError } from "../utils/AppError.js";

export const upsertReview = async (parentId, data) => {
  const { tripId, rating, comment, tags } = data;

  if (!tripId || !rating) {
    throw new AppError("Thiếu tripId hoặc rating", 400);
  }

  // Verify trip belongs to parent
  const trip = await Trip.findOne({ _id: tripId, parentId });
  if (!trip) {
    throw new AppError("Chuyến đi không tồn tại hoặc không thuộc về bạn.", 404);
  }

  // Create or Update review
  const review = await Review.findOneAndUpdate(
    { tripId },
    {
      tripId,
      parentId,
      driverId: trip.driverId,
      rating,
      comment,
      tags: tags || [],
    },
    { new: true, upsert: true, runValidators: true }
  );

  return review;
};

/**
 * Lấy danh sách đánh giá của một tài xế (có phân trang)
 */
export const getDriverReviews = async (driverId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const mongoose = await import("mongoose");
  const driverObjectId = new mongoose.default.Types.ObjectId(driverId);

  const [reviews, total, avgResult] = await Promise.all([
    Review.find({ driverId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("parentId", "fullName avatar")
      .populate(
        "tripId",
        "createdAt status plannedRoute",
      ),
    Review.countDocuments({ driverId }),
    Review.aggregate([
      { $match: { driverId: driverObjectId } },
      { $group: { _id: null, averageRating: { $avg: "$rating" } } },
    ]),
  ]);

  return {
    page,
    total,
    totalPages: Math.ceil(total / limit),
    averageRating: avgResult[0]?.averageRating ?? null,
    reviews,
  };
};
