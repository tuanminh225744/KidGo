/**
 * Global error handler middleware
 * Xử lý tất cả các lỗi từ các route handlers
 * Phải đặt ở cuối cùng sau tất cả các route definitions
 */
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
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Lỗi server nội bộ.",
      ...(err.errors && { errors: err.errors }),
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ.",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "ID không hợp lệ.",
    });
  }

  // Duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      message: `${field} đã tồn tại.`,
    });
  }

  // Set Retry-After header cho rate limit error
  if (err.name === "TooManyRequestsError") {
    if (err.retryAfter) res.setHeader("Retry-After", err.retryAfter);
    return res.status(429).json({
      success: false,
      message: err.message,
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || "Lỗi server nội bộ.";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * 404 handler - phải đặt trước error handler
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Không tìm thấy endpoint: ${req.method} ${req.path}`,
  });
};
