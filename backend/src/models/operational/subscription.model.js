import { Schema, model, models } from 'mongoose';

const SubscriptionSchema = new Schema(
  {
    parentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    plan: { type: String, enum: ['monthly', 'quarterly', 'yearly'], required: true },
    status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active', index: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    tripsPerMonth: { type: Number, required: true },
    usedTrips: { type: Number, default: 0 },
    price: { type: Number, required: true }, // VND
    autoRenew: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default models.Subscription || model('Subscription', SubscriptionSchema);
