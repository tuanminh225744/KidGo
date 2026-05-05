import {
  listDriversAdmin,
  getDriverDetailAdmin,
  approveDriver,
  rejectDriver,
  suspendDriver,
  updateCertification,
  getLiveDriverLocation,
} from "../services/driver.service.js";

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
    res.status(200).json({ success: true, ...result });
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
    const driver = await getDriverDetailAdmin(driverId);
    res.status(200).json({ success: true, data: driver });
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
    const driver = await approveDriver(driverId);
    res.status(200).json({
      success: true,
      message: "Hồ sơ tài xế đã được duyệt.",
      data: driver,
    });
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
    const driver = await rejectDriver(driverId);
    res.status(200).json({
      success: true,
      message: "Hồ sơ tài xế đã bị từ chối.",
      data: driver,
    });
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
    const driver = await suspendDriver(driverId);
    res.status(200).json({
      success: true,
      message: "Tài xế đã bị tạm khóa.",
      data: driver,
    });
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
      return res.status(400).json({ success: false, message: "certificationLevel là bắt buộc." });
    }

    const driver = await updateCertification(driverId, +certificationLevel);
    res.status(200).json({
      success: true,
      message: `Cấp chứng nhận đã cập nhật thành ${certificationLevel}.`,
      data: driver,
    });
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
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
