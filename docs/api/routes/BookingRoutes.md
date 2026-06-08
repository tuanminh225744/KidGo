BookingRoutes
Base path: /api/v1/bookings

Quy định Response chuẩn của hệ thống:
Success: { "success": true, "message": "Operation successful", "data": { ... } }

Error: { "success": false, "message": "Error message" }

Danh sách các Endpoints:

1. GET /
   Mô tả: Lấy danh sách các chuyến đặt xe của phụ huynh.

Yêu cầu xác thực: Bearer Token (Phụ huynh)

Query Params: Quá trình phân trang (pagination) được xử lý nội bộ hoặc không truyền.

Success Response - data: Mảng các đối tượng Đặt chuyến (array of Booking objects).

2. POST /
   Mô tả: Tạo mới một yêu cầu đặt xe đưa đón trẻ.

Yêu cầu xác thực: Bearer Token (Phụ huynh)

Request Body:

kidId: ObjectId (required)

routeId: ObjectId (required)

scheduledTime: ISO8601 datetime (required)

paymentId: ObjectId (required)

scheduleId: ObjectId (optional)

preferredDriverId: ObjectId (optional)

Success Response (201) - data: Đối tượng Booking object vừa tạo.

3. GET /:bookingId
   Mô tả: Lấy thông tin chi tiết một lượt đặt xe.

Yêu cầu xác thực: Bearer Token (Phụ huynh)

Path Params: bookingId (ObjectId, required)

Success Response - data: Đối tượng chi tiết của chuyến đặt (Booking detail).

4. DELETE /:bookingId
   Mô tả: Hủy chuyến xe đã đặt.

Yêu cầu xác thực: Bearer Token (Phụ huynh)

Path Params: bookingId (ObjectId, required)

Success Response - data: Đối tượng Booking object trạng thái đã hủy chuyến.

Trip Schedules (Tuyến lịch trình lặp lại)
Các endpoint quản lý lịch trình nằm dưới đường dẫn phụ /api/v1/bookings/schedules

5. GET /schedules
   Mô tả: Lấy danh sách các lịch trình chuyến đi cố định của phụ huynh.

Yêu cầu xác thực: Bearer Token (Phụ huynh)

Success Response - data: Mảng các lịch trình chuyến đi (array of trip schedules).

6. POST /schedules
   Mô tả: Tạo mới một lịch trình chuyến đi định kỳ.

Yêu cầu xác thực: Bearer Token (Phụ huynh)

Request Body: Schema chi tiết cấu trúc xem tại file tripScheduleValidators.js.

Success Response - data: Đối tượng lịch trình vừa tạo (created schedule object).

7. Các endpoint lịch trình khác:
   GET /api/v1/bookings/schedules/:scheduleId - Lấy chi tiết lịch trình

PUT /api/v1/bookings/schedules/:scheduleId - Cập nhật toàn bộ lịch trình

PATCH /api/v1/bookings/schedules/:scheduleId - Chỉnh sửa một phần lịch trình

DELETE /api/v1/bookings/schedules/:scheduleId - Xóa bỏ lịch trình

Thông tin các trường dữ liệu (Booking object fields):
Nguồn gốc từ models/operational/booking.model.js:

\_id: ObjectId

parentId: ObjectId

kidId: ObjectId

routeId: ObjectId

scheduleId: ObjectId | null

preferredDriverId: ObjectId | null

assignedDriverId: ObjectId | null

status: enum("pending", "matched", "confirmed", "cancelled")

scheduledTime: ISO8601 datetime

type: enum("one_time", "recurring")

paymentId: ObjectId | null

createdAt: ISO8601 date
