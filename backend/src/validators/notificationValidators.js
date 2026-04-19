import { body } from "express-validator";

export const validateCreateNotification = [
  body("recipientId")
    .exists()
    .withMessage("recipientId là bắt buộc")
    .isMongoId()
    .withMessage("recipientId phải là định dạng ObjectID hợp lệ"),

  body("recipientType")
    .exists()
    .withMessage("recipientType là bắt buộc")
    .isIn(["parent", "driver", "admin"])
    .withMessage("recipientType chỉ có thể là 'parent', 'driver', hoặc 'admin'"),

  body("type")
    .optional()
    .isString()
    .withMessage("type phải là định dạng chuỗi"),

  body("title")
    .optional()
    .isString()
    .withMessage("title phải là chuỗi văn bản"),

  body("body")
    .optional()
    .isString()
    .withMessage("body phải là chuỗi văn bản"),

  body("channel")
    .optional()
    .isIn(["push", "sms", "call"])
    .withMessage("channel chỉ có thể là 'push', 'sms', hoặc 'call'"),
];
