import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const UserSchema = new Schema(
  {
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, index: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    avatar: { type: String },
    role: { type: String, enum: ['parent', 'driver', 'admin'], default: 'parent' },
    isVerified: { type: Boolean, default: false },
    deviceTokens: { type: [String], default: [] }, // FCM tokens
    isActive: { type: Boolean, default: true },
    driverId: { type: Schema.Types.ObjectId, ref: "Driver", unique: true, sparse: true },
  },
  { timestamps: true }
);

export default models.User || model('User', UserSchema);
