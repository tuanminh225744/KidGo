import mongoose from 'mongoose';
const { Schema } = mongoose;

// GeoJSON Point sub-schema (dùng chung cho tất cả model cần GeoJSON Point)
export const PointSchema = new Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },
  { _id: false },
);
