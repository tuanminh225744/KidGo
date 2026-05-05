import { body, param } from "express-validator";

export const validateVehicleIdParam = [
  param("vehicleId")
    .isMongoId()
    .withMessage("vehicleId phải là định dạng ObjectID hợp lệ"),
];

export const validateUpdateDriverProfile = [
  body("licenseNumber")
    .optional()
    .isString()
    .withMessage("licenseNumber phải là chuỗi văn bản")
    .trim(),

  body("licenseExpiry")
    .optional()
    .isISO8601()
    .withMessage("licenseExpiry phải là ngày hợp lệ theo ISO 8601"),

  body("certificationLevel")
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage("certificationLevel phải là số từ 0 đến 5"),
];

export const validateToggleDriverStatus = [
  body("isOnline")
    .notEmpty()
    .withMessage("isOnline là bắt buộc")
    .bail()
    .isBoolean()
    .withMessage("isOnline phải là boolean"),
];

export const validateUpdateLocation = [
  body("latitude")
    .notEmpty()
    .withMessage("latitude là bắt buộc")
    .bail()
    .isFloat({ min: -90, max: 90 })
    .withMessage("latitude phải là số từ -90 đến 90"),

  body("longitude")
    .notEmpty()
    .withMessage("longitude là bắt buộc")
    .bail()
    .isFloat({ min: -180, max: 180 })
    .withMessage("longitude phải là số từ -180 đến 180"),
];

export const validateAddVehicle = [
  body("licensePlate")
    .notEmpty()
    .withMessage("licensePlate là bắt buộc")
    .bail()
    .isString()
    .withMessage("licensePlate phải là chuỗi văn bản")
    .trim(),

  body("brand")
    .notEmpty()
    .withMessage("brand là bắt buộc")
    .bail()
    .isString()
    .withMessage("brand phải là chuỗi văn bản")
    .trim(),

  body("model")
    .notEmpty()
    .withMessage("model là bắt buộc")
    .bail()
    .isString()
    .withMessage("model phải là chuỗi văn bản")
    .trim(),

  body("color")
    .optional()
    .isString()
    .withMessage("color phải là chuỗi văn bản")
    .trim(),

  body("seatCount")
    .optional()
    .isInt({ min: 1 })
    .withMessage("seatCount phải là số nguyên >= 1"),

  body("inspectionExpiry")
    .optional()
    .isISO8601()
    .withMessage("inspectionExpiry phải là ngày hợp lệ theo ISO 8601"),
];

export const validateBookingIdParam = [
  param("bookingId")
    .isMongoId()
    .withMessage("bookingId phải là định dạng ObjectID hợp lệ"),
];
