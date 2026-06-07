import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

// Embedded sub-schema cho plannedRoute
const PlannedRouteSchema = new Schema(
  {
    pickupAddress: { type: String },
    pickupCoords: {
      type: { type: String, default: "Point" },
      coordinates: [Number],
    },
    dropoffAddress: { type: String },
    dropoffCoords: {
      type: { type: String, default: "Point" },
      coordinates: [Number],
    },
    waypoints: { type: Array, default: [] },
    estimatedDuration: { type: Number },
    estimatedDistance: { type: Number },
  },
  { _id: false },
);

const VerificationFieldSchema = new Schema(
  {
    required: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "passed", "failed", "not_required"],
      default: "not_required",
      index: true,
    },
    data: { type: Schema.Types.Mixed, default: null },
    verifiedAt: { type: Date, default: null },
  },
  { _id: false },
);

const TripSchema = new Schema(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    driverId: { type: Schema.Types.ObjectId, ref: "Driver", required: true },
    kidId: { type: Schema.Types.ObjectId, ref: "Kid", required: true },
    parentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true },
    status: {
      type: String,
      enum: ["scheduled", "picking_up", "in_progress", "completed", "cancelled"],
      default: "scheduled",
      index: true,
    },
    plannedRoute: { type: PlannedRouteSchema },
    otp: { type: VerificationFieldSchema, default: () => ({}) },
    pickupPhoto: { type: VerificationFieldSchema, default: () => ({}) },
    dropoffPhoto: { type: VerificationFieldSchema, default: () => ({}) },
    securityQuestion: { type: VerificationFieldSchema, default: () => ({}) },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export default models.Trip || model("Trip", TripSchema);
