import express from "express";
import {
  listDrivers,
  getDriverDetail,
  approveDriverHandler,
  rejectDriverHandler,
  suspendDriverHandler,
  updateCertificationHandler,
  getDriverLiveLocation,
} from "../controllers/AdminDriverController.js";
import {
  authenticateToken,
  authorize,
} from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  validateDriverIdParam,
  validateListDriversQuery,
  validateCertificationBody,
} from "../validators/adminDriverValidators.js";

const router = express.Router();

router.use(authenticateToken);
router.use(authorize("admin"));

router.get("/", validateListDriversQuery, validate, listDrivers);
router.get("/:driverId", validateDriverIdParam, validate, getDriverDetail);
router.patch(
  "/:driverId/approve",
  validateDriverIdParam,
  validate,
  approveDriverHandler,
);
router.patch(
  "/:driverId/reject",
  validateDriverIdParam,
  validate,
  rejectDriverHandler,
);
router.patch(
  "/:driverId/suspend",
  validateDriverIdParam,
  validate,
  suspendDriverHandler,
);
router.patch(
  "/:driverId/certification",
  validateDriverIdParam,
  validateCertificationBody,
  validate,
  updateCertificationHandler,
);
router.get(
  "/:driverId/location",
  validateDriverIdParam,
  validate,
  getDriverLiveLocation,
);

export default router;
