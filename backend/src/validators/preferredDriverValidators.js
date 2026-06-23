import { body, param } from "express-validator";

export const validateDriverIdParam = [
  param("driverId")
    .isMongoId()
    .withMessage("driverId phải là định dạng ObjectID hợp lệ"),
];

/**
 * Validator cho POST /api/v1/preferred-drivers
 * - Cách 1: truyền driverId (sau chuyến đi)
 * - Cách 2: truyền phone (tìm qua SĐT)
 * => Phải có ít nhất một trong hai
 */
export const validateAddPreferredDriver = [
  body()
    .custom((value) => {
      const hasdriverId = value.driverId !== undefined && value.driverId !== null && value.driverId !== "";
      const hasPhone = value.phone !== undefined && value.phone !== null && value.phone !== "";
      if (!hasdriverId && !hasPhone) {
        throw new Error("Phải cung cấp driverId (sau chuyến đi) hoặc phone (số điện thoại tài xế).");
      }
      if (hasdriverId && hasPhone) {
        throw new Error("Chỉ được truyền một trong hai: driverId hoặc phone, không được cả hai.");
      }
      return true;
    }),

  body("driverId")
    .optional()
    .isMongoId()
    .withMessage("driverId phải là định dạng ObjectID hợp lệ"),

  body("phone")
    .optional()
    .isMobilePhone("vi-VN")
    .withMessage("phone phải là số điện thoại Việt Nam hợp lệ (vd: 0912345678)")
    .trim(),

  body("nickname")
    .optional()
    .isString()
    .withMessage("nickname phải là chuỗi văn bản")
    .trim(),

  // priority từ 1 đến 5, mặc định 1 nếu không truyền (theo spec)
  body("priority")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("priority phải là số nguyên từ 1 đến 5 (1 = ưu tiên cao nhất)"),
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
    .isInt({ min: 1, max: 5 })
    .withMessage("priority phải là số nguyên từ 1 đến 5 (1 = ưu tiên cao nhất)"),

  body().custom((value) => {
    const allowedFields = ["nickname", "priority"];
    const hasUpdateField = allowedFields.some(
      (field) => value[field] !== undefined
    );

    if (!hasUpdateField) {
      throw new Error("Phải cung cấp ít nhất một trường để cập nhật (nickname hoặc priority).");
    }

    return true;
  }),
];
