import { body, param } from "express-validator";

export const validateCreateReport = [
  body("tripId")
    .exists()
    .withMessage("tripId là bắt buộc")
    .isMongoId()
    .withMessage("tripId phải là định dạng ObjectID hợp lệ"),

  body("title")
    .exists()
    .withMessage("title là bắt buộc")
    .isString()
    .withMessage("title phải là chuỗi văn bản")
    .isLength({ min: 1, max: 1000 })
    .withMessage("title phải có độ dài từ 1 đến 1000 ký tự"),

  body("content")
    .exists()
    .withMessage("content là bắt buộc")
    .isString()
    .withMessage("content phải là chuỗi văn bản")
    .isLength({ min: 1, max: 5000 })
    .withMessage("content phải có độ dài từ 1 đến 5000 ký tự"),
];

export const validateTripIdParam = [
  param("tripId")
    .exists()
    .withMessage("tripId là bắt buộc")
    .isMongoId()
    .withMessage("tripId phải là định dạng ObjectID hợp lệ"),
];

export const validateReportIdParam = [
  param("reportId")
    .exists()
    .withMessage("reportId là bắt buộc")
    .isMongoId()
    .withMessage("reportId phải là định dạng ObjectID hợp lệ"),
];

export const validateAdminReply = [
  ...validateReportIdParam,
  body("adminAnswer")
    .exists()
    .withMessage("adminAnswer là bắt buộc")
    .isString()
    .withMessage("adminAnswer phải là chuỗi văn bản")
    .isLength({ min: 1, max: 2000 })
    .withMessage("adminAnswer phải có độ dài từ 1 đến 2000 ký tự"),
];
