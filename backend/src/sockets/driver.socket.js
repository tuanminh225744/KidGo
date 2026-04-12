import { updateLocationInRedis } from '../services/driver.service.js';

export default function setupDriverSockets(io) {
  // Tạo namespace chuyên biệt cho nhóm Driver
  const driverNamespace = io.of('/driver');

  driverNamespace.on('connection', (socket) => {
    console.log(`[Socket] Driver connected: ${socket.id}`);

    let currentDriverId = null;

    // Giả định: Tài xế gửi event "authenticate" ngay khi kết nối kèm theo token/driverId
    socket.on('authenticate', (data) => {
      if (data && data.driverId) {
        currentDriverId = data.driverId;
        console.log(`[Socket] Authenticated driver: ${currentDriverId}`);
        // Cấp room riêng biệt cho tài xế này (để server dễ gửi msg đích danh sau này)
        socket.join(currentDriverId.toString());
      }
    });

    // Event bắn lên từ App Tài Xế (ví dụ: cứ mỗi 10 giây/lần)
    // Cấu trúc Data: { driverId: "...", lat: 10.123, lng: 106.123 }
    socket.on('update_location', async (data) => {
      // Fallback lấy theo payload do client push lên nếu chưa gọi authenticate
      if (!currentDriverId && data.driverId) {
        currentDriverId = data.driverId;
      }

      if (!currentDriverId) {
        return socket.emit('error', { message: 'Yêu cầu xác thực (authenticate) trước.' });
      }

      const { lat, lng } = data;
      if (lat && lng) {
        // Bơm thẳng dữ liệu vào Redis O(1)
        await updateLocationInRedis(currentDriverId, lat, lng);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Driver disconnected: ${socket.id}`);
      // Tips: Trong tương lai có thể bổ sung update isOnline = false tại đây.
    });
  });
}
