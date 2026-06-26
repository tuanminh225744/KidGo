/**
 * Models index — hệ thống đặt xe gia đình
 *
 * Core:       User, Kid, Driver, Vehicle
 * Ops:        Route, TripSchedule, Booking, Subscription, Trip
 * Support:    Review, Report, Notification, PreferredDriver
 */

// Core
export { default as User } from "./core/user.model.js";
export { default as Kid } from "./core/kid.model.js";
export { default as Driver } from "./core/driver.model.js";
export { default as Vehicle } from "./core/vehicle.model.js";

// Operational
export { default as Route } from "./operational/route.model.js";
export { default as TripSchedule } from "./operational/tripSchedule.model.js";
export { default as Booking } from "./operational/booking.model.js";
export { default as Subscription } from "./operational/subscription.model.js";
export { default as Trip } from "./operational/trip.model.js";

// Support
export { default as Review } from "./support/review.model.js";
export { default as Report } from "./support/report.model.js";
export { default as Notification } from "./support/notification.model.js";
export { default as PreferredDriver } from "./support/preferredDriver.model.js";
