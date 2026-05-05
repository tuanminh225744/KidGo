import { body, param } from "express-validator";

export const validateDriverIdParam = [
  param("driverId")
    .isMongoId()
    .withMessage("driverId phải là định dạng ObjectID hợp lệ"),
];

export const validateAddPreferredDriver = [
  body("driverId")
    .notEmpty()
    .withMessage("driverId là bắt buộc")
    .bail()
    .isMongoId()
    .withMessage("driverId phải là định dạng ObjectID hợp lệ"),

  body("nickname")
    .notEmpty()
    .withMessage("nickname là bắt buộc")
    .bail()
    .isString()
    .withMessage("nickname phải là chuỗi văn bản")
    .trim(),

  body("priority")
    .optional()
    .isInt({ min: 1 })
    .withMessage("priority phải là số nguyên >= 1"),
];

export const validateUpdatePreferredDriver = [
  ...validateDriverIdParam,

  body("nickname")
    .optional()
    .isString()
    .withMessage("nickname phải là chuỗi văn bản")
    .bail()
    .notEmpty()
    .withMessage("nickname không được để trống")
    .trim(),

  body("priority")
    .optional()
    .isInt({ min: 1 })
    .withMessage("priority phải là số nguyên >= 1"),

  body().custom((value) => {
    const allowedFields = ["nickname", "priority"];
    const hasUpdateField = allowedFields.some(
      (field) => value[field] !== undefined,
    );

    if (!hasUpdateField) {
      throw new Error("Phải cung cấp ít nhất một trường để cập nhật.");
    }

    return true;
  }),
];
