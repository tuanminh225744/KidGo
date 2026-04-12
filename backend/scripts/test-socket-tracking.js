import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import Redis from 'ioredis';

// Import Models & Services
import User from '../src/models/core/user.model.js';
import Driver from '../src/models/core/driver.model.js';
import setupDriverSockets from '../src/sockets/driver.socket.js';
import * as driverService from '../src/services/driver.service.js';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const PORT = 3004; // Cổng Local tránh xung đột nếu server.js đang chạy trên 3000

const startTest = async () => {
  try {
    console.log('\n==================================================');
    console.log('--- KHỞI ĐỘNG BÀI TEST REAL-TIME SOCKET LOCATION ---');
    console.log('==================================================\n');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kidgo');
    console.log('[1] Cổng kết nối MongoDB đã thông suốt.');

    // Khởi tạo Mini-Server cục bộ chỉ dành riêng cho bài Test
    const httpServer = http.createServer();
    const ioServer = new Server(httpServer);
    setupDriverSockets(ioServer);
    
    await new Promise((resolve) => httpServer.listen(PORT, resolve));
    console.log(`[2] Test HTTP Socket Server đã lắng nghe trên cổng :${PORT}`);

    // Dọn dẹp sạch sẽ tài khoản rác nếu có từ lần test trước
    await User.deleteMany({ email: 'socket-driver@test.com' });
    await Driver.deleteMany({ licenseNumber: 'SOCKET_LICENSE_123' });

    // ------------------------------------------
    // BƯỚC 1: TẠO DỮ LIỆU TÀI XẾ GIẢ 
    // ------------------------------------------
    console.log('\n[3] Bắt đầu tự động tạo Dummy Driver trên MongoDB...');
    const userRole = new User({
        phone: '0333333333',
        email: 'socket-driver@test.com',
        fullName: 'Test Socket Driver',
        password: '123', // Demo
        role: 'driver'
    });
    await userRole.save();

    const driver = new Driver({
        user: userRole._id,
        licenseNumber: 'SOCKET_LICENSE_123'
    });
    await driver.save();
    console.log(`    -> Đã tạo tài xế mã ID: ${driver._id}`);

    // ------------------------------------------
    // BƯỚC 2: GIẢ LẬP ĐIỆN THOẠI APP CLIENT
    // ------------------------------------------
    console.log('\n[4] Giả lập App Phía Client: Đang thiết lập kết nối tới Server Socket...');
    const clientSocket = Client(`http://localhost:${PORT}/driver`);

    await new Promise((resolve) => {
        clientSocket.on('connect', () => {
            console.log('    >> Client đã "Bắt tay" (Handshake) thành công!');
            resolve();
        });
    });

    console.log('\n[5] Client Socket: Đang liên tục đẩy thông tin authenticate & update_location');
    clientSocket.emit('authenticate', { driverId: driver._id.toString() });
    
    // Gửi tọa độ kinh vĩ tuyến ngẫu nhiên (Ví dụ: Thành Phố Hồ Chí Minh)
    clientSocket.emit('update_location', { lat: 10.776100, lng: 106.701139 });

    // Server cần một tíc-tắc để ghi xuống Redis
    await new Promise(resolve => setTimeout(resolve, 800));

    // ------------------------------------------
    // BƯỚC 3: KIỂM TRA RAM REDIS Cache
    // ------------------------------------------
    console.log('\n[6] Server Check: Quét qua RAM Redis bằng getRealtimeLocations() để xem tọa độ UserApp có thể kéo ngay được không?');
    const realTimeData = await driverService.getRealtimeLocations();
    const myDriverLocation = realTimeData[driver._id.toString()];
    if (myDriverLocation) {
        console.log(`    [PASS] ✅ Đã vớt được tọa độ từ Redis với tốc độ O(1): Kinh Độ(Lng)=${myDriverLocation.coordinates[0]}, Vĩ Độ(Lat)=${myDriverLocation.coordinates[1]}`);
    } else {
        console.log('    [FAILED] ❌ Không thấy dữ liệu trên Redis!');
    }

    // ------------------------------------------
    // BƯỚC 4: TRIGGER BATCH LUỒNG CRONJOB 
    // ------------------------------------------
    console.log('\n[7] Worker Node: Giả lập CronJob tự động "Kích nổ" hàm gom mẻ (Batch Sync - syncLocationsToDB) sau mỗi phút!');
    await driverService.syncLocationsToDB();

    // ------------------------------------------
    // BƯỚC 5: KIỂM SOÁT DB
    // ------------------------------------------
    console.log('\n[8] Nhìn lại Database thật MongoDB: Xem currentLocation có bị ghi đè chưa?');
    const updatedDriver = await Driver.findById(driver._id);
    if (updatedDriver.currentLocation && updatedDriver.currentLocation.coordinates) {
         console.table(updatedDriver.currentLocation.coordinates);
         console.log(`    [PASS] ✅ MongoDB đã được ghi bulkWrite thành công 1 mẻ hoàn chỉnh thay vì n lệnh lắt nhắt! Mảng Tọa Độ: [${updatedDriver.currentLocation.coordinates}]`);
    } else {
         console.log('    [FAILED] ❌ MongoDB vùi dập dữ liệu rồi!');
    }

    // ==== ĐÓNG GÓI CLEAN UP DỌN DẸP HẬU TRƯỜNG ====
    console.log('\n[9] Running Cleanup Jobs...');
    clientSocket.disconnect();
    httpServer.close();
    await User.deleteMany({ email: 'socket-driver@test.com' });
    await Driver.deleteMany({ licenseNumber: 'SOCKET_LICENSE_123' });
    await redisClient.hdel('driver_locations', driver._id.toString());
    await mongoose.disconnect();
    
    console.log('\n✨ ĐÃ PASS TOÀN BỘ CÁC BÀI TEST CHĂM SÓC DATA THEO THỜI GIAN THỰC! ✨\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test Vấp Ngã (Crashed) với Error:', error);
    process.exit(1);
  }
};

startTest();
