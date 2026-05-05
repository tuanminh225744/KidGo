import * as preferredDriverService from "../services/preferredDriver.service.js";
import { AppError } from "../utils/AppError.js";

/**
 * GET /api/v1/preferred-drivers
 * Danh sách tài xế ưu tiên của phụ huynh
 */
export const getPreferredDrivers = async (req, res, next) => {
  try {
    const drivers = await preferredDriverService.getPreferredDrivers(
      req.user.id,
    );

    res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers,
    });
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

    const preferredDriver = await preferredDriverService.addPreferredDriver({
      parentId: req.user.id,
      driverId,
      nickname,
      priority,
    });

    res.status(201).json({
      success: true,
      message: "Thêm tài xế vào danh sách ưu tiên thành công.",
      data: preferredDriver,
    });
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

    const updated = await preferredDriverService.updatePreferredDriver(
      req.user.id,
      req.params.driverId,
      updateData,
    );

    res.status(200).json({
      success: true,
      message: "Cập nhật tài xế ưu tiên thành công.",
      data: updated,
    });
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

    res.status(200).json({
      success: true,
      message: "Xóa tài xế khỏi danh sách ưu tiên thành công.",
    });
  } catch (error) {
    next(error);
  }
};
