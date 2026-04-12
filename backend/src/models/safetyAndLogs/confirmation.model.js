import { Schema, model, models } from "mongoose";
import { PointSchema } from "./geoSchemas.js";

const ConfirmationSchema = new Schema({
  tripId: { type: Schema.Types.ObjectId, ref: "Trip", required: true },
  type: { type: String, enum: ["pickup", "dropoff"], required: true },
  photoUrl: { type: String },
  pinEntered: { type: String }, // hash của PIN nhập vào
  pinVerified: { type: Boolean, default: false },
  confirmedAt: { type: Date },
  confirmedByDriverId: { type: Schema.Types.ObjectId, ref: "Driver" },
  location: { type: PointSchema },
});

ConfirmationSchema.index({ location: "2dsphere" });

export default models.Confirmation || model("Confirmation", ConfirmationSchema);
