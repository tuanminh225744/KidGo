import jwt from "jsonwebtoken";
import User from "../models/core/user.model.js";
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
} from "../utils/AppError.js";

/**
 * Middleware xác thực JWT token
 * Kiểm tra token hợp lệ và lấy thông tin user từ token
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      throw new AuthenticationError("Token không tồn tại. Vui lòng đăng nhập.");
    }

    if (!process.env.JWT_SECRET) {
      return next(new AppError("Cấu hình server thiếu JWT_SECRET.", 500));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user)
      return next(new AuthenticationError("Người dùng không tồn tại."));
    if (!user.isActive)
      return next(new AuthenticationError("Tài khoản đã bị vô hiệu hóa."));
    req.user = user;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(
        new AuthenticationError("Token đã hết hạn. Vui lòng đăng nhập lại."),
      );
    }
    if (error instanceof AuthenticationError) {
      return next(error);
    }
    return next(new AuthenticationError("Token không hợp lệ."));
  }
};

/**
 * Middleware phân quyền theo role
 * Kiểm tra xem user có role được phép không
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError("Vui lòng xác thực trước."));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AuthorizationError(
          `Bạn không có quyền truy cập. Yêu cầu role: ${allowedRoles.join(", ")}`,
        ),
      );
    }

    next();
  };
};

/**
 * Middleware kiểm tra user có phải là chủ sở hữu của resource không
 * Dùng cho các endpoint cần xác thực ownership
 */
export const checkOwnership = (userIdParam = "userId") => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError("Vui lòng xác thực trước."));
    }

    const resourceOwnerId = req.params[userIdParam] || req.body[userIdParam];
    if (
      req.user.id.toString() !== resourceOwnerId &&
      req.user.role !== "admin"
    ) {
      return next(
        new AuthorizationError("Bạn không có quyền truy cập tài nguyên này."),
      );
    }

    next();
  };
};
