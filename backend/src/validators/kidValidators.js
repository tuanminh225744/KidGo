import { body, param } from "express-validator";

export const validateKidIdParam = [
  param("kidId")
    .isMongoId()
    .withMessage("kidId phải là định dạng ObjectID hợp lệ"),
];

export const validateCreateKid = [
  body("fullName")
    .notEmpty()
    .withMessage("fullName là bắt buộc")
    .bail()
    .isString()
    .withMessage("fullName phải là chuỗi văn bản")
    .trim(),

  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("dateOfBirth phải là ngày hợp lệ theo ISO 8601"),

  body("avatar")
    .optional()
    .isString()
    .withMessage("avatar phải là chuỗi văn bản")
    .trim(),

  body("phone")
    .optional()
    .isString()
    .withMessage("phone phải là chuỗi văn bản")
    .trim(),

  body("school")
    .optional()
    .isString()
    .withMessage("school phải là chuỗi văn bản")
    .trim(),

  body("notes")
    .optional()
    .isString()
    .withMessage("notes phải là chuỗi văn bản")
    .trim(),
];

export const validateUpdateKid = [
  ...validateKidIdParam,

  body("fullName")
    .optional()
    .isString()
    .withMessage("fullName phải là chuỗi văn bản")
    .bail()
    .notEmpty()
    .withMessage("fullName không được để trống")
    .trim(),

  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("dateOfBirth phải là ngày hợp lệ theo ISO 8601"),

  body("avatar")
    .optional()
    .isString()
    .withMessage("avatar phải là chuỗi văn bản")
    .bail()
    .notEmpty()
    .withMessage("avatar không được để trống")
    .trim(),

  body("phone")
    .optional()
    .isString()
    .withMessage("phone phải là chuỗi văn bản")
    .bail()
    .notEmpty()
    .withMessage("phone không được để trống")
    .trim(),

  body("school")
    .optional()
    .isString()
    .withMessage("school phải là chuỗi văn bản")
    .bail()
    .notEmpty()
    .withMessage("school không được để trống")
    .trim(),

  body("notes")
    .optional()
    .isString()
    .withMessage("notes phải là chuỗi văn bản")
    .trim(),

  body().custom((value) => {
    const allowedFields = ["fullName", "dateOfBirth", "avatar", "phone", "school", "notes"];
    const hasUpdateField = allowedFields.some((field) => value[field] !== undefined);

    if (!hasUpdateField) {
      throw new Error("Phải cung cấp ít nhất một trường để cập nhật.");
    }

    return true;
  }),
];

export const validateSetupSecurityQuestion = [
  ...validateKidIdParam,

  body("securityQuestion")
    .notEmpty()
    .withMessage("securityQuestion là bắt buộc")
    .bail()
    .isString()
    .withMessage("securityQuestion phải là chuỗi văn bản")
    .trim(),

  body("securityAnswer")
    .notEmpty()
    .withMessage("securityAnswer là bắt buộc")
    .bail()
    .isString()
    .withMessage("securityAnswer phải là chuỗi văn bản")
    .trim(),
];

export const validateVerifySecurityAnswer = [
  ...validateKidIdParam,

  body("securityAnswer")
    .notEmpty()
    .withMessage("securityAnswer là bắt buộc")
    .bail()
    .isString()
    .withMessage("securityAnswer phải là chuỗi văn bản")
    .trim(),
];
