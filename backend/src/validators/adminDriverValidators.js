import { body, param, query } from "express-validator";

export const validateDriverIdParam = [
  param("driverId")
    .isMongoId()
    .withMessage("driverId phải là định dạng ObjectID hợp lệ"),
];

export const validateListDriversQuery = [
  query("status")
    .optional()
    .isIn(["pending", "active", "suspended", "rejected"])
    .withMessage("status không hợp lệ"),
  query("search")
    .optional()
    .isString()
    .trim(),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page phải là số nguyên >= 1"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit phải là số nguyên từ 1 đến 100"),
];

export const validateCertificationBody = [
  body("certificationLevel")
    .notEmpty()
    .withMessage("certificationLevel là bắt buộc")
    .bail()
    .isInt({ min: 0, max: 5 })
    .withMessage("certificationLevel phải là số từ 0 đến 5"),
];
