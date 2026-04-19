import * as dashboardService from "../services/dashboard.service.js";

export const getAdminStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getAdminDashboardStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

export const getReports = async (req, res, next) => {
  try {
    const reports = await dashboardService.getAdvancedReports();
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    next(error);
  }
};
