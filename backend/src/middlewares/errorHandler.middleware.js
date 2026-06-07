/**
 * Global error handler middleware
 * Xử lý tất cả các lỗi từ các route handlers
 * Phải đặt ở cuối cùng sau tất cả các route definitions
 */
import { error } from "../utils/response.js";

export const errorHandler = (err, req, res, next) => {
  console.error("[Error Handler]", {
    name: err.name,
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // AppError (Custom error class - operational errors)
  if (err.isOperational) {
    return error(
      res,
      err.message || "Lỗi server nội bộ.",
      err.statusCode || 500,
    );
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return error(res, "Dữ liệu không hợp lệ.", 400);
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    return error(res, "ID không hợp lệ.", 400);
  }

  // Duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return error(res, `${field} đã tồn tại.`, 409);
  }

  // Set Retry-After header cho rate limit error
  if (err.name === "TooManyRequestsError") {
    if (err.retryAfter) res.setHeader("Retry-After", err.retryAfter);
    return error(res, err.message, 429);
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || "Lỗi server nội bộ.";

  return error(res, message, statusCode);
};

/**
 * 404 handler - phải đặt trước error handler
 */
export const notFoundHandler = (req, res, next) => {
  return error(res, `Không tìm thấy endpoint: ${req.method} ${req.path}`, 404);
};
