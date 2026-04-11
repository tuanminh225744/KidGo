import { Schema, model, models } from 'mongoose';

const ReviewSchema = new Schema(
  {
    tripId:   { type: Schema.Types.ObjectId, ref: 'Trip',   required: true, unique: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'User',   required: true },
    driverId: { type: Schema.Types.ObjectId, ref: 'Driver', required: true, index: true },
    rating:   { type: Number, min: 1, max: 5, required: true },
    comment:  { type: String },
    tags:     { type: [String], default: [] }, // 'safe_driving' | 'punctual' | 'friendly'…
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default models.Review || model('Review', ReviewSchema);
