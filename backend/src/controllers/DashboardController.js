import * as dashboardService from "../services/dashboard.service.js";
import { success } from "../utils/response.js";

export const getAdminStats = async (req, res, next) => {
  try {
    const result = await dashboardService.getAdminDashboardStats();
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};

export const getFullAdminStats = async (req, res, next) => {
  try {
    const result = await dashboardService.getFullAdminDashboardStats();
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};

export const getReports = async (req, res, next) => {
  try {
    const result = await dashboardService.getAdvancedReports();
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};
