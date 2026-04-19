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
