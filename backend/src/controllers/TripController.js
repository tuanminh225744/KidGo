import {
  getParentTrips,
  getActiveTrips,
  getTripDetail,
  getRawLocationLog,
  driverStartPickup,
  verifyTripOtp,
  verifyTripPickupPhoto,
  verifyTripDropoffPhoto,
  verifyTripSecurityQuestion,
  driverPickupKid,
  driverDropoffKid,
  cancelTrip,
  recordGpsTick,
} from "../services/trip.service.js";
import { AppError } from "../utils/AppError.js";

/**
 * GET /api/v1/trips
 * Lịch sử chuyến của phụ huynh (có filter theo status, phân trang)
 * Role: parent
 */
export const getTrips = async (req, res, next) => {
  try {
    const parentId = req.user.id;
    const { status, page, limit } = req.query;
    const result = await getParentTrips(parentId, { status, page: +page, limit: +limit });
    res.status(200).json({ success: true, ...result });
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
    const trips = await getActiveTrips(parentId);
    res.status(200).json({ success: true, count: trips.length, data: trips });
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
    const trip = await getTripDetail(tripId, req.user.id, req.user.role);
    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/trips/:tripId/location-log
 * Log GPS toàn bộ chuyến (phân trang)
 * Role: parent
 */
export const getLocationLog = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { page, limit } = req.query;
    const result = await getRawLocationLog(tripId, { page: +page, limit: +limit });
    res.status(200).json({ success: true, ...result });
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
    const trip = await driverStartPickup(tripId);
    res.status(200).json({ success: true, message: "Đang di chuyển đến điểm đón.", data: trip });
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
    const trip = await verifyTripOtp(tripId, otp);
    res.status(200).json({ success: true, message: "Xác thực OTP thành công.", data: trip });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/trips/:tripId/verify-pickup-photo
 * Tài xế xác thực ảnh chụp đón
 * Role: driver
 */
export const verifyPickupPhotoHandler = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { photo } = req.body;
    const trip = await verifyTripPickupPhoto(tripId, photo);
    res.status(200).json({ success: true, message: "Xác thực ảnh đón thành công.", data: trip });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/trips/:tripId/verify-dropoff-photo
 * Tài xế xác thực ảnh chụp trả
 * Role: driver
 */
export const verifyDropoffPhotoHandler = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { photo } = req.body;
    const trip = await verifyTripDropoffPhoto(tripId, photo);
    res.status(200).json({ success: true, message: "Xác thực ảnh trả thành công.", data: trip });
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
    const trip = await verifyTripSecurityQuestion(tripId, answer, data);
    res.status(200).json({ success: true, message: "Xác thực câu hỏi bảo mật thành công.", data: trip });
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
    const trip = await driverPickupKid(tripId);
    res.status(200).json({ success: true, message: "Đã xác nhận đón trẻ thành công.", data: trip });
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
    const trip = await driverDropoffKid(tripId);
    res.status(200).json({ success: true, message: "Chuyến đi đã hoàn thành.", data: trip });
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
    const trip = await cancelTrip(tripId, req.user.id, req.user.role);
    res.status(200).json({ success: true, message: "Chuyến đi đã được huỷ.", data: trip });
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
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
