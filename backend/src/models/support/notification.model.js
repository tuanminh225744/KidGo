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
    type: { type: String }, // 'trip_start' | 'alert' | 'booking_confirm'…
    title: { type: String },
    body: { type: String },
    channel: { type: String, enum: ["push", "sms", "call"] },
    status: {
      type: String,
      enum: ["sent", "delivered", "failed"],
      default: "sent",
    },
    refId: { type: Schema.Types.ObjectId }, // ID của Trip / Alert liên quan
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

NotificationSchema.index({ createdAt: -1 });

export default models.Notification || model("Notification", NotificationSchema);
