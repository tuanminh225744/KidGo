import { Schema, model, models } from 'mongoose';

const BookingSchema = new Schema(
  {
    parentId:          { type: Schema.Types.ObjectId, ref: 'User',         required: true },
    kidId:             { type: Schema.Types.ObjectId, ref: 'Kid',          required: true },
    routeId:           { type: Schema.Types.ObjectId, ref: 'Route',        required: true },
    scheduleId:        { type: Schema.Types.ObjectId, ref: 'TripSchedule', default: null }, // null = đặt thủ công
    preferredDriverId: { type: Schema.Types.ObjectId, ref: 'Driver',       default: null },
    assignedDriverId:  { type: Schema.Types.ObjectId, ref: 'Driver',       default: null },
    status:            { type: String, enum: ['pending', 'matched', 'confirmed', 'cancelled'], default: 'pending', index: true },
    scheduledTime:     { type: Date, required: true, index: true },
    type:              { type: String, enum: ['one_time', 'recurring'], default: 'one_time' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default models.Booking || model('Booking', BookingSchema);
