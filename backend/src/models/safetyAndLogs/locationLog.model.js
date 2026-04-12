import { Schema, model, models } from "mongoose";
import { PointSchema } from "../geoSchemas.js";

const LocationLogSchema = new Schema({
  tripId: {
    type: Schema.Types.ObjectId,
    ref: "Trip",
    required: true,
    index: true,
  },
  coords: { type: PointSchema, required: true },
  speed: { type: Number }, // km/h
  heading: { type: Number }, // 0–360°
  accuracy: { type: Number }, // mét
  recordedAt: { type: Date, required: true, index: true },
});

LocationLogSchema.index({ coords: "2dsphere" });

export default models.LocationLog || model("LocationLog", LocationLogSchema);
