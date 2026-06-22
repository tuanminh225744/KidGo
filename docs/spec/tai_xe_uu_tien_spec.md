# Specification: Chức năng Tài xế ưu tiên (Preferred Driver)

Chức năng "Tài xế ưu tiên" cho phép người dùng lưu lại tối đa 20 tài xế yêu thích và chỉ định trực tiếp một tài xế trong danh sách này khi đặt xe, thay vì để hệ thống tự động tìm kiếm.

## 1. Yêu cầu chức năng (Functional Requirements)

### 1.1. Màn hình Danh sách tài xế ưu tiên
- **Thêm tài xế**: 
  - Cách 1: Bấm nút "Thêm vào danh sách ưu tiên" sau khi kết thúc một chuyến xe thành công.
  - Cách 2: Nhập số điện thoại của tài xế vào ô tìm kiếm ở trang danh sách tài xế ưu tiên để thêm.
  - *Lưu ý*: Tài xế không cần xác nhận (tự động được thêm).
- **Hiển thị danh sách**: Người dùng có thể xem danh sách các tài xế đã được thêm.
- **Giới hạn số lượng**: Một người dùng chỉ có thể lưu tối đa **20 tài xế**.
- **Thông tin tài xế**: Hiển thị avatar, tên, số điện thoại, loại xe, biển số xe, và đánh giá (rating).
- **Thao tác**: Người dùng có thể xóa tài xế khỏi danh sách.

### 1.2. Màn hình Đặt xe (Chọn tài xế ưu tiên)
- **Lựa chọn tài xế**: Cung cấp tùy chọn "Chọn tài xế ưu tiên" trong quá trình đặt xe.
- **Kiểm tra trạng thái realtime**: 
  - Chỉ cho phép chọn các tài xế đang ở trạng thái **Online** và **Free** (không có chuyến).
  - Tự động làm mờ (disable) các tài xế đang Offline hoặc Đang bận.
- **Chi phí**: Thu thêm **phụ phí khoảng 10.000 VNĐ** cho chuyến đi khi chọn dịch vụ Tài xế ưu tiên.

### 1.3. Luồng Gửi Cuốc Xe & Timeout
- **Gửi cuốc xe**: Cuốc xe sẽ được gửi **trực tiếp** đến tài xế được chọn.
- **Thời gian chờ (Timeout)**: Tài xế có **1 phút** để xác nhận yêu cầu.
- **Dự phòng (Fallback)**: Nếu hết 1 phút mà tài xế ưu tiên không nhận cuốc (hoặc từ chối), hệ thống **không** tự động tìm tài xế khác xung quanh, mà sẽ **hủy chuyến** và gửi thông báo trực tiếp đến người dùng ("Tài xế ưu tiên không nhận cuốc. Hệ thống đã hủy chuyến xe, vui lòng đặt lại.").

## 2. Thiết kế Cơ sở Dữ liệu (Database Design) 
- Thêm collection `preferredDriver` (bao gồm các trường `userId`, `driverId`, `priority` - độ ưu tiên (từ 1 đến 5, mặc định 1 nếu không truyền)).

## 3. Các API Cần Thiết
1. `GET /api/v1/users/preferred-drivers`: Lấy danh sách tài xế ưu tiên kèm trạng thái Online/Free realtime.
2. `POST /api/v1/users/preferred-drivers`: Thêm tài xế (qua ID chuyến đi cũ hoặc Số điện thoại).
3. `DELETE /api/v1/users/preferred-drivers/:driverId`: Xóa tài xế.
4. `POST /api/v1/payments/preview`: Cập nhật logic tính thêm phụ phí 10.000 VNĐ nếu có truyền `preferredDriverId`.
5. `POST /api/v1/bookings`: Xử lý gửi thẳng cuốc xe (không tìm xung quanh) và set timeout 1 phút.
