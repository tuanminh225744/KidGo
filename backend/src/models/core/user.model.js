import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema(
  {
    phone:        { type: String, required: true, unique: true },
    email:        { type: String, index: true, sparse: true },
    fullName:     { type: String, required: true },
    avatar:       { type: String },
    role:         { type: String, enum: ['parent', 'admin'], default: 'parent' },
    isVerified:   { type: Boolean, default: false },
    deviceTokens: { type: [String], default: [] }, // FCM tokens
  },
  { timestamps: true }
);

export default models.User || model('User', UserSchema);
