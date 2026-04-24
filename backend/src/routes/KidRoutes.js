import express from "express";
import {
  createKid,
  deleteKid,
  getKidDetail,
  getKidSecurityQuestion,
  getKids,
  setupKidSecurity,
  updateKidDetail,
  uploadKidAvatar,
  verifyKidSecurityAnswer,
} from "../controllers/KidController.js";
import {
  authenticateToken,
  authorize,
} from "../middlewares/auth.middleware.js";
import { uploadAvatar } from "../middlewares/upload.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  validateCreateKid,
  validateKidIdParam,
  validateSetupSecurityQuestion,
  validateUpdateKid,
  validateVerifySecurityAnswer,
} from "../validators/kidValidators.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/", authorize("parent"), getKids);
router.post("/", authorize("parent"), validateCreateKid, validate, createKid);

router.post(
  "/:kidId/upload-avatar",
  authorize("parent"),
  validateKidIdParam,
  validate,
  uploadAvatar.single("avatar"),
  uploadKidAvatar,
);

router.put(
  "/:kidId/security-question",
  authorize("parent"),
  validateSetupSecurityQuestion,
  validate,
  setupKidSecurity,
);

router.get(
  "/:kidId/security-question",
  authorize("driver"),
  validateKidIdParam,
  validate,
  getKidSecurityQuestion,
);

router.post(
  "/:kidId/security-answer/verify",
  authorize("driver"),
  validateVerifySecurityAnswer,
  validate,
  verifyKidSecurityAnswer,
);

router.get(
  "/:kidId",
  authorize("parent"),
  validateKidIdParam,
  validate,
  getKidDetail,
);

router.put(
  "/:kidId",
  authorize("parent"),
  validateUpdateKid,
  validate,
  updateKidDetail,
);

router.delete(
  "/:kidId",
  authorize("parent"),
  validateKidIdParam,
  validate,
  deleteKid,
);

export default router;
