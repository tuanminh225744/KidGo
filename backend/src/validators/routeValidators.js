import { body, param } from "express-validator";

export const validateRouteIdParam = [
  param("routeId")
    .isMongoId()
    .withMessage("routeId phải là định dạng ObjectID hợp lệ"),
];

const validatePointField = (fieldName) =>
  body(fieldName).optional().custom((value) => {
    if (!value || typeof value !== "object") {
      throw new Error(`${fieldName} phải là một object GeoJSON Point hợp lệ`);
    }
    if (value.type !== "Point") {
      throw new Error(`${fieldName} phải có type: "Point"`);
    }
    if (!Array.isArray(value.coordinates) || value.coordinates.length !== 2) {
      throw new Error(`${fieldName}.coordinates phải là mảng [lng, lat]`);
    }
    return true;
  });

const validateWaypointArray = (fieldName) =>
  body(fieldName).optional().isArray().withMessage(`${fieldName} phải là mảng`)
    .custom((value) => {
      if (!Array.isArray(value)) return true;

      value.forEach((point, idx) => {
        if (!point || typeof point !== "object") {
          throw new Error(`${fieldName}[${idx}] phải là object GeoJSON Point`);
        }
        if (point.type !== "Point") {
          throw new Error(`${fieldName}[${idx}] phải có type: "Point"`);
        }
        if (
          !Array.isArray(point.coordinates) ||
          point.coordinates.length !== 2
        ) {
          throw new Error(
            `${fieldName}[${idx}].coordinates phải là mảng [lng, lat]`,
          );
        }
      });

      return true;
    });

const commonRouteBodyValidators = [
  body("actualPickupAddress")
    .optional()
    .isString()
    .withMessage("actualPickupAddress phải là chuỗi văn bản")
    .trim(),
  body("actualDropoffAddress")
    .optional()
    .isString()
    .withMessage("actualDropoffAddress phải là chuỗi văn bản")
    .trim(),
  body("actualDistance")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("actualDistance phải là số dương"),
  body("actualDuration")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("actualDuration phải là số dương"),
  body("estimatedPickupAddress")
    .optional()
    .isString()
    .withMessage("estimatedPickupAddress phải là chuỗi văn bản")
    .trim(),
  body("estimatedDropoffAddress")
    .optional()
    .isString()
    .withMessage("estimatedDropoffAddress phải là chuỗi văn bản")
    .trim(),
  body("estimatedDistance")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("estimatedDistance phải là số dương"),
  body("estimatedDuration")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("estimatedDuration phải là số dương"),
  body("scheduledPickupTime")
    .optional()
    .isISO8601()
    .withMessage("scheduledPickupTime phải là ngày hợp lệ")
    .toDate(),
  body("actualPickupTime")
    .optional()
    .isISO8601()
    .withMessage("actualPickupTime phải là ngày hợp lệ")
    .toDate(),
  body("scheduledDropoffTime")
    .optional()
    .isISO8601()
    .withMessage("scheduledDropoffTime phải là ngày hợp lệ")
    .toDate(),
  body("actualDropoffTime")
    .optional()
    .isISO8601()
    .withMessage("actualDropoffTime phải là ngày hợp lệ")
    .toDate(),
  validatePointField("actualPickupCoords"),
  validatePointField("actualDropoffCoords"),
  validatePointField("estimatedPickupCoords"),
  validatePointField("estimatedDropoffCoords"),
  validateWaypointArray("estimatedWaypoints"),
  validateWaypointArray("actualWaypoints"),
];

export const validateCreateRoute = [...commonRouteBodyValidators];

export const validateUpdateRoute = [
  ...validateRouteIdParam,
  ...commonRouteBodyValidators,
];
