import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parent",
      required: true,
    },
    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Children",
        required: true,
      },
    ],
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },
    pickupPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PickupPerson",
      required: true,
    },
    trackingLogs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TrackingLog",
      },
    ],
    pickupLocation: {
      type: String,
      required: true,
    },
    dropoffLocation: {
      type: String,
      required: true,
    },
    polyline: {
      type: String,
    },
    scheduledTime: {
      type: Date,
      required: true,
    },
    startedTime: {
      type: Date,
    },
    endedTime: {
      type: Date,
    },
    distance: {
      type: Number,
    },
    estimatedTime: {
      type: Date,
    },
    price: {
      type: Number,
    },
    pickupVerificationImg: {
      type: String,
    },
    dropoffVerificationImg: {
      type: String,
    },
    secretQuestion: {
      type: String,
    },
    secretAnswer: {
      type: String,
    },
    rating: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rating",
    },
    status: {
      type: String,
      enum: ["scheduled", "in_progress", "completed", "cancelled"],
      default: "scheduled",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Trip", tripSchema);
