import { body } from "express-validator";

export const validateRegisterBody = [
  body("email")
    .notEmpty()
    .withMessage("Email là bắt buộc")
    .bail()
    .isEmail()
    .withMessage("Email không hợp lệ"),
  body("password")
    .notEmpty()
    .withMessage("Mật khẩu là bắt buộc")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Mật khẩu phải có ít nhất 6 ký tự"),
  body("fullName")
    .notEmpty()
    .withMessage("Họ tên là bắt buộc"),
  body("phone")
    .notEmpty()
    .withMessage("Số điện thoại là bắt buộc"),
  body("role")
    .notEmpty()
    .withMessage("Vai trò là bắt buộc")
    .isIn(["parent", "driver"])
    .withMessage("Vai trò không hợp lệ"),
];

export const validateRegisterDriverBody = [
  body("email")
    .notEmpty()
    .withMessage("Email là bắt buộc")
    .bail()
    .isEmail()
    .withMessage("Email không hợp lệ"),
  body("phone")
    .notEmpty()
    .withMessage("Số điện thoại là bắt buộc"),
  body("fullName")
    .notEmpty()
    .withMessage("Họ tên là bắt buộc"),
  body("password")
    .notEmpty()
    .withMessage("Mật khẩu là bắt buộc")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Mật khẩu phải có ít nhất 6 ký tự"),
  body("licenseNumber")
    .notEmpty()
    .withMessage("Số GPLX là bắt buộc"),
  body("licenseExpiry")
    .notEmpty()
    .withMessage("Ngày hết hạn GPLX là bắt buộc")
    .bail()
    .isISO8601()
    .withMessage("licenseExpiry phải là ngày hợp lệ theo ISO 8601"),
  body("licensePlate")
    .notEmpty()
    .withMessage("Biển số xe là bắt buộc"),
  body("brand")
    .notEmpty()
    .withMessage("Hãng xe là bắt buộc"),
  body("model")
    .notEmpty()
    .withMessage("Mẫu xe là bắt buộc"),
  body("color")
    .notEmpty()
    .withMessage("Màu xe là bắt buộc"),
  body("seatCount")
    .notEmpty()
    .withMessage("Số chỗ ngồi là bắt buộc")
    .bail()
    .isInt({ min: 1 })
    .withMessage("seatCount phải là số nguyên >= 1"),
  body("inspectionExpiry")
    .notEmpty()
    .withMessage("Hạn đăng kiểm là bắt buộc")
    .bail()
    .isISO8601()
    .withMessage("inspectionExpiry phải là ngày hợp lệ theo ISO 8601"),
];

export const validateLoginBody = [
  body("email")
    .notEmpty()
    .withMessage("Email là bắt buộc")
    .bail()
    .isEmail()
    .withMessage("Email không hợp lệ"),
  body("password")
    .notEmpty()
    .withMessage("Mật khẩu là bắt buộc"),
];

export const validateSendOtpBody = [
  body("email")
    .notEmpty()
    .withMessage("Email là bắt buộc")
    .bail()
    .isEmail()
    .withMessage("Email không hợp lệ"),
];

export const validateVerifyOtpBody = [
  body("email")
    .notEmpty()
    .withMessage("Email là bắt buộc")
    .bail()
    .isEmail()
    .withMessage("Email không hợp lệ"),
  body("otp")
    .notEmpty()
    .withMessage("Mã OTP là bắt buộc"),
];

export const validateRefreshTokenBody = [
  body("refreshToken")
    .notEmpty()
    .withMessage("RefreshToken là bắt buộc"),
];
