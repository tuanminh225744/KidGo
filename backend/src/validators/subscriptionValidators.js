import { body, param } from "express-validator";

export const validateSubscriptionIdParam = [
  param("subId")
    .isMongoId()
    .withMessage("subId phải là định dạng ObjectID hợp lệ"),
];

export const validateCreateSubscription = [
  body("plan")
    .notEmpty()
    .withMessage("plan là bắt buộc")
    .bail()
    .isIn(["monthly", "yearly"])
    .withMessage("plan phải là: monthly hoặc yearly"),
];
