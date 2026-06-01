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

  body("securitySettings")
    .optional()
    .isObject()
    .withMessage("securitySettings phải là object"),

  body("securitySettings.otp")
    .optional()
    .isBoolean()
    .withMessage("securitySettings.otp phải là boolean"),

  body("securitySettings.pickupPhoto")
    .optional()
    .isBoolean()
    .withMessage("securitySettings.pickupPhoto phải là boolean"),

  body("securitySettings.dropoffPhoto")
    .optional()
    .isBoolean()
    .withMessage("securitySettings.dropoffPhoto phải là boolean"),

  body("securitySettings.securityQuestion")
    .optional()
    .isBoolean()
    .withMessage("securitySettings.securityQuestion phải là boolean"),

  body("securityQuestion")
    .optional()
    .isString()
    .withMessage("securityQuestion phải là chuỗi văn bản")
    .trim(),

  body("securityAnswer")
    .optional()
    .isString()
    .withMessage("securityAnswer phải là chuỗi văn bản")
    .trim(),

  body().custom((value) => {
    const settings = value.securitySettings || {};
    const hasOtp = settings.otp === true;
    const hasPickupPhoto = settings.pickupPhoto === true;
    const hasDropoffPhoto = settings.dropoffPhoto === true;
    const hasSecurityQuestion = settings.securityQuestion === true;

    if (!hasOtp && !hasPickupPhoto && !hasDropoffPhoto && !hasSecurityQuestion) {
      throw new Error("Phải chọn ít nhất 1 phương thức bảo mật.");
    }

    if (hasSecurityQuestion && (!value.securityQuestion || !value.securityAnswer)) {
      throw new Error("Khi chọn câu hỏi bảo mật, cần nhập đầy đủ câu hỏi và đáp án.");
    }

    return true;
  }),
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

  body("securitySettings")
    .optional()
    .isObject()
    .withMessage("securitySettings phải là object"),

  body("securitySettings.otp")
    .optional()
    .isBoolean()
    .withMessage("securitySettings.otp phải là boolean"),

  body("securitySettings.pickupPhoto")
    .optional()
    .isBoolean()
    .withMessage("securitySettings.pickupPhoto phải là boolean"),

  body("securitySettings.dropoffPhoto")
    .optional()
    .isBoolean()
    .withMessage("securitySettings.dropoffPhoto phải là boolean"),

  body("securitySettings.securityQuestion")
    .optional()
    .isBoolean()
    .withMessage("securitySettings.securityQuestion phải là boolean"),

  body("securityQuestion")
    .optional()
    .isString()
    .withMessage("securityQuestion phải là chuỗi văn bản")
    .trim(),

  body("securityAnswer")
    .optional()
    .isString()
    .withMessage("securityAnswer phải là chuỗi văn bản")
    .trim(),

  body().custom((value) => {
    const allowedFields = ["fullName", "dateOfBirth", "avatar", "phone", "school", "notes", "securitySettings", "securityQuestion", "securityAnswer"];
    const hasUpdateField = allowedFields.some((field) => value[field] !== undefined);

    if (!hasUpdateField) {
      throw new Error("Phải cung cấp ít nhất một trường để cập nhật.");
    }

    const settings = value.securitySettings || {};
    const hasSecuritySettings =
      settings.otp === true ||
      settings.pickupPhoto === true ||
      settings.dropoffPhoto === true ||
      settings.securityQuestion === true;

    if (value.securitySettings && !hasSecuritySettings) {
      throw new Error("Phải chọn ít nhất 1 phương thức bảo mật.");
    }

    if (settings.securityQuestion === true && (!value.securityQuestion || !value.securityAnswer)) {
      throw new Error("Khi chọn câu hỏi bảo mật, cần nhập đầy đủ câu hỏi và đáp án.");
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

export const validateSetupKidSecurity = [
  ...validateKidIdParam,

  body("securitySettings")
    .notEmpty()
    .withMessage("securitySettings là bắt buộc")
    .bail()
    .isObject()
    .withMessage("securitySettings phải là object"),

  body("securitySettings.otp")
    .optional()
    .isBoolean()
    .withMessage("securitySettings.otp phải là boolean"),

  body("securitySettings.pickupPhoto")
    .optional()
    .isBoolean()
    .withMessage("securitySettings.pickupPhoto phải là boolean"),

  body("securitySettings.dropoffPhoto")
    .optional()
    .isBoolean()
    .withMessage("securitySettings.dropoffPhoto phải là boolean"),

  body("securitySettings.securityQuestion")
    .optional()
    .isBoolean()
    .withMessage("securitySettings.securityQuestion phải là boolean"),

  body("securityQuestion")
    .optional()
    .isString()
    .withMessage("securityQuestion phải là chuỗi văn bản")
    .trim(),

  body("securityAnswer")
    .optional()
    .isString()
    .withMessage("securityAnswer phải là chuỗi văn bản")
    .trim(),

  body().custom((value) => {
    const settings = value.securitySettings || {};
    const hasSecuritySettings =
      settings.otp === true ||
      settings.pickupPhoto === true ||
      settings.dropoffPhoto === true ||
      settings.securityQuestion === true;

    if (!hasSecuritySettings) {
      throw new Error("Phải chọn ít nhất 1 phương thức bảo mật.");
    }

    if (settings.securityQuestion === true && (!value.securityQuestion || !value.securityAnswer)) {
      throw new Error("Khi chọn câu hỏi bảo mật, cần nhập đầy đủ câu hỏi và đáp án.");
    }

    return true;
  }),
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
