import { Schema, model, models } from "mongoose";
import { PointSchema } from "../geoSchemas.js";

const AlertSchema = new Schema({
  tripId: { type: Schema.Types.ObjectId, ref: "Trip", required: true },
  driverId: { type: Schema.Types.ObjectId, ref: "Driver", required: true },
  parentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: [
      "detour",         //Lệch tuyến nhẹ
      "unplanned_stop", //Dừng ngoài kế hoạch
      "speed",          //Chạy quá tốc độ
      "gps_lost",       //Mất tín hiệu gps
      "early_end",      //Kết thúc sớm bất thường
      "major_detour",   //Lệch tuyến nghiêm trọng
    ],
    index: true,
  },
  level: { type: String, enum: ["info", "warning", "critical"], index: true },
  status: {
    type: String,
    enum: ["open", "acknowledged", "resolved", "escalated"],
    default: "open",
  },
  detectedAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
  resolvedBy: { type: String, enum: ["parent", "driver", "admin", "system"] },
  location: { type: PointSchema },
  metadata: { type: Schema.Types.Mixed }, // deviation_meters, stop_duration…
  note: { type: String },
});

AlertSchema.index({ location: "2dsphere" });

export default models.Alert || model("Alert", AlertSchema);
