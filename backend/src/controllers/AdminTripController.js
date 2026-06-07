import Trip from "../models/operational/trip.model.js";
import { NotFoundError } from "../utils/AppError.js";
import { success, error } from "../utils/response.js";

/**
 * GET /api/v1/admin/trips
 * Tất cả chuyến (filter theo status + phân trang)
 * Role: admin
 */
export const getAllTrips = async (req, res, next) => {
  try {
    const { status, driverId, parentId, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (driverId) query.driverId = driverId;
    if (parentId) query.parentId = parentId;

    const skip = (+page - 1) * +limit;
    const [trips, total] = await Promise.all([
      Trip.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(+limit)
        .populate("routeId")
        .populate("driverId", "user licenseNumber rating")
        .populate("parentId", "fullName email phone")
        .populate("kidId", "fullName")
        .populate("vehicleId", "licensePlate model color"),
      Trip.countDocuments(query),
    ]);

    return success(
      res,
      {
        page: +page,
        total,
        totalPages: Math.ceil(total / +limit),
        data: trips,
      },
      "Trips fetched",
      200,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/trips/live
 * Tất cả chuyến đang chạy (realtime)
 * Role: admin
 * ⚠ PHẢI đặt trước /:tripId
 */
export const getLiveTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find({
      status: { $in: ["picking_up", "in_progress"] },
    })
      .populate("routeId")
      .populate("driverId", "user licenseNumber currentLocation rideStatus")
      .populate("parentId", "fullName phone")
      .populate("kidId", "fullName")
      .populate("vehicleId", "licensePlate model color");

    return success(
      res,
      { count: trips.length, data: trips },
      "Live trips fetched",
      200,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/trips/:tripId
 * Chi tiết chuyến đầy đủ
 * Role: admin
 */
export const getTripDetailAdmin = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const trip = await Trip.findById(tripId)
      .populate("routeId")
      .populate("driverId", "user licenseNumber rating currentLocation")
      .populate("parentId", "fullName email phone")
      .populate("kidId", "fullName avatar")
      .populate("vehicleId", "licensePlate model color")
      .populate("bookingId");

    if (!trip) return next(new NotFoundError("Chuyến đi không tồn tại."));
    return success(res, trip, "Trip fetched", 200);
  } catch (error) {
    next(error);
  }
};
