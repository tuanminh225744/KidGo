import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const PreferredDriverSchema = new Schema({
  parentId: { type: Schema.Types.ObjectId, ref: 'User',   required: true, index: true },
  driverId: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
  nickname: { type: String },
  priority: { type: Number, default: 1 }, // 1 = ưu tiên cao nhất
  addedAt:  { type: Date, default: Date.now },
});

export default models.PreferredDriver || model('PreferredDriver', PreferredDriverSchema);
