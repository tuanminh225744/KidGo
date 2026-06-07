import {
  listDriversAdmin,
  getDriverDetailAdmin,
  approveDriver,
  rejectDriver,
  suspendDriver,
  updateCertification,
  getLiveDriverLocation,
} from "../services/driver.service.js";
import { success, error } from "../utils/response.js";

/**
 * GET /api/v1/admin/drivers
 * Danh sách tài xế (filter theo status, tìm kiếm, phân trang)
 * Role: admin
 */
export const listDrivers = async (req, res, next) => {
  try {
    const { status, search, page, limit } = req.query;
    const result = await listDriversAdmin({
      status,
      search,
      page: +page || 1,
      limit: +limit || 20,
    });
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/drivers/:driverId
 * Chi tiết hồ sơ tài xế
 * Role: admin
 */
export const getDriverDetail = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const result = await getDriverDetailAdmin(driverId);
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/drivers/:driverId/approve
 * Duyệt hồ sơ tài xế
 * Role: admin
 */
export const approveDriverHandler = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const result = await approveDriver(driverId);
    return success(
      res,
      result.data,
      result.message || "Hồ sơ tài xế đã được duyệt.",
      200,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/drivers/:driverId/reject
 * Từ chối hồ sơ tài xế
 * Role: admin
 */
export const rejectDriverHandler = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const result = await rejectDriver(driverId);
    return success(
      res,
      result.data,
      result.message || "Hồ sơ tài xế đã bị từ chối.",
      200,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/drivers/:driverId/suspend
 * Tạm khóa tài xế
 * Role: admin
 */
export const suspendDriverHandler = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const result = await suspendDriver(driverId);
    return success(
      res,
      result.data,
      result.message || "Tài xế đã bị tạm khóa.",
      200,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/drivers/:driverId/certification
 * Điều chỉnh cấp chứng nhận tài xế (0-5)
 * Role: admin
 * Body: { certificationLevel }
 */
export const updateCertificationHandler = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const { certificationLevel } = req.body;

    if (certificationLevel === undefined || certificationLevel === null) {
      return error(res, "certificationLevel là bắt buộc.", 400);
    }

    const result = await updateCertification(driverId, +certificationLevel);
    return success(
      res,
      result.data,
      result.message ||
        `Cấp chứng nhận đã cập nhật thành ${certificationLevel}.`,
      200,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/drivers/:driverId/location
 * Vị trí live của tài xế (từ Redis)
 * Role: admin
 */
export const getDriverLiveLocation = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const result = await getLiveDriverLocation(driverId);
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};
