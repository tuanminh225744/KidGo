import Route from "../models/operational/route.model.js";
import { AppError, NotFoundError } from "../utils/AppError.js";
import mongoose from "mongoose";

// Create a plain GeoJSON object. We include `recordedAt` here because
// using `Route.updateMany(..., { $push: ... })` performs a direct update
// and Mongoose schema defaults (like PointSchema.recordedAt) are NOT applied.
const Point = (lat, lng) => ({
  type: "Point",
  coordinates: [lng, lat],
  recordedAt: new Date(),
});

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

/**
 * Append an actual waypoint (every ~30s) to ongoing routes.
 * Matches routes that have started (scheduledPickupTime <= now)
 * and not yet completed (actualDropoffTime is null/undefined).
 * @param {Number|String} driverId - driver identifier (logged for trace)
 * @param {Number} lat
 * @param {Number} lng
 */
/**
 * Append actual waypoint. If `routeId` is provided, only update that route.
 * @param {Number|String} driverId
 * @param {Number} lat
 * @param {Number} lng
 * @param {ObjectId} routeId
 */
export const appendActualWaypoint = async (driverId, lat, lng, routeId) => {
  // Build GeoJSON point
  const geoPoint = Point(lat, lng);

  // Match candidate ongoing routes
  const now = new Date();

  try {
    // Push into actualWaypoints for all matched routes
    const res = await Route.updateMany(
      { _id: routeId },
      {
        $push: { actualWaypoints: geoPoint },
      },
    );
    console.log(
      `[RouteService] Appended actual waypoint for driver ${driverId} to route ${routeId}. Matched: ${res.matchedCount}, Modified: ${res.modifiedCount}`,
    );
    return {
      success: true,
      message: "Waypoints appended",
      data: {
        matchedCount: res.matchedCount,
        modifiedCount: res.modifiedCount,
      },
    };
  } catch (error) {
    console.error("Error appending actual waypoint:", error);
    return { success: false, message: "Error appending waypoint" };
  }
};
