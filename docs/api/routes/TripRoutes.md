# TripRoutes

Base path: /api/v1/trips

Trip object fields (from `models/operational/trip.model.js`):

- \_id
- bookingId
- driverId
- kidId
- parentId
- vehicleId
- routeId
- status: enum(scheduled,picking_up,in_progress,completed,cancelled)
- otp: { required, status, data, verifiedAt }
- pickupPhoto: { required, status, data, verifiedAt }
- dropoffPhoto: { required, status, data, verifiedAt }
- securityQuestion: { required, status, data, verifiedAt }
- paymentId | null
- createdAt

Endpoints:

- GET / : list trips (parent) (query: status,page,limit)
- GET /active : list active trips
- GET /:tripId : trip detail
- POST /:tripId/start : driver starts trip -> returns Trip
- POST /:tripId/verify-otp : body { otp } -> returns verification result (object)
- POST /:tripId/verify-pickup-photo : body { photo } -> verification result
- POST /:tripId/verify-dropoff-photo : body { photo } -> verification result
- POST /:tripId/verify-security-question : body { answer, data? } -> verification result
- POST /:tripId/confirm-pickup : returns Trip
- POST /:tripId/confirm-dropoff : returns Trip
- POST /:tripId/cancel : returns Trip
- POST /:tripId/gps-tick : body { lat, lng, speed?, heading?, accuracy? } -> returns service result (object)
