import { body, param } from "express-validator";

export const validateRouteIdParam = [
  param("routeId")
    .isMongoId()
    .withMessage("routeId phải là định dạng ObjectID hợp lệ"),
];

export const validateCreateRoute = [
  body("name")
    .optional()
    .isString()
    .withMessage("name phải là chuỗi văn bản")
    .trim(),

  body("pickupAddress")
    .notEmpty()
    .withMessage("pickupAddress là bắt buộc")
    .bail()
    .isString()
    .withMessage("pickupAddress phải là chuỗi văn bản")
    .trim(),

  body("pickupCoords")
    .notEmpty()
    .withMessage("pickupCoords là bắt buộc")
    .bail()
    .custom((value) => {
      if (!value.type || value.type !== "Point") {
        throw new Error('pickupCoords phải có type: "Point"');
      }
      if (!Array.isArray(value.coordinates) || value.coordinates.length !== 2) {
        throw new Error("pickupCoords.coordinates phải là mảng [lng, lat]");
      }
      return true;
    }),

  body("dropoffAddress")
    .notEmpty()
    .withMessage("dropoffAddress là bắt buộc")
    .bail()
    .isString()
    .withMessage("dropoffAddress phải là chuỗi văn bản")
    .trim(),

  body("dropoffCoords")
    .notEmpty()
    .withMessage("dropoffCoords là bắt buộc")
    .bail()
    .custom((value) => {
      if (!value.type || value.type !== "Point") {
        throw new Error('dropoffCoords phải có type: "Point"');
      }
      if (!Array.isArray(value.coordinates) || value.coordinates.length !== 2) {
        throw new Error("dropoffCoords.coordinates phải là mảng [lng, lat]");
      }
      return true;
    }),

  body("estimatedDuration")
    .optional()
    .isInt({ min: 0 })
    .withMessage("estimatedDuration phải là số nguyên dương"),

  body("estimatedDistance")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("estimatedDistance phải là số dương"),

  body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault phải là boolean"),

  body("waypoints")
    .optional()
    .isArray()
    .withMessage("waypoints phải là mảng")
    .custom((value) => {
      if (Array.isArray(value)) {
        value.forEach((wp, idx) => {
          if (!wp.type || wp.type !== "Point") {
            throw new Error(`waypoints[${idx}] phải có type: "Point"`);
          }
          if (!Array.isArray(wp.coordinates) || wp.coordinates.length !== 2) {
            throw new Error(
              `waypoints[${idx}].coordinates phải là mảng [lng, lat]`,
            );
          }
        });
      }
      return true;
    }),
];

export const validateUpdateRoute = [
  ...validateRouteIdParam,

  body("name")
    .optional()
    .isString()
    .withMessage("name phải là chuỗi văn bản")
    .bail()
    .notEmpty()
    .withMessage("name không được để trống")
    .trim(),

  body("pickupAddress")
    .optional()
    .isString()
    .withMessage("pickupAddress phải là chuỗi văn bản")
    .bail()
    .notEmpty()
    .withMessage("pickupAddress không được để trống")
    .trim(),

  body("pickupCoords")
    .optional()
    .custom((value) => {
      if (!value.type || value.type !== "Point") {
        throw new Error('pickupCoords phải có type: "Point"');
      }
      if (!Array.isArray(value.coordinates) || value.coordinates.length !== 2) {
        throw new Error("pickupCoords.coordinates phải là mảng [lng, lat]");
      }
      return true;
    }),

  body("dropoffAddress")
    .optional()
    .isString()
    .withMessage("dropoffAddress phải là chuỗi văn bản")
    .bail()
    .notEmpty()
    .withMessage("dropoffAddress không được để trống")
    .trim(),

  body("dropoffCoords")
    .optional()
    .custom((value) => {
      if (!value.type || value.type !== "Point") {
        throw new Error('dropoffCoords phải có type: "Point"');
      }
      if (!Array.isArray(value.coordinates) || value.coordinates.length !== 2) {
        throw new Error("dropoffCoords.coordinates phải là mảng [lng, lat]");
      }
      return true;
    }),

  body("estimatedDuration")
    .optional()
    .isInt({ min: 0 })
    .withMessage("estimatedDuration phải là số nguyên dương"),

  body("estimatedDistance")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("estimatedDistance phải là số dương"),

  body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault phải là boolean"),

  body("waypoints")
    .optional()
    .isArray()
    .withMessage("waypoints phải là mảng")
    .custom((value) => {
      if (Array.isArray(value)) {
        value.forEach((wp, idx) => {
          if (!wp.type || wp.type !== "Point") {
            throw new Error(`waypoints[${idx}] phải có type: "Point"`);
          }
          if (!Array.isArray(wp.coordinates) || wp.coordinates.length !== 2) {
            throw new Error(
              `waypoints[${idx}].coordinates phải là mảng [lng, lat]`,
            );
          }
        });
      }
      return true;
    }),
];
