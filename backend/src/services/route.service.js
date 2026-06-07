import Route from "../models/operational/route.model.js";
import { AppError, NotFoundError } from "../utils/AppError.js";

/**
 * Lấy danh sách tất cả lộ trình của phụ huynh
 */
export const getRoutesByParent = async (parentId) => {
  const list = await Route.find({ parentId }).sort({ createdAt: -1 });
  return { success: true, message: "Routes fetched", data: list };
};

/**
 * Tạo lộ trình mới
 */
export const createRoute = async (routeData) => {
  const route = new Route(routeData);
  const saved = await route.save();
  return { success: true, message: "Route created", data: saved };
};

/**
 * Lấy chi tiết một lộ trình
 */
export const getRouteById = async (routeId) => {
  const route = await Route.findById(routeId);
  if (!route) {
    throw new NotFoundError("Không tìm thấy lộ trình.");
  }
  return { success: true, message: "Route fetched", data: route };
};

/**
 * Cập nhật lộ trình
 */
export const updateRoute = async (routeId, updateData) => {
  const route = await Route.findByIdAndUpdate(
    routeId,
    { $set: updateData },
    { new: true, runValidators: true },
  );
  if (!route) {
    throw new NotFoundError("Không tìm thấy lộ trình.");
  }
  return { success: true, message: "Route updated", data: route };
};

/**
 * Xóa lộ trình
 */
export const deleteRoute = async (routeId) => {
  const route = await Route.findByIdAndDelete(routeId);
  if (!route) {
    throw new NotFoundError("Không tìm thấy lộ trình.");
  }
  return { success: true, message: "Route deleted", data: route };
};
