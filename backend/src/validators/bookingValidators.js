import { body, param } from "express-validator";

export const validateBookingIdParam = [
  param("bookingId")
    .isMongoId()
    .withMessage("bookingId phải là định dạng ObjectID hợp lệ"),
];

export const validateCreateBooking = [
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

  body("scheduledTime")
    .notEmpty()
    .withMessage("scheduledTime là bắt buộc")
    .bail()
    .isISO8601()
    .withMessage("scheduledTime phải là ngày giờ hợp lệ theo ISO 8601"),

  body("preferredDriverId")
    .optional()
    .isMongoId()
    .withMessage("preferredDriverId phải là định dạng ObjectID hợp lệ"),
];
