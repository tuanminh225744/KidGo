# ReviewRoutes

Base path: /api/v1/reviews

Review object fields (from `models/support/review.model.js`):

- \_id
- tripId
- parentId
- driverId
- rating (1-5)
- comment
- tags: [string]
- createdAt

Endpoints:

- POST / : upsert review -> returns Review
- GET /driver/:driverId : list reviews (query page,limit) -> returns array of Review
