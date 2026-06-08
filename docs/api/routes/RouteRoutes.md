# RouteRoutes

Base path: /api/v1/routes

Route object fields (from `models/operational/route.model.js`):

- \_id
- parentId
- actualPickupAddress, actualDropoffAddress
- actualPickupCoords, actualDropoffCoords (GeoJSON Point)
- actualDistance, actualDuration
- estimatedPickupAddress, estimatedDropoffAddress
- estimatedPickupCoords, estimatedDropoffCoords (Point)
- estimatedDistance, estimatedDuration
- estimatedWaypoints: [Point]
- actualWaypoints: [Point]
- scheduledPickupTime, actualPickupTime, scheduledDropoffTime, actualDropoffTime
- createdAt, updatedAt

Endpoints:

- GET / : list routes
- POST / : create route (body validated by routeValidators)
- GET /:routeId : route detail
- PUT /:routeId : update route
- DELETE /:routeId : delete route (returns null data)
