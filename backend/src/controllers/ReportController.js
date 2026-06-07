import * as reportService from "../services/report.service.js";

/**
 * POST /api/v1/reports
 * Phụ huynh tạo report cho chuyến đi
 * Role: parent
 */
export const createReport = async (req, res, next) => {
  try {
    const report = await reportService.createReport(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: "Đã tạo report thành công.",
      data: report,
    });
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
    res.status(200).json({
      success: true,
      count: result.reports.length,
      data: result,
    });
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
    const report = await reportService.deleteReport(reportId, req.user);
    res.status(200).json({
      success: true,
      message: "Đã xóa report thành công.",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};
