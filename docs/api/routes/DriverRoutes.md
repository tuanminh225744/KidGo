DriverRoutes
Base path: /api/v1/drivers

Quy định Response chuẩn của hệ thống:
Success: { "success": true, "message": "Operation successful", "data": { ... } }

Error: { "success": false, "message": "Error message" }

Danh sách các Endpoints (Dành riêng cho Tài xế tự quản lý):

1. GET /me
   Mô tả: Lấy thông tin hồ sơ tài xế hiện tại.

Yêu cầu xác thực: Bearer Token (Tài xế)

Success Response - data: Đối tượng Driver object.

2. PUT /me
   Mô tả: Cập nhật thông tin hồ sơ cá nhân của tài xế.

Yêu cầu xác thực: Bearer Token (Tài xế)

Request Body (Optional):

licenseNumber: string

licenseExpiry: ISO8601 date

certificationLevel: integer (0-5)

Success Response - data: Đối tượng Driver object sau cập nhật.

3. PATCH /me/status
   Mô tả: Bật/Tắt trạng thái hoạt động trực tuyến của tài xế.

Yêu cầu xác thực: Bearer Token (Tài xế)

Request Body:

isOnline: boolean (required)

Success Response - data: Đối tượng Driver object đã đổi trạng thái.

4. PUT /me/location
   Mô tả: Cập nhật tọa độ vị trí hiện tại của tài xế lên hệ thống.

Yêu cầu xác thực: Bearer Token (Tài xế)

Request Body:

latitude: float (required)

longitude: float (required)

Success Response - data: Đối tượng Driver object chứa vị trí mới.

5. GET /me/trips
   Mô tả: Lấy danh sách các chuyến đi tài xế thực hiện.

Yêu cầu xác thực: Bearer Token (Tài xế)

Success Response - data: Mảng các đối tượng Chuyến đi (array of Trip).

6. GET /me/earnings
   Mô tả: Xem tổng quan thống kê doanh thu thu nhập của tài xế.

Yêu cầu xác thực: Bearer Token (Tài xế)

Success Response - data: Đối tượng tóm tắt thu nhập (earnings summary object).

7. GET /me/reviews
   Mô tả: Xem danh sách các đánh giá phản hồi từ phụ huynh.

Yêu cầu xác thực: Bearer Token (Tài xế)

Success Response - data: Mảng các đối tượng Đánh giá (array of Review).

8. GET /me/booking-requests
   Mô tả: Lấy danh sách các yêu cầu đặt xe đang chờ tài xế xác nhận nhận lịch.

Yêu cầu xác thực: Bearer Token (Tài xế)

Success Response - data: Mảng danh sách yêu cầu (array).

9. POST /me/booking-requests/:bookingId/accept
   Mô tả: Chấp nhận một yêu cầu đặt xe.

Yêu cầu xác thực: Bearer Token (Tài xế)

Path Params: bookingId (ObjectId)

10. POST /me/booking-requests/:bookingId/reject
    Mô tả: Từ chối một yêu cầu đặt xe.

Yêu cầu xác thực: Bearer Token (Tài xế)

Path Params: bookingId (ObjectId)

Phương tiện (Vehicles) 11. POST /me/vehicles
Mô tả: Thêm phương tiện di chuyển mới cho tài xế.

Yêu cầu xác thực: Bearer Token (Tài xế)

Request Body: Các trường thông tin xe được quy định chi tiết trong driverValidators.js.

Success Response - data: Đối tượng xe vừa tạo (Vehicle object).

12. GET /me/vehicles
    Mô tả: Lấy danh sách các xe đăng ký dưới tên tài xế.

Yêu cầu xác thực: Bearer Token (Tài xế)

Success Response - data: Danh sách các xe (list Vehicle).

13. PATCH /me/vehicles/:vehicleId/active
    Mô tả: Đặt xe được chọn làm phương tiện di chuyển hoạt động chính.

Yêu cầu xác thực: Bearer Token (Tài xế)

Path Params: vehicleId (ObjectId)

Success Response - data: Đối tượng xe được kích hoạt (Vehicle object).

Thông tin các trường dữ liệu (Driver object fields):
Nguồn gốc từ models/core/driver.model.js:

\_id: ObjectId

user: ObjectId (liên kết với bảng User)

licenseNumber: string

licenseExpiry: ISO8601 date

status: enum("pending", "active", "suspended", "rejected")

isOnline: boolean

rideStatus: enum("free", "driving_to_pickup", "waiting_for_kid", "in_trip")

currentLocation: { type: "Point", coordinates: [lng, lat] }

certificationLevel: integer (0-5)

totalTrips: integer

rating: float

isActive: boolean

totalEarnings: float

cashReceived: float

createdAt: ISO8601 date
