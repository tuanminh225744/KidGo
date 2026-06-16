# NotificationRoutes

Base path: /api/v1/notifications

Notification object fields (from `models/support/notification.model.js`):

- \_id
- recipientId
- recipientType (parent|driver|admin)
- type
- title
- body
- tripId | null
- isRead (boolean)
- readAt | null
- createdAt

Endpoints:

- POST / : admin creates notification -> returns Notification
- GET /unread-count : returns number
- PATCH /read-all : returns null
- GET / : returns array of Notification
- PATCH /:notifId/read : returns updated Notification
