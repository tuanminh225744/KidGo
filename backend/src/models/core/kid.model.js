import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const KidSchema = new Schema(
  {
    parentId:    { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fullName:    { type: String, required: true },
    dateOfBirth: { type: Date },
    avatar:      { type: String },
    phone:       { type: String },
    school:      { type: String },
    notes:       { type: String },
    isActive:    { type: Boolean, default: true },
    securityQuestion: { type: String },
    securityAnswer:   { type: String }, // Store hashed answer
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default models.Kid || model('Kid', KidSchema);
