import * as driverService from "../services/driver.service.js";
import * as tripService from "../services/trip.service.js";
import * as tripScheduleService from "../services/tripSchedule.service.js";
import * as reviewService from "../services/review.service.js";
import Vehicle from "../models/core/vehicle.model.js";
import Driver from "../models/core/driver.model.js";
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
 * GET /api/v1/drivers/me/schedules/daily
 * Lấy danh sách lịch trình theo ngày của tài xế
 */
export const getDriverDailySchedules = async (req, res, next) => {
  try {
    const userRes = await driverService.getDriverByUserId(req.user.id);
    const user = userRes.data;
    const date = req.query.date || new Date().toISOString().split("T")[0]; // default to today if not provided
    const result = await tripScheduleService.getSchedulesByDriverAndDate(
      user._id,
      date,
    );
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/drivers/me/schedules/subscriptions
 * Lấy danh sách các chuyến định kì đặt theo gói của tài xế
 */
export const getDriverSubscriptionSchedules = async (req, res, next) => {
  try {
    const userRes = await driverService.getDriverByUserId(req.user.id);
    const user = userRes.data;
    const result = await tripScheduleService.getSubscriptionSchedulesByDriver(
      user._id,
    );
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
    const result = await tripService.getDriverEarningsStats(user._id, req.query);
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/drivers/me/stats/trips
 * Tổng kết số chuyến
 */
export const getDriverMeTripsStats = async (req, res, next) => {
  try {
    const userRes = await driverService.getDriverByUserId(req.user.id);
    const user = userRes.data;
    const result = await tripService.getDriverTripsStats(user._id, req.query);
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/drivers/:driverId/stats/earnings
 * API thống kê thanh toán và thu nhập của tài xế (dành cho Admin và Tài xế)

 */
export const getDriverEarningsStats = async (req, res, next) => {
  try {
    const { driverId } = req.params;

    // Nếu là driver thì chỉ được xem của chính mình
    if (req.user.role === 'driver') {
      const userRes = await driverService.getDriverByUserId(req.user.id);
      if (userRes.data._id.toString() !== driverId) {
        throw new AuthorizationError("Bạn không có quyền xem thống kê của tài xế khác.");
      }
    }

    const { date, month, period } = req.query;
    const result = await tripService.getDriverEarningsStats(driverId, { date, month, period });
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/drivers/:driverId/stats/trips
 * API thống kê số lượng chuyến của tài xế (dành cho Admin và Tài xế)
 */
export const getDriverTripsStats = async (req, res, next) => {
  try {
    const { driverId } = req.params;

    if (req.user.role === 'driver') {
      const userRes = await driverService.getDriverByUserId(req.user.id);
      if (userRes.data._id.toString() !== driverId) {
        throw new AuthorizationError("Bạn không có quyền xem thống kê của tài xế khác.");
      }
    }

    const { date, month, period } = req.query;
    const result = await tripService.getDriverTripsStats(driverId, { date, month, period });
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
    const driverDoc = user.data;
    const { licensePlate, brand, model, color, seatCount, inspectionExpiry } =
      req.body;

    const vehicle = new Vehicle({
      licensePlate,
      brand,
      model,
      color,
      seatCount,
      inspectionExpiry,
    });

    await vehicle.save();

    driverDoc.vehicleId = vehicle._id;
    await driverDoc.save();

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
    const driverDoc = await Driver.findById(userRes.data._id).populate('vehicleId');
    const vehicles = driverDoc.vehicleId ? [driverDoc.vehicleId] : [];
    return success(res, vehicles, "Driver vehicles fetched", 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/drivers/me/vehicles/:vehicleId/photo
 * Upload ảnh cho xe
 */
export const uploadVehiclePhotoController = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Không tìm thấy file ảnh" });
    }

    const { vehicleId } = req.params;
    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({ success: false, message: "Xe không tồn tại" });
    }

    // URL file tĩnh
    const photoUrl = `/uploads/vehicles/${req.file.filename}`;
    vehicle.photo = photoUrl;
    await vehicle.save();

    return success(res, { photo: photoUrl }, "Upload ảnh xe thành công", 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/drivers/:driverId/vehicle
 * Lấy thông tin xe của tài xế dựa vào driverId
 */
export const getDriverVehicleByDriverId = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const driver = await Driver.findById(driverId).populate("vehicleId");

    if (!driver) {
      return res.status(404).json({ success: false, message: "Tài xế không tồn tại" });
    }

    return success(res, driver.vehicleId || null, "Driver vehicle fetched", 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/drivers/:driverId
 * Lấy thông tin tài xế (dành cho parent hoặc admin)
 */
export const getDriverByIdPublic = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const result = await driverService.getDriverById(driverId);
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/drivers/:driverId/location
 * Lấy vị trí real-time của tài xế từ Redis (dành cho parent theo dõi)
 */
export const getDriverLocationPublic = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const result = await driverService.getDriverLocation(driverId);
    return success(res, result.data, result.message, 200);
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
