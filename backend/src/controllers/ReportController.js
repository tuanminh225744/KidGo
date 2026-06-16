import * as reportService from "../services/report.service.js";
import { success, error } from "../utils/response.js";

/**
 * POST /api/v1/reports
 * Phụ huynh tạo report cho chuyến đi
 * Role: parent
 */
export const createReport = async (req, res, next) => {
  try {
    const result = await reportService.createReport(req.user.id, req.body);
    return success(
      res,
      result.data,
      result.message || "Đã tạo report thành công.",
      201,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/reports/trip/:tripId
 * Lấy danh sách report theo tripId
 * Role: parent | admin
 */
export const getReportsByTripIdHandler = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const result = await reportService.getReportsByTripId(tripId, req.user);
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/reports/:reportId
 * Xóa report theo id
 * Role: parent | admin
 */
export const deleteReportHandler = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const result = await reportService.deleteReport(reportId, req.user);
    return success(
      res,
      result.data,
      result.message || "Đã xóa report thành công.",
      200,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/reports/:reportId/reply
 * Admin trả lời report
 * Role: admin
 */
export const adminReplyHandler = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const { adminAnswer } = req.body;
    const result = await reportService.adminReply(
      reportId,
      req.user.id,
      adminAnswer,
    );
    return success(
      res,
      result.data,
      result.message || "Đã phản hồi report.",
      200,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/reports/me
 * Lấy danh sách report của phụ huynh
 * Role: parent
 */
export const getReportsByParentIdHandler = async (req, res, next) => {
  try {
    const result = await reportService.getReportsByParentId(req.user.id);
    return success(res, result.data, result.message, 200);
  } catch (err) {
    next(err);
  }
};
