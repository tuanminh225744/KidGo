import { body, param } from "express-validator";

export const validateScheduleIdParam = [
  param("scheduleId")
    .isMongoId()
    .withMessage("scheduleId phải là định dạng ObjectID hợp lệ"),
];

export const validateCreateSchedule = [
  body("kidId")
    .notEmpty()
    .withMessage("kidId là bắt buộc")
    .bail()
    .isMongoId()
    .withMessage("kidId phải là định dạng ObjectID hợp lệ"),

  body("routeId")
    .notEmpty()
    .withMessage("routeId là bắt buộc")
    .bail()
    .isMongoId()
    .withMessage("routeId phải là định dạng ObjectID hợp lệ"),

  body("repeatDays")
    .notEmpty()
    .withMessage("repeatDays là bắt buộc")
    .bail()
    .isArray()
    .withMessage("repeatDays phải là mảng")
    .custom((value) => {
      if (Array.isArray(value)) {
        value.forEach((day) => {
          if (!Number.isInteger(day) || day < 0 || day > 6) {
            throw new Error("Mỗi phần tử trong repeatDays phải là số từ 0-6");
          }
        });
      }
      return true;
    }),

  body("pickupTime")
    .notEmpty()
    .withMessage("pickupTime là bắt buộc")
    .bail()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("pickupTime phải có định dạng HH:mm"),

  body("startDate")
    .notEmpty()
    .withMessage("startDate là bắt buộc")
    .bail()
    .isISO8601()
    .withMessage("startDate phải là ngày hợp lệ theo ISO 8601"),

  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("endDate phải là ngày hợp lệ theo ISO 8601"),

  body("preferredDriverId")
    .optional()
    .isMongoId()
    .withMessage("preferredDriverId phải là định dạng ObjectID hợp lệ"),

  body("subscriptionId")
    .optional()
    .isMongoId()
    .withMessage("subscriptionId phải là định dạng ObjectID hợp lệ"),
];

export const validateUpdateSchedule = [
  ...validateScheduleIdParam,

  body("kidId")
    .optional()
    .isMongoId()
    .withMessage("kidId phải là định dạng ObjectID hợp lệ"),

  body("routeId")
    .optional()
    .isMongoId()
    .withMessage("routeId phải là định dạng ObjectID hợp lệ"),

  body("repeatDays")
    .optional()
    .isArray()
    .withMessage("repeatDays phải là mảng")
    .custom((value) => {
      if (Array.isArray(value)) {
        value.forEach((day) => {
          if (!Number.isInteger(day) || day < 0 || day > 6) {
            throw new Error("Mỗi phần tử trong repeatDays phải là số từ 0-6");
          }
        });
      }
      return true;
    }),

  body("pickupTime")
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("pickupTime phải có định dạng HH:mm"),

  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("startDate phải là ngày hợp lệ theo ISO 8601"),

  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("endDate phải là ngày hợp lệ theo ISO 8601"),

  body("preferredDriverId")
    .optional()
    .isMongoId()
    .withMessage("preferredDriverId phải là định dạng ObjectID hợp lệ"),
];

export const validateToggleSchedule = [
  ...validateScheduleIdParam,

  body("isActive")
    .notEmpty()
    .withMessage("isActive là bắt buộc")
    .bail()
    .isBoolean()
    .withMessage("isActive phải là boolean"),
];
