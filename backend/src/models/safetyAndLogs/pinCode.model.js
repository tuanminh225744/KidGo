import { Schema, model, models } from 'mongoose';

const PinCodeSchema = new Schema(
  {
    kidId:      { type: Schema.Types.ObjectId, ref: 'Kid', required: true, unique: true },
    pinHash:    { type: String, required: true }, // bcrypt hash
    lastUsedAt: { type: Date },
  },
  { timestamps: true }
);

export default models.PinCode || model('PinCode', PinCodeSchema);
