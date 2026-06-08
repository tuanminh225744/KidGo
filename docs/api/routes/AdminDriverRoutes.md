# AdminDriverRoutes

Base path: /api/v1/admin/drivers

Driver object fields: see `Driver` model (core/driver.model.js)

Endpoints (admin only):

- GET / : query listDrivers -> returns array of Driver
- GET /:driverId : returns Driver detail
- PATCH /:driverId/approve : returns Driver
- PATCH /:driverId/reject : returns Driver
- PATCH /:driverId/suspend : returns Driver
- PATCH /:driverId/certification : body { certificationLevel } -> returns Driver
- GET /:driverId/location : returns { lat, lng, updatedAt } or Driver.currentLocation
