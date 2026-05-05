import {
  getParentTrips,
  getActiveTrips,
  getTripDetail,
  getRawLocationLog,
  driverStartPickup,
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
 * POST /api/v1/trips/:tripId/confirm-pickup
 * Tài xế xác nhận đã đón trẻ (nhập OTP)
 * Role: driver
 * Body: { otp }
 */
export const confirmPickup = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { otp } = req.body;
    if (!otp) return next(new AppError("Vui lòng nhập mã OTP.", 400));

    const trip = await driverPickupKid(tripId, otp);
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
