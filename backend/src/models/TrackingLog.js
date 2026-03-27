import mongoose from "mongoose";

const trackingLogSchema = new mongoose.Schema({
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trip",
    required: true,
  },
});

trackingLogSchema.index({ location: "2dsphere" });
trackingLogSchema.index({ trip: 1, timestamp: -1 });

export default mongoose.model("TrackingLog", trackingLogSchema);
