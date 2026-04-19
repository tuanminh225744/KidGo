import express from "express";
import { getAdminStats, getReports } from "../controllers/DashboardController.js";
import {
  authenticateToken,
  authorize,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticateToken);
router.use(authorize("admin"));

// Route: GET /dashboard/admin/stats
// Admin lấy thống kê cơ bản
router.get("/admin/stats", getAdminStats);

// Route: GET /dashboard/admin/reports
// Admin lấy báo cáo analytics
router.get("/admin/reports", getReports);

export default router;
