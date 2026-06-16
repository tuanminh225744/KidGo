# UserRoutes

Base path: /api/v1/users

User object fields (from `models/core/user.model.js`):

- \_id
- phone
- email
- password (never returned)
- fullName
- avatar
- role (parent|driver|admin)
- isVerified
- deviceTokens: [string]
- isActive
- driverId | null
- createdAt, updatedAt

Endpoints:

- GET /me : returns User object
- PUT /me : update fullName,email,avatar -> returns updated User
- PUT /me/device-token : body { deviceToken } -> returns null
- POST /upload-avatar : multipart file `avatar` -> returns { avatarUrl, user }
