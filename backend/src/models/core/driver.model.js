import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;
import { PointSchema } from "../geoSchemas.js";

const DriverSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    licenseNumber: { type: String, required: true, unique: true },
    licenseExpiry: { type: Date },
    status: {
      type: String,
      enum: ["pending", "active", "suspended", "rejected"], //Đang chờ, được chấp nhận, bị đình chỉ, từ chối
      default: "pending",
      index: true,
    },
    isOnline: { type: Boolean, default: false, index: true },
    rideStatus: { type: String, enum: ['free', 'driving_to_pickup', 'waiting_for_kid', 'in_trip'], default: 'free', index: true },
    currentLocation: { type: PointSchema },
    certificationLevel: { type: Number, min: 0, max: 5, default: 0 },
    totalTrips: { type: Number, default: 0 },
    rating: { type: Number, min: 1, max: 5 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

DriverSchema.index({ currentLocation: "2dsphere" });

export default models.Driver || model("Driver", DriverSchema);
