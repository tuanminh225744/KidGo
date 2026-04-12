import { Schema, model, models } from 'mongoose';

// Embedded sub-schema cho plannedRoute
const PlannedRouteSchema = new Schema(
  {
    pickupAddress:     { type: String },
    pickupCoords:      { type: { type: String, default: 'Point' }, coordinates: [Number] },
    dropoffAddress:    { type: String },
    dropoffCoords:     { type: { type: String, default: 'Point' }, coordinates: [Number] },
    waypoints:         { type: Array, default: [] },
    estimatedDuration: { type: Number },
    estimatedDistance: { type: Number },
  },
  { _id: false }
);

const TripSchema = new Schema(
  {
    bookingId:            { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    driverId:             { type: Schema.Types.ObjectId, ref: 'Driver',  required: true },
    kidId:                { type: Schema.Types.ObjectId, ref: 'Kid',     required: true },
    parentId:             { type: Schema.Types.ObjectId, ref: 'User',    required: true },
    vehicleId:            { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    status:               {
      type: String,
      enum: ['scheduled', 'picking_up', 'in_progress', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    plannedRoute:         { type: PlannedRouteSchema },
    actualRoute:          { type: Array, default: [] }, // GeoJSON Point[]
    scheduledPickupTime:  { type: Date },
    actualPickupTime:     { type: Date },
    scheduledDropoffTime: { type: Date },
    actualDropoffTime:    { type: Date },
    pickupPhoto:          { type: String },
    dropoffPhoto:         { type: String },
    pinVerified:          { type: Boolean, default: false },
    distance:             { type: Number }, // km thực tế
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default models.Trip || model('Trip', TripSchema);
