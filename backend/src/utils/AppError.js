/**
 * Custom Error Class cho App
 * Dùng để throw errors với statusCode và message, sau đó được xử lý bởi errorHandler middleware
 */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
    this.isOperational = true;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Custom Error cho validation
 */
export class ValidationError extends AppError {
  constructor(message = "Validation failed", errors = []) {
    super(message, 400);
    this.name = "ValidationError";
    this.errors = errors;
  }
}

/**
 * Custom Error cho authentication
 */
export class AuthenticationError extends AppError {
  constructor(message = "Authentication failed") {
    super(message, 401);
    this.name = "AuthenticationError";
  }
}

/**
 * Custom Error cho authorization/permission
 */
export class AuthorizationError extends AppError {
  constructor(message = "Access denied") {
    super(message, 403);
    this.name = "AuthorizationError";
  }
}

/**
 * Custom Error cho not found
 */
export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

/**
 * Custom Error cho rate limit exceeded
 */
export class TooManyRequestsError extends AppError {
  constructor(message = "Too many requests", retryAfter = null) {
    super(message, 429);
    this.name = "TooManyRequestsError";
    this.retryAfter = retryAfter;
  }
}
