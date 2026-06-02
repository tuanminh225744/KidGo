import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const SubscriptionSchema = new Schema(
  {
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    plan: { type: String, enum: ["monthly", "yearly"], required: true },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
      index: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    usedTrips: { type: Number, default: 0 },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment", default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export default models.Subscription || model("Subscription", SubscriptionSchema);
