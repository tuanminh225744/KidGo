import * as userService from "../services/user.service.js";
import { success, error } from "../utils/response.js";

/**
 * GET /api/v1/admin/users
 * Danh sách phụ huynh (filter + search + phân trang)
 * Role: admin
 */
export const listParents = async (req, res, next) => {
  try {
    const { search, isActive, page, limit } = req.query;
    const result = await userService.listParents({
      search,
      isActive: isActive !== undefined ? isActive === "true" : undefined,
      page: +page || 1,
      limit: +limit || 20,
    });
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/users/:userId
 * Chi tiết phụ huynh
 * Role: admin
 */
export const getParentDetail = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await userService.getParentById(userId);
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/users/:userId/suspend
 * Khóa tài khoản phụ huynh
 * Role: admin
 */
export const suspendUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await userService.suspendUser(userId);
    return success(
      res,
      result.data,
      result.message || "Tài khoản đã bị khóa.",
      200,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/users/:userId/reactivate
 * Mở khóa tài khoản
 * Role: admin
 */
export const reactivateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await userService.reactivateUser(userId);
    return success(
      res,
      result.data,
      result.message || "Tài khoản đã được mở khóa.",
      200,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/admin/users/:id/status  (legacy — giữ lại để không break)
 */
export const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
      return error(res, "isActive phải là boolean.", 400);
    }
    const result = isActive
      ? await userService.reactivateUser(id)
      : await userService.suspendUser(id);
    return success(
      res,
      result.data,
      result.message || `Tài khoản đã được ${isActive ? "mở khóa" : "khóa"}.`,
      200,
    );
  } catch (error) {
    next(error);
  }
};
