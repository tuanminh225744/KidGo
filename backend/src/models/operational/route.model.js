import { Schema, model, models } from "mongoose";
import { PointSchema } from "../geoSchemas.js";

const RouteSchema = new Schema({
  parentId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  name: { type: String }, // VD: "Đi học sáng"
  pickupAddress: { type: String },
  pickupCoords: { type: PointSchema },
  dropoffAddress: { type: String },
  dropoffCoords: { type: PointSchema },
  waypoints: { type: [PointSchema], default: [] },
  estimatedDuration: { type: Number }, // phút
  estimatedDistance: { type: Number }, // km
  isDefault: { type: Boolean, default: false },
});

RouteSchema.index({ pickupCoords: "2dsphere" });
RouteSchema.index({ dropoffCoords: "2dsphere" });

export default models.Route || model("Route", RouteSchema);
