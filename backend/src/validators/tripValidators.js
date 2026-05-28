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
 * Validator cho confirm pickup (OTP)
 */
export const validateConfirmPickup = [
  body("method")
    .optional()
    .isIn(["otp", "photo", "security_question"])
    .withMessage("method không hợp lệ."),
  body("otp")
    .optional()
    .isLength({ min: 6, max: 6 })
    .withMessage("Mã OTP phải gồm đúng 6 chữ số.")
    .isNumeric()
    .withMessage("Mã OTP chỉ bao gồm chữ số."),
  body().custom((_, { req }) => {
    if (!req.body.method && !req.body.otp && !req.body.photo && !req.body.answer) {
      throw new Error("Vui lòng cung cấp dữ liệu xác minh.");
    }
    return true;
  }),
];

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
