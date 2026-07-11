import {
  getParentTrips,
  getActiveTrips,
  getTripDetail,
  driverStartPickup,
  verifyTripOtp,
  verifyTripPickupPhoto,
  verifyTripDropoffPhoto,
  verifyTripSecurityQuestion,
  driverPickupKid,
  driverDropoffKid,
  cancelTrip,
  recordGpsTick,
  updateTripEstimatedWaypoints,
} from "../services/trip.service.js";
import { AppError } from "../utils/AppError.js";
import { success, error } from "../utils/response.js";

/**
 * GET /api/v1/trips
 * Lịch sử chuyến của phụ huynh (có filter theo status, phân trang)
 * Role: parent
 */
export const getTrips = async (req, res, next) => {
  try {
    const parentId = req.user.id;
    const { status, page, limit } = req.query;
    const result = await getParentTrips(parentId, {
      status,
      page: +page,
      limit: +limit,
    });
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/trips/active
 * Tất cả chuyến đang chạy của các con
 * Role: parent
 */
export const getActiveTripsList = async (req, res, next) => {
  try {
    const parentId = req.user.id;
    const result = await getActiveTrips(parentId);
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/trips/:tripId
 * Chi tiết chuyến (parent + driver + admin)
 */
export const getTripDetails = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const result = await getTripDetail(tripId, req.user.id, req.user.role);
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/trips/:tripId/start
 * Tài xế bắt đầu chuyến (di chuyển đến điểm đón)
 * Role: driver
 */
export const startTrip = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const result = await driverStartPickup(tripId);
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/trips/:tripId/verify-otp
 * Tài xế xác thực OTP
 * Role: driver
 */
export const verifyOtpHandler = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { otp } = req.body;
    const result = await verifyTripOtp(tripId, otp);
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};

export const verifyPickupPhotoHandler = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    let photoUrl = req.body.photo;
    if (req.file) {
      photoUrl = `${req.protocol}://${req.get("host")}/uploads/confirmations/${req.file.filename}`;
    }
    if (!photoUrl) throw new AppError("Không tìm thấy ảnh", 400);
    const result = await verifyTripPickupPhoto(tripId, photoUrl);
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};

export const verifyDropoffPhotoHandler = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    let photoUrl = req.body.photo;
    if (req.file) {
      photoUrl = `${req.protocol}://${req.get("host")}/uploads/confirmations/${req.file.filename}`;
    }
    if (!photoUrl) throw new AppError("Không tìm thấy ảnh", 400);
    const result = await verifyTripDropoffPhoto(tripId, photoUrl);
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/trips/:tripId/verify-security-question
 * Tài xế xác thực câu hỏi bảo mật
 * Role: driver
 */
export const verifySecurityQuestionHandler = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { answer, data } = req.body;
    const result = await verifyTripSecurityQuestion(tripId, answer, data);
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/trips/:tripId/confirm-pickup
 * Tài xế chốt xác nhận đã đón trẻ (sau khi các phương thức required đã passed)
 * Role: driver
 */
export const confirmPickup = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const result = await driverPickupKid(tripId);
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/trips/:tripId/confirm-dropoff
 * Tài xế xác nhận đã trả trẻ
 * Role: driver
 */
export const confirmDropoff = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const result = await driverDropoffKid(tripId);
    return success(
      res,
      result.data,
      result.message || "Chuyến đi đã hoàn thành.",
      200,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/trips/:tripId/cancel
 * Huỷ chuyến (parent hoặc driver)
 * Role: parent | driver
 */
export const cancelTripHandler = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const result = await cancelTrip(tripId, req.user.id, req.user.role);
    return success(
      res,
      result.data,
      result.message || "Chuyến đi đã được huỷ.",
      200,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/trips/:tripId/gps-tick
 * Gửi vị trí GPS realtime
 * Role: driver
 * Body: { lat, lng, speed, heading, accuracy }
 */
export const gpsTick = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const driverId = req.user.id;
    const gpsData = req.body;
    const result = await recordGpsTick(tripId, driverId, gpsData);
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/trips/:tripId/estimated-waypoints
 * Tài xế cập nhật estimated waypoints cho route
 * Role: driver
 */
export const updateEstimatedWaypointsHandler = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { waypoints } = req.body;
    const result = await updateTripEstimatedWaypoints(tripId, waypoints);
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};
