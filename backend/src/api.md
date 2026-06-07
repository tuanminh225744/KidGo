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
NOTE
Trip response now returns populated `routeId` instead of embedded `plannedRoute`.
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
Reports
3 API
POST
/api/v1/reports
Tạo report cho chuyến đi
parent
GET
/api/v1/reports/trip/:tripId
Danh sách report theo tripId
parent, admin
DELETE
/api/v1/reports/:reportId
Xóa report theo id
parent, admin
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
3 API
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
Admin — Reports & Stats
4 API
GET
/api/v1/admin/dashboard
Tổng quan: trips, drivers online
admin
GET
/api/v1/admin/reports/trips
Báo cáo chuyến theo khoảng thời gian
admin
GET
/api/v1/admin/reports/drivers
Xếp hạng tài xế theo rating + trips
admin
GET
/api/v1/admin/reports/export
Export báo cáo ra CSV
admin
