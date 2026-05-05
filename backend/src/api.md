GET /api/v1/routes
Danh sách lộ trình đã lưu
parent
POST
/api/v1/routes
Tạo lộ trình mới
parent
GET
/api/v1/routes/:routeId
Chi tiết lộ trình
parent
PUT
/api/v1/routes/:routeId
Cập nhật lộ trình
parent
DELETE
/api/v1/routes/:routeId
Xóa lộ trình
parent
Preferred Drivers
4 API
GET
/api/v1/preferred-drivers
Danh sách tài xế ưu tiên
parent
POST
/api/v1/preferred-drivers
Thêm tài xế vào danh sách ưu tiên
parent
PUT
/api/v1/preferred-drivers/:driverId
Cập nhật nickname, priority
parent
DELETE
/api/v1/preferred-drivers/:driverId
Xóa khỏi danh sách ưu tiên
parent
Bookings
10 API
GET
/api/v1/bookings
Danh sách booking
parent
POST
/api/v1/bookings
Tạo booking một lần
parent
GET
/api/v1/bookings/:bookingId
Chi tiết booking
parent
DELETE
/api/v1/bookings/:bookingId
Huỷ booking
parent
GET
/api/v1/bookings/schedules
Danh sách lịch định kỳ
parent
POST
/api/v1/bookings/schedules
Tạo lịch định kỳ
parent
GET
/api/v1/bookings/schedules/:scheduleId
Chi tiết lịch định kỳ
parent
PUT
/api/v1/bookings/schedules/:scheduleId
Cập nhật lịch định kỳ
parent
PATCH
/api/v1/bookings/schedules/:scheduleId/toggle
Bật/tắt lịch định kỳ
parent
DELETE
/api/v1/bookings/schedules/:scheduleId
Xóa lịch định kỳ
parent
Subscriptions (Gói tháng)
5 API
GET
/api/v1/subscriptions/me
Gói tháng hiện tại
parent
POST
/api/v1/subscriptions
Đăng ký gói tháng
parent
PATCH
/api/v1/subscriptions/:subId/cancel
Huỷ gói tháng
parent
PATCH
/api/v1/subscriptions/:subId/auto-renew
Bật/tắt tự gia hạn
parent
GET
/api/v1/subscriptions/:subId/usage
Thống kê số chuyến đã dùng
parent
Driver — App
11 API
GET
/api/v1/drivers/me
Profile tài xế hiện tại
driver
PUT
/api/v1/drivers/me
Cập nhật thông tin cá nhân
driver
PATCH
/api/v1/drivers/me/status
Bật/tắt trạng thái sẵn sàng
driver
PUT
/api/v1/drivers/me/location
Cập nhật vị trí GPS
driver
GET
/api/v1/drivers/me/trips
Lịch sử chuyến của tài xế
driver
GET
/api/v1/drivers/me/earnings
Tổng kết thu nhập
driver
GET
/api/v1/drivers/me/reviews
Danh sách đánh giá nhận được
driver
POST
/api/v1/drivers/register
Đăng ký tài khoản tài xế mới
public
POST
/api/v1/drivers/me/vehicles
Thêm xe mới
driver
GET
/api/v1/drivers/me/vehicles
Danh sách xe của tài xế
driver
PATCH
/api/v1/drivers/me/vehicles/:vehicleId/active
Chọn xe đang dùng
driver
Booking — Driver Actions
3 API
GET
/api/v1/drivers/me/booking-requests
Danh sách booking đang mời
driver
POST
/api/v1/drivers/me/booking-requests/:bookingId/accept
Chấp nhận chuyến
driver
POST
/api/v1/drivers/me/booking-requests/:bookingId/reject
Từ chối chuyến
driver
Trips — Execution
10 API
GET
/api/v1/trips
Lịch sử chuyến (parent)
parent
GET
/api/v1/trips/active
Chuyến đang chạy của tất cả kids
parent
GET
/api/v1/trips/:tripId
Chi tiết chuyến
tất cả
GET
/api/v1/trips/:tripId/location-log
Log GPS toàn bộ chuyến
parent
POST
/api/v1/trips/:tripId/start
Tài xế bắt đầu chuyến
driver
POST
/api/v1/trips/:tripId/confirm-pickup
Xác nhận đã đón trẻ
driver
POST
/api/v1/trips/:tripId/confirm-dropoff
Xác nhận đã trả trẻ
driver
POST
/api/v1/trips/:tripId/cancel
Huỷ chuyến đang chạy
tất cả
POST
/api/v1/trips/:tripId/gps-tick
Gửi vị trí GPS realtime
driver
WS
ws://api/v1/trips/:tripId/track
WebSocket tracking realtime
parent
Alerts
5 API
GET
/api/v1/alerts
Danh sách alert của phụ huynh
parent
GET
/api/v1/alerts/:alertId
Chi tiết alert
tất cả
PATCH
/api/v1/alerts/:alertId/acknowledge
Phụ huynh xác nhận đã biết
parent
PATCH
/api/v1/alerts/:alertId/resolve
Đóng alert
tất cả
PATCH
/api/v1/alerts/:alertId/escalate
Phụ huynh yêu cầu admin hỗ trợ
parent
Confirmations
2 API
GET
/api/v1/trips/:tripId/confirmations
Ảnh xác nhận đón + trả
parent
POST
/api/v1/upload/confirmation-photo
Upload ảnh xác nhận
driver
Reviews
2 API
POST
/api/v1/reviews
Phụ huynh đánh giá sau chuyến
parent
GET
/api/v1/reviews/driver/:driverId
Xem đánh giá của một tài xế
parent
Notifications
4 API
GET
/api/v1/notifications
Lịch sử thông báo đã nhận
tất cả
PATCH
/api/v1/notifications/:notifId/read
Đánh dấu đã đọc
tất cả
PATCH
/api/v1/notifications/read-all
Đánh dấu tất cả đã đọc
tất cả
GET
/api/v1/notifications/unread-count
Số thông báo chưa đọc
tất cả
Admin — User Management
4 API
GET
/api/v1/admin/users
Danh sách phụ huynh
admin
GET
/api/v1/admin/users/:userId
Chi tiết phụ huynh
admin
PATCH
/api/v1/admin/users/:userId/suspend
Khóa tài khoản phụ huynh
admin
PATCH
/api/v1/admin/users/:userId/reactivate
Mở khóa tài khoản
admin
Admin — Driver Management
7 API
GET
/api/v1/admin/drivers
Danh sách tài xế
admin
GET
/api/v1/admin/drivers/:driverId
Chi tiết hồ sơ tài xế
admin
PATCH
/api/v1/admin/drivers/:driverId/approve
Duyệt hồ sơ tài xế
admin
PATCH
/api/v1/admin/drivers/:driverId/reject
Từ chối hồ sơ
admin
PATCH
/api/v1/admin/drivers/:driverId/suspend
Tạm khóa tài xế
admin
PATCH
/api/v1/admin/drivers/:driverId/certification
Điều chỉnh cấp chứng nhận
admin
GET
/api/v1/admin/drivers/:driverId/location
Vị trí live của tài xế
admin
Admin — Trip Monitoring
4 API
GET
/api/v1/admin/trips
Tất cả chuyến (lọc theo status)
admin
GET
/api/v1/admin/trips/live
Tất cả chuyến đang chạy
admin
GET
/api/v1/admin/trips/:tripId
Chi tiết chuyến đầy đủ
admin
WS
ws://api/v1/admin/trips/live-feed
WebSocket live feed tất cả trips
admin
Admin — Alert Management
4 API
GET
/api/v1/admin/alerts
Tất cả alert (có thể filter)
admin
GET
/api/v1/admin/alerts/open
Tất cả alert đang mở
admin
PATCH
/api/v1/admin/alerts/:alertId/resolve
Admin đóng alert
admin
PATCH
/api/v1/admin/alerts/:alertId/false-positive
Đánh dấu cảnh báo sai
admin
Admin — Reports & Stats
5 API
GET
/api/v1/admin/dashboard
Tổng quan: trips, alerts, drivers online
admin
GET
/api/v1/admin/reports/trips
Báo cáo chuyến theo khoảng thời gian
admin
GET
/api/v1/admin/reports/alerts
Báo cáo alert rate theo driver
admin
GET
/api/v1/admin/reports/drivers
Xếp hạng tài xế theo rating + trips
admin
GET
/api/v1/admin/reports/export
Export báo cáo ra CSV
admin
