# TripScheduleRoutes

Base path: /api/v1/bookings/schedules

TripSchedule fields (from `models/operational/tripSchedule.model.js`):

- \_id
- parentId
- kidId
- preferredDriverId | null
- routeId
- repeatDays: [Number]
- pickupTime: string (HH:mm)
- isActive: boolean
- startDate: Date
- endDate: Date | null
- subscriptionId | null
- paymentId | null

Endpoints:

- GET / : list schedules
- POST / : create schedule -> returns TripSchedule
- GET /:scheduleId : detail
- PUT /:scheduleId : update
- PATCH /:scheduleId/toggle : toggle isActive
- DELETE /:scheduleId : delete
