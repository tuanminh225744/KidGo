# PreferredDriverRoutes

Base path: /api/v1/preferred-drivers

PreferredDriver object fields (from `models/support/preferredDriver.model.js`):

- \_id
- parentId
- driverId
- nickname
- priority
- addedAt

Endpoints (parent):

- GET / : list PreferredDriver
- POST / : add { driverId, nickname, priority } -> returns PreferredDriver
- PUT /:driverId : update { nickname?, priority? } -> returns PreferredDriver
- DELETE /:driverId : remove -> returns null or removed record
