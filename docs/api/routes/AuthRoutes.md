AuthRoutes
Base path: /api/v1/auth

Quy định Response chuẩn của hệ thống:
Success: { "success": true, "message": "Operation successful", "data": { ... } }

Error: { "success": false, "message": "Error message" }

Danh sách các Endpoints:

1. POST /register
   Mô tả: Đăng ký tài khoản cho User (Parent).

Request Body:

email: string (required)

password: string (required, min 6)

fullName: string (required)

phone: string (required)

role: enum("parent", "driver") (required)

Success Response (201) - data: { "user": User }

2. POST /register-driver
   Mô tả: Đăng ký tài khoản dành cho tài xế kèm thông tin hồ sơ và phương tiện.

Request Body:

email: string (required)

phone: string (required)

fullName: string (required)

password: string (required, min 6)

licenseNumber: string (required)

licenseExpiry: ISO8601 date (required)

licensePlate: string (required)

brand: string (required)

model: string (required)

color: string (required)

seatCount: integer >=1 (required)

inspectionExpiry: ISO8601 date (required)

Success Response (201) - data: { "user": { "\_id", "email", "phone", "fullName", "role" }, "driver": Driver, "vehicle": Vehicle }

3. POST /login
   Mô tả: Đăng nhập vào hệ thống.

Request Body:

email: string (required)

password: string (required)

Success Response - data: { "accessToken": "string", "refreshToken": "string", "user": { "\_id", "email", "fullName", "role" } }

4. POST /send-otp
   Mô tả: Gửi mã OTP xác thực qua email.

Request Body:

email: string (required)

Success Response - data: { "messageId": "string" } (hoặc cấu trúc do authentication.service trả về)

5. POST /verify-otp
   Mô tả: Xác thực mã OTP để đăng nhập hoặc kích hoạt.

Request Body:

email: string (required)

otp: string (required)

Success Response - data: { "accessToken": "string", "refreshToken": "string", "user": User } (nếu OTP hợp lệ)

6. POST /refresh
   Mô tả: Cấp lại Access Token mới từ Refresh Token.

Request Body:

refreshToken: string (required)

Success Response - data: { "accessToken": "string", "refreshToken": "string" }

7. POST /logout
   Mô tả: Đăng xuất khỏi hệ thống.

Yêu cầu xác thực: Bearer Token

Success Response - data: null (hoặc object tùy vào trạng thái xử lý)

Thông tin các trường dữ liệu (User object fields):
Nguồn gốc từ models/core/user.model.js:

\_id: ObjectId

phone: string

email: string

fullName: string

avatar: string (URL)

role: enum("parent", "driver", "admin")

isVerified: boolean

deviceTokens: array of string

isActive: boolean

driverId: ObjectId | null

createdAt: ISO8601 date

updatedAt: ISO8601 date
