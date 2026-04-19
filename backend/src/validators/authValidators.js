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
