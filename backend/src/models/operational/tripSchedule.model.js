import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const TripScheduleSchema = new Schema(
  {
    parentId:          { type: Schema.Types.ObjectId, ref: 'User',         required: true },
    kidId:             { type: Schema.Types.ObjectId, ref: 'Kid',          required: true },
    preferredDriverId: { type: Schema.Types.ObjectId, ref: 'Driver',       default: null },
    routeId:           { type: Schema.Types.ObjectId, ref: 'Route',        required: true },
    repeatDays:        { type: [Number], default: [] }, // [1,2,3,4,5] = T2-T6
    pickupTime:        { type: String },                // "07:30" (HH:mm)
    isActive:          { type: Boolean, default: true, index: true },
    startDate:         { type: Date },
    endDate:           { type: Date, default: null },
    subscriptionId:    { type: Schema.Types.ObjectId, ref: 'Subscription',  default: null },
  },
  { timestamps: false }
);

export default models.TripSchedule || model('TripSchedule', TripScheduleSchema);
