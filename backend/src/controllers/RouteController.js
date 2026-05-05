import * as routeService from "../services/route.service.js";

/**
 * GET /api/v1/routes
 * Danh sách lộ trình đã lưu của phụ huynh
 */
export const getRoutes = async (req, res, next) => {
  try {
    const routes = await routeService.getRoutesByParent(req.user.id);

    res.status(200).json({
      success: true,
      count: routes.length,
      data: routes,
    });
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

    const route = await routeService.createRoute(routeData);

    res.status(201).json({
      success: true,
      message: "Tạo lộ trình thành công.",
      data: route,
    });
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
    const route = await routeService.getRouteById(req.params.routeId);

    // Verify route belongs to user
    if (route.parentId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập lộ trình này.",
      });
    }

    res.status(200).json({
      success: true,
      data: route,
    });
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
    const route = await routeService.getRouteById(req.params.routeId);

    // Verify route belongs to user
    if (route.parentId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền cập nhật lộ trình này.",
      });
    }

    const updatedRoute = await routeService.updateRoute(
      req.params.routeId,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Cập nhật lộ trình thành công.",
      data: updatedRoute,
    });
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
    const route = await routeService.getRouteById(req.params.routeId);

    // Verify route belongs to user
    if (route.parentId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa lộ trình này.",
      });
    }

    await routeService.deleteRoute(req.params.routeId);

    res.status(200).json({
      success: true,
      message: "Xóa lộ trình thành công.",
    });
  } catch (error) {
    next(error);
  }
};
