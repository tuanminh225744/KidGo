import Confirmation from "../models/safetyAndLogs/confirmation.model.js";
import Trip from "../models/operational/trip.model.js";
import { AppError, NotFoundError } from "../utils/AppError.js";

/**
 * GET /api/v1/trips/:tripId/confirmations
 * Lấy ảnh xác nhận đón + trả cho một chuyến
 * Role: parent
 */
export const getTripConfirmations = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const parentId = req.user.id;

    // Kiểm tra trip thuộc parent
    const trip = await Trip.findById(tripId);
    if (!trip) return next(new NotFoundError("Chuyến đi không tồn tại."));
    if (trip.parentId.toString() !== parentId.toString()) {
      return next(new AppError("Bạn không có quyền xem chuyến này.", 403));
    }

    const confirmations = await Confirmation.find({ tripId }).sort({ confirmedAt: 1 });
    res.status(200).json({ success: true, count: confirmations.length, data: confirmations });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/upload/confirmation-photo
 * Tài xế upload ảnh xác nhận đón / trả trẻ
 * Role: driver
 * Body (multipart/form-data): file + tripId + type (pickup | dropoff)
 */
export const uploadConfirmationPhoto = async (req, res, next) => {
  try {
    const driverId = req.user.id;
    const { tripId, type } = req.body;

    if (!tripId || !type) {
      return next(new AppError("Thiếu tripId hoặc type (pickup/dropoff).", 400));
    }
    if (!["pickup", "dropoff"].includes(type)) {
      return next(new AppError("type phải là 'pickup' hoặc 'dropoff'.", 400));
    }
    if (!req.file) {
      return next(new AppError("Vui lòng upload ảnh xác nhận.", 400));
    }

    const trip = await Trip.findById(tripId);
    if (!trip) return next(new NotFoundError("Chuyến đi không tồn tại."));

    // Xây dựng URL ảnh
    const photoUrl = `/uploads/confirmations/${req.file.filename}`;

    // Upsert Confirmation record
    const confirmation = await Confirmation.findOneAndUpdate(
      { tripId, type },
      {
        tripId,
        type,
        photoUrl,
        confirmedAt: new Date(),
        confirmedByDriverId: driverId,
      },
      { new: true, upsert: true }
    );

    // Cập nhật trường ảnh trên Trip luôn
    if (type === "pickup") {
      trip.pickupPhoto = photoUrl;
    } else {
      trip.dropoffPhoto = photoUrl;
    }
    await trip.save();

    res.status(200).json({
      success: true,
      message: `Đã upload ảnh ${type} thành công.`,
      data: { photoUrl, confirmation },
    });
  } catch (error) {
    next(error);
  }
};
