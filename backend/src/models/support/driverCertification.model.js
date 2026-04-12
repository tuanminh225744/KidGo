import { Schema, model, models } from 'mongoose';

const DriverCertificationSchema = new Schema({
  driverId:      { type: Schema.Types.ObjectId, ref: 'Driver', required: true, index: true },
  previousLevel: { type: Number },
  newLevel:      { type: Number },
  reason:        { type: String },
  changedAt:     { type: Date, default: Date.now },
  changedBy:     { type: String, enum: ['system', 'admin'] },
});

export default models.DriverCertification || model('DriverCertification', DriverCertificationSchema);
