import { body, param } from "express-validator";

export const validatePaymentIdParam = [
  param("paymentId")
    .isMongoId()
    .withMessage("paymentId phải là định dạng ObjectID hợp lệ"),
];

export const validatePreviewPayment = [
  body("tripScheduleId").isMongoId().withMessage("tripScheduleId không hợp lệ"),
];

export const validateCreatePayment = [
  body("tripScheduleId").isMongoId().withMessage("tripScheduleId không hợp lệ"),
  body("method")
    .isIn(["cash", "QRPayment"])
    .withMessage("method phải là cash hoặc QRPayment"),
];

export const validateUpdatePaymentStatus = [
  ...validatePaymentIdParam,
  body("status")
    .isIn(["pending", "completed", "failed", "refunded"])
    .withMessage("status không hợp lệ"),
];
