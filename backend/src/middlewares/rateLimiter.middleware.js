import redisClient from "../config/redisClient.js";
import { TooManyRequestsError } from "../utils/AppError.js";

/**
 * Rate Limiting middleware
 * Giới hạn số lượng request từ một IP trong khoảng thời gian nhất định
 */
export const rateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  return async (req, res, next) => {
    try {
      const clientIp = req.ip || req.connection.remoteAddress;
      const key = `rate_limit:${clientIp}`;
      const ttlSeconds = Math.ceil(windowMs / 1000);

      const pipeline = redisClient.pipeline();
      pipeline.incr(key);
      pipeline.expire(key, ttlSeconds, "NX");
      const results = await pipeline.exec();
      const requests = results[0][1];

      // Set response headers
      res.setHeader("X-RateLimit-Limit", maxRequests);
      res.setHeader(
        "X-RateLimit-Remaining",
        Math.max(0, maxRequests - requests),
      );
      res.setHeader(
        "X-RateLimit-Reset",
        new Date(Date.now() + windowMs).toISOString(),
      );

      if (requests > maxRequests) {
        const retryAfterSeconds = Math.ceil(windowMs / 1000);
        const error = new TooManyRequestsError(
          `Quá nhiều request. Vui lòng thử lại sau ${retryAfterSeconds} giây.`,
          retryAfterSeconds,
        );
        return next(error);
      }

      next();
    } catch (error) {
      console.error("[Rate Limiter Error]", error);
      // Nếu Redis lỗi, cho phép request đi qua
      next();
    }
  };
};

/**
 * Rate Limiter riêng cho Auth endpoints (chặt hơn)
 */
export const authLimiter = rateLimiter(15 * 60 * 1000, 5); // 5 requests per 15 minutes

/**
 * Rate Limiter cho API endpoints (thường hơn)
 */
export const apiLimiter = rateLimiter(15 * 60 * 1000, 100); // 100 requests per 15 minutes
