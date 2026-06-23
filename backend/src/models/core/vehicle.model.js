import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const VehicleSchema = new Schema({
  licensePlate:     { type: String, required: true, unique: true },
  brand:            { type: String },
  model:            { type: String },
  color:            { type: String },
  seatCount:        { type: Number },
  inspectionExpiry: { type: Date },
  photo:            { type: String },
  isActive:         { type: Boolean, default: false },
});

export default models.Vehicle || model('Vehicle', VehicleSchema);
