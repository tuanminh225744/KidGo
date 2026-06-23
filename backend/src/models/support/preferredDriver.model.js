import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const PreferredDriverSchema = new Schema({
  parentId: { type: Schema.Types.ObjectId, ref: 'User',   required: true, index: true },
  driverId: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
  nickname: { type: String },
  // Độ ưu tiên từ 1 đến 5, mặc định là 1 nếu không truyền (spec: 1 = ưu tiên cao nhất)
  priority: { type: Number, min: 1, max: 5, default: 1 },
  addedAt:  { type: Date, default: Date.now },
});

// Đảm bảo mỗi cặp (phụ huynh - tài xế) chỉ xuất hiện một lần
PreferredDriverSchema.index({ parentId: 1, driverId: 1 }, { unique: true });

export default models.PreferredDriver || model('PreferredDriver', PreferredDriverSchema);
