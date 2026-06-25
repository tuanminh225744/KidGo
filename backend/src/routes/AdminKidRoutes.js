import express from "express";
import { listKids, getKidDetail } from "../controllers/AdminKidController.js";
import {
  authenticateToken,
  authorize,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticateToken);
router.use(authorize("admin"));

// Route: GET /admin/kids
// Danh sách trẻ em (filter, search, phân trang)
router.get("/", listKids);

// Route: GET /admin/kids/:kidId
// Chi tiết trẻ em
router.get("/:kidId", getKidDetail);

export default router;
