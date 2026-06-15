import express from "express";
import {
  getDriverProfile,
  updateDriverProfile,
  toggleDriverStatus,
  updateDriverLocation,
  getDriverTrips,
  getDriverEarnings,
  getDriverReviews,
  addVehicle,
  getDriverVehicles,
  setActiveVehicle,
} from "../controllers/DriverController.js";
import {
  getBookingRequests,
  acceptBooking,
  rejectBooking,
} from "../controllers/BookingDriverController.js";
import {
  authenticateToken,
  authorize,
} from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  validateVehicleIdParam,
  validateUpdateDriverProfile,
  validateToggleDriverStatus,
  validateUpdateLocation,
  validateAddVehicle,
  validateBookingIdParam,
} from "../validators/driverValidators.js";
import { validateDriverIdParam } from "../validators/adminDriverValidators.js";
import {
  getDriverByIdPublic,
  getDriverLocationPublic,
} from "../controllers/DriverController.js";

const router = express.Router();

// Tất cả routes yêu cầu xác thực
router.use(authenticateToken);

/**
 * GET /api/v1/drivers/me
 * Profile tài xế hiện tại
 */
router.get("/me", authorize("driver"), getDriverProfile);

/**
 * PUT /api/v1/drivers/me
 * Cập nhật thông tin cá nhân
 */
router.put(
  "/me",
  authorize("driver"),
  validateUpdateDriverProfile,
  validate,
  updateDriverProfile,
);

/**
 * PATCH /api/v1/drivers/me/status
 * Bật/tắt trạng thái sẵn sàng
 */
router.patch(
  "/me/status",
  authorize("driver"),
  validateToggleDriverStatus,
  validate,
  toggleDriverStatus,
);

/**
 * PUT /api/v1/drivers/me/location
 * Cập nhật vị trí GPS
 */
router.put(
  "/me/location",
  authorize("driver"),
  validateUpdateLocation,
  validate,
  updateDriverLocation,
);

/**
 * GET /api/v1/drivers/me/trips
 * Lịch sử chuyến của tài xế
 */
router.get("/me/trips", authorize("driver"), getDriverTrips);

/**
 * GET /api/v1/drivers/me/earnings
 * Tổng kết thu nhập
 */
router.get("/me/earnings", authorize("driver"), getDriverEarnings);

/**
 * GET /api/v1/drivers/me/reviews
 * Danh sách đánh giá nhận được
 */
router.get("/me/reviews", authorize("driver"), getDriverReviews);

/**
 * POST /api/v1/drivers/me/vehicles
 * Thêm xe mới
 */
router.post(
  "/me/vehicles",
  authorize("driver"),
  validateAddVehicle,
  validate,
  addVehicle,
);

/**
 * GET /api/v1/drivers/me/vehicles
 * Danh sách xe của tài xế
 */
router.get("/me/vehicles", authorize("driver"), getDriverVehicles);

/**
 * PATCH /api/v1/drivers/me/vehicles/:vehicleId/active
 * Chọn xe đang dùng
 */
router.patch(
  "/me/vehicles/:vehicleId/active",
  authorize("driver"),
  validateVehicleIdParam,
  validate,
  setActiveVehicle,
);

/**
 * GET /api/v1/drivers/me/booking-requests
 * Danh sách booking đang mời
 */
router.get("/me/booking-requests", authorize("driver"), getBookingRequests);

/**
 * POST /api/v1/drivers/me/booking-requests/:bookingId/accept
 * Chấp nhận chuyến
 */
router.post(
  "/me/booking-requests/:bookingId/accept",
  authorize("driver"),
  validateBookingIdParam,
  validate,
  acceptBooking,
);

/**
 * POST /api/v1/drivers/me/booking-requests/:bookingId/reject
 * Từ chối chuyến
 */
router.post(
  "/me/booking-requests/:bookingId/reject",
  authorize("driver"),
  validateBookingIdParam,
  validate,
  rejectBooking,
);

/**
 * GET /api/v1/drivers/:driverId
 * Lấy thông tin tài xế (parent & admin)
 */
router.get(
  "/:driverId/location",
  authorize("parent", "admin"),
  validateDriverIdParam,
  validate,
  getDriverLocationPublic,
);

router.get(
  "/:driverId",
  authorize("parent", "admin"),
  validateDriverIdParam,
  validate,
  getDriverByIdPublic,
);

export default router;
