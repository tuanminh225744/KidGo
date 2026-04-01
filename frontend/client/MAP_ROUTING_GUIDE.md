# Hướng dẫn sử dụng tính năng Lên kế hoạch tuyến đường

## Tính năng

- 🗺️ Hiển thị bản đồ tương tác bằng Leaflet
- 📍 Chọn 2 điểm trên bản đồ (điểm xuất phát và điểm đến)
- 🛣️ Tính toán tuyến đường tối ưu bằng OpenRouteService
- 📊 Hiển thị khoảng cách (km) và thời gian di chuyển dự kiến
- 🎨 Giao diện thân thiện, dễ sử dụng

## Cài đặt

### 1. Cài đặt các package phụ thuộc

Các package đã được cài đặt:

```bash
npm install leaflet react-leaflet openrouteservice-js axios
```

### 2. Lấy API Key từ OpenRouteService

1. Truy cập [OpenRouteService](https://openrouteservice.org/)
2. Đăng ký tài khoản miễn phí (hoặc đăng nhập nếu đã có)
3. Đi đến [Dashboard API](https://openrouteservice.org/dev/#/api-docs/services/matrix)
4. Tạo một API key **mới** (hoặc xóa cái cũ nếu không dùng)
5. Copy API key (dạng token dài)

**Lưu ý:** API key có thể hết hạn hoặc giới hạn request. Nếu thấy NaN:

- Kiểm tra xem API key còn hoạt động không
- Tạo API key mới nếu cần

### 3. Cấu hình API Key

Mở file `frontend/client/src/components/MapRouting.jsx` và tìm dòng:

```javascript
const apiKey = "ADD_YOUR_OPENROUTESERVICE_API_KEY_HERE";
```

Thay thế bằng API key của bạn:

```javascript
const apiKey = "YOUR_API_KEY_HERE";
```

### 4. (Tùy chọn) Sử dụng biến môi trường

Để bảo mật hơn, hãy tạo file `.env` trong thư mục `frontend/client`:

```
VITE_OPENROUTESERVICE_API_KEY=YOUR_API_KEY_HERE
```

Sau đó, cập nhật file `MapRouting.jsx`:

```javascript
const apiKey = import.meta.env.VITE_OPENROUTESERVICE_API_KEY;
```

## Cách sử dụng

1. Chạy ứng dụng:

```bash
npm run dev
```

2. Nhấp vào menu "Lên kế hoạch tuyến đường" hoặc nhấp nút trên trang chủ

3. Trên bản đồ:
   - **Nhấp lần thứ nhất**: Chọn điểm xuất phát (được đánh dấu bằng marker xanh)
   - **Nhấp lần thứ hai**: Chọn điểm đến (được đánh dấu bằng marker đỏ)

4. Kết quả:
   - Tuyến đường được vẽ trên bản đồ (đường xanh dương)
   - Khoảng cách (km) được hiển thị
   - Thời gian dự kiến di chuyển được hiển thị
   - Tọa độ của các điểm được liệt kê ở bên trái

5. Chọn lại tuyến đường:
   - Nhấp nút "Chọn lại tuyến đường" để bắt đầu lại

## Các thành phần chính

### MapRouting.jsx

- Component chính cho tính năng
- Xử lý click trên bản đồ
- Gọi API OpenRouteService
- Render bản đồ với Leaflet

### MapRouting.css

- Styling cho layout bản đồ
- Styling cho panel điều khiển bên trái
- Styling cho thông tin tuyến đường
- Responsive design cho mobile

## Tùy chỉnh

### Thay đổi vị trí mặc định

Mở `MapRouting.jsx` và thay đổi:

```javascript
<MapContainer
  center={[10.7769, 106.7009]} // Đây là tọa độ mặc định (TP.HCM)
  zoom={12}
  ...
>
```

Các tọa độ phổ biến:

- **Hà Nội**: [21.0285, 105.8542]
- **TP.HCM**: [10.7769, 106.7009]
- **Đà Nẵng**: [16.0735, 108.2025]

### Thay đổi loại bản đồ

Hiện tại sử dụng OpenStreetMap. Bạn có thể thay đổi URL TileLayer:

```javascript
<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
```

## Xử lí lỗi thường gặp

### Hiện NaN cho khoảng cách và thời gian

**Nguyên nhân:**

- API key không hợp lệ hoặc hết hạn
- OpenRouteService API trả về lỗi
- Hai điểm được chọn không hợp lệ

**Cách khắc phục:**

1. Mở **DevTools** (F12) → tab **Console**
2. Chọn 2 điểm trên bản đồ
3. Xem log console:
   - Nếu thấy `❌ API Response` → **API key không hợp lệ**
   - Nếu thấy `❌ Lỗi tính toán tuyến đường` → Vui lòng tạo API key mới
4. **Giải pháp:**
   - Truy cập https://openrouteservice.org/ và tạo API key mới
   - Cập nhật file `.env` và restart ứng dụng
   - Nếu lỗi vẫn tiếp tục, thử chọn 2 điểm khác trên bản đồ

### "Lỗi tính toán tuyến đường"

- **Nguyên nhân**: API key không hợp lệ hoặc ít nhất một điểm nằm ngoài phạm vi hỗ trợ
- **Giải pháp**: Kiểm tra lại API key và chọn các điểm hợp lệ trên đất liền

### Bản đồ không hiển thị

- **Nguyên nhân**: CSS của Leaflet chưa được load
- **Giải pháp**: Đảm bảo import `'leaflet/dist/leaflet.css'` in MapRouting.jsx

### Marker không hiển thị

- **Nguyên nhân**: Icon từ CDN không thể tải
- **Giải pháp**: Kiểm tra kết nối internet hoặc sử dụng URL thay thế

## Công nghệ sử dụng

- **React**: UI framework
- **React-Leaflet**: React wrapper cho Leaflet
- **Leaflet**: Thư viện bản đồ
- **OpenRouteService**: API cho tính toán tuyến đường
- **Axios**: HTTP client
- **Tailwind CSS / CSS**: Styling

## Giới hạn của OpenRouteService API miễn phí

- 40 request per minute
- Tuy nhiên, không có giới hạn số lượng request hàng ngày

## Hỗ trợ thêm

- [Leaflet Documentation](https://leafletjs.com/)
- [OpenRouteService Documentation](https://openrouteservice.org/dev/#/api-docs)
- [React-Leaflet Documentation](https://react-leaflet.js.org/)
