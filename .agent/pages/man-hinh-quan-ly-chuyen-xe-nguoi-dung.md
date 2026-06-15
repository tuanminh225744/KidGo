# Tài liệu đặc tả màn hình

## 1. Thông tin chung

### Tên màn hình

Màn hình quản lý chuyến xe người dùng

### Route

```text
frontend\client\src\pages\client\Current-trip
```

### Mục đích

Mục đích giúp người dùng xem được tài xế đang đi đến đâu

---

## 2. Yêu cầu nghiệp vụ

### User Story

**Với vai trò là:** client

**Tôi muốn:** xem được tài xế đang đi đến đâu

**Để:** xem tài xế ở đâu (khi đón bé hoặc khi đưa bé đến nơi)

### Tiêu chí hoàn thành (Acceptance Criteria)

- [ ] Hiển thị bản đồ
- [ ] Hiển thị hình nhỏ hiển thị tài xế
- [ ] Hiển thị hình nhỏ biểu thị đích đến của tài xế
- [ ] Hiển thị đường từ vị trí tài xế hiện tại đến nơi đón
- [ ] Hiển thị đường từ vị trí tài xế hiện tại đến nơi đích
- [ ] Hiển thị thời gian ước tính từ vị trí tài xế đến nơi đón/đích
- [ ] Có nút quay trở lại trang home phía trên bên trái hình <
- [ ] Hiển thị thông tin tài xế (avatar, tên, số điện thoại, hình xe, hãng xe và nút gọi cho tài xế (bấm gọi được dùng thẻ a))

---

## 3. Thiết kế giao diện

### Bố cục tổng thể

```text
------------------------------------------------
| (<)                  thời gian ước tính:hh:mm |
------------------------------------------------
| Bản đồ hiển thị                              |
|                                              |
|                                              |
|                                              |
|                                              |
------------------------------------------------
| (avatar tài xế) tên            icon gọi điện |
------------------------------------------------
| (avatar xe) hãng xe, màu                     |
------------------------------------------------
```

#### Mobile

Chỉ cần hiển thị trên mobile với yêu cầu trên.

---

## 5. API

### API lấy vị trí hiện tại của tài xế

#### Endpoint

\backend\src\services\driver.service.js
trong file này có logic lưu địa chỉ hiện tại của tài xế vào redis, hãy viết api lấy địa chỉ được lưu trong redis này và hiển thị cho người dùng (chỉ được gọi api này ở thư mục service)

- thông tin avatar, tên, driverId hãy gọi prop từ màn hình home
- thông tin xe hãy lấy bằng api /drivers/me/vehicles trong frontend\client\src\services\driver.service.js

## 6. Tái sử dụng từ hệ thống hiện tại

### Màn hình tham khảo

- frontend\client\src\components\DriverLiveMap.jsx

---
