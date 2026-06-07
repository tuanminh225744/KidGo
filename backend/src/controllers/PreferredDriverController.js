import * as preferredDriverService from "../services/preferredDriver.service.js";
import { AppError } from "../utils/AppError.js";
import { success, error } from "../utils/response.js";

/**
 * GET /api/v1/preferred-drivers
 * Danh sách tài xế ưu tiên của phụ huynh
 */
export const getPreferredDrivers = async (req, res, next) => {
  try {
    const result = await preferredDriverService.getPreferredDrivers(
      req.user.id,
    );
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
 * POST /api/v1/preferred-drivers
 * Thêm tài xế vào danh sách ưu tiên
 */
export const addPreferredDriver = async (req, res, next) => {
  try {
    const { driverId, nickname, priority } = req.body;

    const result = await preferredDriverService.addPreferredDriver({
      parentId: req.user.id,
      driverId,
      nickname,
      priority,
    });
    return success(
      res,
      result.data,
      result.message || "Thêm tài xế vào danh sách ưu tiên thành công.",
      201,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/preferred-drivers/:driverId
 * Cập nhật nickname, priority của tài xế ưu tiên
 */
export const updatePreferredDriver = async (req, res, next) => {
  try {
    const { nickname, priority } = req.body;
    const updateData = {};

    if (nickname !== undefined) {
      updateData.nickname = nickname;
    }
    if (priority !== undefined) {
      updateData.priority = priority;
    }

    if (Object.keys(updateData).length === 0) {
      throw new AppError("Phải cung cấp ít nhất một trường để cập nhật.", 400);
    }

    const result = await preferredDriverService.updatePreferredDriver(
      req.user.id,
      req.params.driverId,
      updateData,
    );
    return success(
      res,
      result.data,
      result.message || "Cập nhật tài xế ưu tiên thành công.",
      200,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/preferred-drivers/:driverId
 * Xóa tài xế khỏi danh sách ưu tiên
 */
export const removePreferredDriver = async (req, res, next) => {
  try {
    await preferredDriverService.removePreferredDriver(
      req.user.id,
      req.params.driverId,
    );
    return success(
      res,
      null,
      "Xóa tài xế khỏi danh sách ưu tiên thành công.",
      200,
    );
  } catch (error) {
    next(error);
  }
};
