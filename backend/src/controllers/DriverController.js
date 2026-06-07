import * as driverService from "../services/driver.service.js";
import * as tripService from "../services/trip.service.js";
import * as reviewService from "../services/review.service.js";
import Vehicle from "../models/core/vehicle.model.js";
import {
  AppError,
  AuthorizationError,
  NotFoundError,
} from "../utils/AppError.js";
import { success, error } from "../utils/response.js";

/**
 * GET /api/v1/drivers/me
 * Profile tài xế hiện tại
 */
export const getDriverProfile = async (req, res, next) => {
  try {
    const userRes = await driverService.getDriverByUserId(req.user.id);
    const user = userRes.data;
    const driverRes = await driverService.getDriverById(user._id);
    return success(res, driverRes.data, driverRes.message, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/drivers/me
 * Cập nhật thông tin cá nhân
 */
export const updateDriverProfile = async (req, res, next) => {
  try {
    const userRes = await driverService.getDriverByUserId(req.user.id);
    const user = userRes.data;
    const { licenseNumber, licenseExpiry, certificationLevel } = req.body;

    const updateData = {};
    if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber;
    if (licenseExpiry !== undefined) updateData.licenseExpiry = licenseExpiry;
    if (certificationLevel !== undefined)
      updateData.certificationLevel = certificationLevel;

    const updated = await driverService.updateDriver(user._id, updateData);
    return success(
      res,
      updated.data,
      updated.message || "Cập nhật thông tin tài xế thành công.",
      200,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/drivers/me/status
 * Bật/tắt trạng thái sẵn sàng
 */
export const toggleDriverStatus = async (req, res, next) => {
  try {
    const { isOnline } = req.body;
    const userRes = await driverService.getDriverByUserId(req.user.id);
    const user = userRes.data;

    const updated = await driverService.updateDriver(user._id, { isOnline });
    return success(
      res,
      updated.data,
      updated.message ||
        `${isOnline ? "Bật" : "Tắt"} trạng thái sẵn sàng thành công.`,
      200,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/drivers/me/location
 * Cập nhật vị trí GPS
 */
export const updateDriverLocation = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;
    const userRes = await driverService.getDriverByUserId(req.user.id);
    const driver = userRes.data;

    // Lưu vào Redis trước
    await driverService.updateLocationInRedis(driver._id, latitude, longitude);

    // Cập nhật DB
    const currentLocation = {
      type: "Point",
      coordinates: [longitude, latitude],
    };

    const updated = await driverService.updateDriver(driver._id, {
      currentLocation,
    });
    return success(
      res,
      updated.data,
      updated.message || "Cập nhật vị trí thành công.",
      200,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/drivers/me/trips
 * Lịch sử chuyến của tài xế
 */
export const getDriverTrips = async (req, res, next) => {
  try {
    const userRes = await driverService.getDriverByUserId(req.user.id);
    const user = userRes.data;
    const result = await tripService.getTripsByDriver(user._id);
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/drivers/me/earnings
 * Tổng kết thu nhập
 */
export const getDriverEarnings = async (req, res, next) => {
  try {
    const userRes = await driverService.getDriverByUserId(req.user.id);
    const user = userRes.data;
    const result = await tripService.getDriverEarnings(user._id);
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/drivers/me/reviews
 * Danh sách đánh giá nhận được
 */
export const getDriverReviews = async (req, res, next) => {
  try {
    const userRes = await driverService.getDriverByUserId(req.user.id);
    const user = userRes.data;
    const result = await reviewService.getReviewsByDriver(user._id);
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/drivers/me/vehicles
 * Thêm xe mới
 */
export const addVehicle = async (req, res, next) => {
  try {
    const user = await driverService.getDriverByUserId(req.user.id);
    const { licensePlate, brand, model, color, seatCount, inspectionExpiry } =
      req.body;

    const vehicle = new Vehicle({
      driverId: user._id,
      licensePlate,
      brand,
      model,
      color,
      seatCount,
      inspectionExpiry,
    });

    await vehicle.save();
    return success(res, vehicle, "Thêm xe thành công.", 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/drivers/me/vehicles
 * Danh sách xe của tài xế
 */
export const getDriverVehicles = async (req, res, next) => {
  try {
    const userRes = await driverService.getDriverByUserId(req.user.id);
    const user = userRes.data;
    const vehicles = await Vehicle.find({ driverId: user._id });
    return success(res, vehicles, "Driver vehicles fetched", 200);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/drivers/me/vehicles/:vehicleId/active
 * Chọn xe đang dùng
 */
export const setActiveVehicle = async (req, res, next) => {
  try {
    const user = await driverService.getDriverByUserId(req.user.id);
    const vehicle = await Vehicle.findById(req.params.vehicleId);

    if (!vehicle) {
      throw new NotFoundError("Không tìm thấy xe.");
    }

    if (vehicle.driverId.toString() !== user._id.toString()) {
      throw new AuthorizationError("Xe này không phải của bạn.");
    }

    // Đặt tất cả xe của driver này là không active
    await Vehicle.updateMany({ driverId: user._id }, { isActive: false });
    // Đặt xe này là active
    vehicle.isActive = true;
    await vehicle.save();
    return success(res, vehicle, "Chọn xe đang dùng thành công.", 200);
  } catch (error) {
    next(error);
  }
};
