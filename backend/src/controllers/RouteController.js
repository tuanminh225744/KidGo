import * as routeService from "../services/route.service.js";
import { success, error } from "../utils/response.js";

/**
 * GET /api/v1/routes
 * Danh sách lộ trình đã lưu của phụ huynh
 */
export const getRoutes = async (req, res, next) => {
  try {
    const result = await routeService.getRoutesByParent(req.user.id);
    return success(
      res,
      { count: result.data.length, data: result.data },
      result.message,
      200,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/routes
 * Tạo lộ trình mới
 */
export const createRoute = async (req, res, next) => {
  try {
    const routeData = {
      ...req.body,
      parentId: req.user.id,
    };

    const result = await routeService.createRoute(routeData);
    return success(
      res,
      result.data,
      result.message || "Tạo lộ trình thành công.",
      201,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/routes/:routeId
 * Chi tiết một lộ trình
 */
export const getRouteDetail = async (req, res, next) => {
  try {
    const result = await routeService.getRouteById(req.params.routeId);
    const route = result.data;
    // Verify route belongs to user
    if (route.parentId.toString() !== req.user.id.toString()) {
      return error(res, "Bạn không có quyền truy cập lộ trình này.", 403);
    }
    return success(res, route, result.message, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/routes/:routeId
 * Cập nhật lộ trình
 */
export const updateRoute = async (req, res, next) => {
  try {
    const fetch = await routeService.getRouteById(req.params.routeId);
    const route = fetch.data;
    // Verify route belongs to user
    if (route.parentId.toString() !== req.user.id.toString()) {
      return error(res, "Bạn không có quyền cập nhật lộ trình này.", 403);
    }
    const updated = await routeService.updateRoute(
      req.params.routeId,
      req.body,
    );
    return success(
      res,
      updated.data,
      updated.message || "Cập nhật lộ trình thành công.",
      200,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/routes/:routeId
 * Xóa lộ trình
 */
export const deleteRoute = async (req, res, next) => {
  try {
    const fetch = await routeService.getRouteById(req.params.routeId);
    const route = fetch.data;
    // Verify route belongs to user
    if (route.parentId.toString() !== req.user.id.toString()) {
      return error(res, "Bạn không có quyền xóa lộ trình này.", 403);
    }
    await routeService.deleteRoute(req.params.routeId);
    return success(res, null, "Xóa lộ trình thành công.", 200);
  } catch (error) {
    next(error);
  }
};
