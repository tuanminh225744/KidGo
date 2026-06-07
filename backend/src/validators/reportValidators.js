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
    .isLength({ min: 3, max: 120 })
    .withMessage("title phải có độ dài từ 3 đến 120 ký tự"),

  body("content")
    .exists()
    .withMessage("content là bắt buộc")
    .isString()
    .withMessage("content phải là chuỗi văn bản")
    .isLength({ min: 5, max: 5000 })
    .withMessage("content phải có độ dài từ 5 đến 5000 ký tự"),
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
