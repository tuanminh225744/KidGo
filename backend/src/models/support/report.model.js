import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const ReportSchema = new Schema(
  {
    tripId: {
      type: Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "RESOLVED"],
      default: "PENDING",
      index: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

ReportSchema.index({ tripId: 1, createdAt: -1 });

export default models.Report || model("Report", ReportSchema);
