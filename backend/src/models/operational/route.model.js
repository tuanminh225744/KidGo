import mongoose from "mongoose";
const { Schema, model, models } = mongoose;
import { PointSchema } from "../geoSchemas.js";

const RouteSchema = new Schema(
  {
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    actualPickupAddress: { type: String },
    actualDropoffAddress: { type: String },
    actualPickupCoords: { type: PointSchema },
    actualDropoffCoords: { type: PointSchema },
    actualDistance: { type: Number },
    actualDuration: { type: Number },
    estimatedPickupAddress: { type: String },
    estimatedDropoffAddress: { type: String },
    estimatedPickupCoords: { type: PointSchema },
    estimatedDropoffCoords: { type: PointSchema },
    estimatedDistance: { type: Number },
    estimatedDuration: { type: Number },
    estimatedWaypoints: { type: [PointSchema], default: [] },
    actualWaypoints: { type: [PointSchema], default: [] },
    scheduledPickupTime: { type: Date },
    actualPickupTime: { type: Date },
    scheduledDropoffTime: { type: Date },
    actualDropoffTime: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

RouteSchema.index({ actualPickupCoords: "2dsphere" });
RouteSchema.index({ actualDropoffCoords: "2dsphere" });
RouteSchema.index({ estimatedPickupCoords: "2dsphere" });
RouteSchema.index({ estimatedDropoffCoords: "2dsphere" });

export default models.Route || model("Route", RouteSchema);
