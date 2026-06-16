# SubscriptionRoutes

Base path: /api/v1/subscriptions

Subscription object fields (from `models/operational/subscription.model.js`):

- \_id
- parentId
- plan (monthly|yearly)
- status (active|expired|cancelled)
- startDate
- endDate
- usedTrips
- paymentId
- createdAt

Endpoints:

- GET /me : returns current subscription
- POST / : create { plan, startDate?, endDate? } -> returns Subscription
- PATCH /:subId/cancel : cancel subscription -> returns Subscription
- GET /:subId/usage : returns usage stats
