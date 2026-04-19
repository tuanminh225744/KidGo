import { body } from "express-validator";

export const validateUpsertReview = [
  body("tripId")
    .exists()
    .withMessage("tripId là bắt buộc")
    .isMongoId()
    .withMessage("tripId phải là một định dạng ObjectID hợp lệ"),

  body("rating")
    .exists()
    .withMessage("rating là bắt buộc")
    .isInt({ min: 1, max: 5 })
    .withMessage("rating phải là một số nguyên từ 1 tới 5"),

  body("comment")
    .optional()
    .isString()
    .withMessage("comment phải là một chuỗi văn bản")
    .isLength({ max: 1000 })
    .withMessage("comment quá dài (tối đa 1000 ký tự)"),

  body("tags")
    .optional()
    .isArray()
    .withMessage("tags phải là một mảng các chuỗi"),

  body("tags.*")
    .optional()
    .isString()
    .withMessage("Mọi phần tử trong tags phải là chuỗi"),
];
