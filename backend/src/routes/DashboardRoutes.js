import express from "express";
import { getAdminStats, getReports } from "../controllers/DashboardController.js";
import {
  authenticateToken,
  authorize,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticateToken);
router.use(authorize("admin"));

/**
 * GET /api/v1/admin/dashboard
 * Tổng quan: trips hôm nay, drivers online, open alerts
 */
router.get("/dashboard", getAdminStats);

/**
 * GET /api/v1/admin/reports
 * Báo cáo nâng cao (trips/ngày, alert rate)
 */
router.get("/reports", getReports);

export default router;
