import { body, param, query } from "express-validator";

/**
 * Validator cho tripId param
 */
export const validateTripIdParam = [
  param("tripId").isMongoId().withMessage("tripId không hợp lệ."),
];

/**
 * Validator cho GPS tick
 */
export const validateGpsTick = [
  body("lat")
    .isFloat({ min: -90, max: 90 })
    .withMessage("lat phải là số thực trong khoảng -90 đến 90."),
  body("lng")
    .isFloat({ min: -180, max: 180 })
    .withMessage("lng phải là số thực trong khoảng -180 đến 180."),
  body("speed")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("speed phải là số không âm."),
  body("heading")
    .optional()
    .isFloat({ min: 0, max: 360 })
    .withMessage("heading phải trong khoảng 0-360."),
  body("accuracy")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("accuracy phải là số không âm."),
];

/**
 * Validator cho verify OTP
 */
export const validateVerifyOtp = [
  body("otp")
    .isLength({ min: 6, max: 6 })
    .withMessage("Mã OTP phải gồm đúng 6 chữ số.")
    .isNumeric()
    .withMessage("Mã OTP chỉ bao gồm chữ số."),
];

/**
 * Validator cho verify Photo
 */
export const validateVerifyPhoto = [
  body("photo")
    .notEmpty()
    .withMessage("Vui lòng cung cấp URL hoặc dữ liệu ảnh (photo)."),
];

/**
 * Validator cho verify Security Question
 */
export const validateVerifySecurityQuestion = [
  body("answer")
    .notEmpty()
    .withMessage("Vui lòng cung cấp câu trả lời (answer)."),
];

/**
 * Validator cho confirm pickup (không cần tham số body)
 */
export const validateConfirmPickup = [];

/**
 * Validator cho query params danh sách trips
 */
export const validateTripsQuery = [
  query("status")
    .optional()
    .isIn(["picking_up", "in_progress", "completed", "cancelled"])
    .withMessage("status không hợp lệ."),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page phải là số nguyên dương."),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit phải từ 1 đến 100."),
];

/**
 * Validator cho cập nhật estimated waypoints
 */
export const validateEstimatedWaypoints = [
  body("waypoints")
    .isArray()
    .withMessage("waypoints phải là mảng các tọa độ [lat, lng]"),
];
