import { validationResult } from "express-validator";
import { ValidationError } from "../utils/AppError.js";

/**
 * Hàm xử lý validation errors - sử dụng chung cho tất cả validators
 * Nếu có lỗi validation, throw ValidationError vào error handler
 * Ngược lại, tiếp tục đến middleware/controller tiếp theo
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array();
    return next(new ValidationError("Validation failed", errorList));
  }
  next();
};
