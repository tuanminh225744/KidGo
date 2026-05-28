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

  body("tripsPerMonth")
    .notEmpty()
    .withMessage("tripsPerMonth là bắt buộc")
    .bail()
    .isInt({ min: 1 })
    .withMessage("tripsPerMonth phải là số nguyên >= 1"),

  body("price")
    .notEmpty()
    .withMessage("price là bắt buộc")
    .bail()
    .isFloat({ min: 0 })
    .withMessage("price phải là số dương"),
];

export const validateToggleAutoRenew = [
  ...validateSubscriptionIdParam,

  body("autoRenew")
    .notEmpty()
    .withMessage("autoRenew là bắt buộc")
    .bail()
    .isBoolean()
    .withMessage("autoRenew phải là boolean"),
];
