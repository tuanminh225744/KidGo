import { body, param, query } from "express-validator";

/**
 * Alert Validators - Tất cả validators cho Alert API
 * Sử dụng hàm validate chung từ middlewares/validate.middleware.js
 */

/**
 * Validator cho tripId từ URL params
 */
export const validateTripId = [
  param("tripId")
    .isMongoId()
    .withMessage("tripId phải là MongoDB ObjectId hợp lệ"),
];

/**
 * Validator cho alertId từ URL params
 */
export const validateAlertId = [
  param("alertId")
    .isMongoId()
    .withMessage("alertId phải là MongoDB ObjectId hợp lệ"),
];

/**
 * Validator cho query params của alerts
 */
export const validateAlertQueryParams = [
  query("status")
    .optional()
    .isIn(["open", "acknowledged", "resolved", "escalated"])
    .withMessage(
      "status phải là: open, acknowledged, resolved, hoặc escalated",
    ),
  query("type")
    .optional()
    .isIn([
      "detour",
      "unplanned_stop",
      "speed",
      "gps_lost",
      "early_end",
      "major_detour",
    ])
    .withMessage(
      "type phải là: detour, unplanned_stop, speed, gps_lost, early_end, hoặc major_detour",
    ),
];

/**
 * Validator cho body khi resolve alert
 */
export const validateResolveAlertBody = [
  body("resolvedBy")
    .exists()
    .withMessage("resolvedBy là trường bắt buộc")
    .isIn(["parent", "driver", "admin", "system"])
    .withMessage("resolvedBy phải là: parent, driver, admin, hoặc system"),
  body("note")
    .optional()
    .isString()
    .withMessage("note phải là chuỗi text")
    .isLength({ max: 500 })
    .withMessage("note không được vượt quá 500 ký tự"),
];
