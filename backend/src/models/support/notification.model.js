import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const NotificationSchema = new Schema(
  {
    recipientId: { type: Schema.Types.ObjectId, required: true },
    recipientType: {
      type: String,
      enum: ["parent", "driver", "admin"],
      required: true,
    },
    type: { type: String },
    title: { type: String },
    body: { type: String },
    tripId: { type: Schema.Types.ObjectId, ref: "Trip" },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

NotificationSchema.index({ createdAt: -1 });

export default models.Notification || model("Notification", NotificationSchema);
