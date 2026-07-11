import express from "express";
import {
  getAllTrips,
  getLiveTrips,
  getTripDetailAdmin,
} from "../controllers/AdminTripController.js";
import {
  authenticateToken,
  authorize,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticateToken);
router.use(authorize("admin"));

router.get("/", getAllTrips);
router.get("/live", getLiveTrips);
router.get("/:tripId", getTripDetailAdmin);

export default router;
