import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import { io as Client } from 'socket.io-client';
import Redis from 'ioredis';

import User from '../src/models/core/user.model.js';
import Driver from '../src/models/core/driver.model.js';
import Route from '../src/models/operational/route.model.js';
import Booking from '../src/models/operational/booking.model.js';

import { initSocketConfig } from '../src/sockets/socketManager.js';
import * as bookingService from '../src/services/booking.service.js';
import * as driverService from '../src/services/driver.service.js';

dotenv.config({ path: path.join(process.cwd(), '.env') });
const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const PORT = 3005; 

// Helper function để chờ 
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const startTest = async () => {
    try {
        console.log('\n==================================================');
        console.log('--- BÀI TEST REAL-TIME BOOKING & RIPPLE MATCHING ---');
        console.log('==================================================\n');

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kidgo');
        
        // Dọn dẹp rác
        await User.deleteMany({ email: { $in: ['test-parent@book.com', 'test-driver@book.com'] } });
        await Driver.deleteMany({ licenseNumber: 'BOOK_DRIVER_123' });
        await Route.deleteMany({ name: 'Test Route Booking' });
        await Booking.deleteMany({ status: { $exists: true } }); 
        
        // Khởi tạo Server riêng
        const httpServer = http.createServer();
        initSocketConfig(httpServer);
        await new Promise((resolve) => httpServer.listen(PORT, resolve));
        console.log(`[1] Đứng Server Socket thành công trên cổng ${PORT}\n`);

        // ================= TẠO DATA GIẢ =================
        const parentUser = new User({
            phone: '0999999999', email: 'test-parent@book.com', fullName: 'Mẹ Bỉm Sữa', password: '123', role: 'parent'
        });
        await parentUser.save();

        const driverUser = new User({
            phone: '0888888888', email: 'test-driver@book.com', fullName: 'Bác Tài Xế', password: '123', role: 'driver'
        });
        await driverUser.save();

        const driver = new Driver({
            user: driverUser._id, licenseNumber: 'BOOK_DRIVER_123', isOnline: true, rideStatus: 'free'
        });
        await driver.save();

        const testRoute = new Route({
            parentId: parentUser._id,
            name: 'Test Route Booking',
            pickupCoords: { type: 'Point', coordinates: [106.7, 10.8] } 
        });
        await testRoute.save();
        console.log(`[2] Đã tạo Parent, Driver, Route giả.\n`);

        // Đổ tọa độ giả của Driver vào Redis GEO, vị trí hoàn toàn TRÙNG KHỚP với người gọi xe (cách < 1km)
        await driverService.updateLocationInRedis(driver._id, 10.8, 106.7);
        console.log(`[3] Đã cài định vị của tài xế vào tâm ngắm (để radar 2km bắt được).\n`);

        // ================= KẾT NỐI SOCKET =================
        console.log('[4] Tiến hành kết nối 2 điện thoại Điện Thoại Phụ Huynh & Điện Thoại Tài Xế...');
        const parentSocket = Client(`http://localhost:${PORT}/parent`);
        const driverSocket = Client(`http://localhost:${PORT}/driver`);

        await Promise.all([
            new Promise(r => parentSocket.on('connect', r)),
            new Promise(r => driverSocket.on('connect', r))
        ]);

        parentSocket.emit('authenticate', { parentId: parentUser._id });
        driverSocket.emit('authenticate', { driverId: driver._id });
        await sleep(500); 

        // ================= LẮNG NGHE SỰ KIỆN =================
        let parentEvents = [];
        let driverEvents = [];

        parentSocket.onAny((event, ...args) => parentEvents.push({ event, args }));
        driverSocket.onAny((event, ...args) => driverEvents.push({ event, args }));

        // ================= TEST CASE 1: ĐẶT XE XUYÊN SÀN (GENERIC) =================
        console.log('\n--- TEST CASE 1: TICK XANH - ĐẶT SÀN, XẾ NHẬN, RỒI KHÁCH HỦY ---');
        console.log('    >> Phụ huynh gọi hàm createBooking...');
        
        let genericBooking = await bookingService.createBooking({
            parentId: parentUser._id,
            kidId: new mongoose.Types.ObjectId(), // Dùng ID fake vì ko query bên trong
            routeId: testRoute._id,
            scheduledTime: new Date()
        });

        // Chờ 1s để sóng 2km Rada chạy nổ Notification
        await sleep(1000);
        console.log('    >> Sóng Ping tới máy tài xế:', driverEvents.map(e => e.event));
        
        console.log('    >> Máy tài xế bấm driverAcceptBooking...');
        await bookingService.driverAcceptBooking(genericBooking._id, driver._id);
        
        await sleep(500);
        console.log('    >> Máy phụ huynh nảy Push:', parentEvents.map(e => e.event));

        console.log('    >> Phụ huynh bận, bấm parentCancelBooking...');
        parentEvents = []; driverEvents = []; // clear logs
        await bookingService.parentCancelBooking(genericBooking._id, parentUser._id);
        
        await sleep(500);
        console.log('    >> Máy tài xế nhận Push báo phụ huynh hủy:', driverEvents.map(e => e.event));


        // ================= TEST CASE 2: TÀI XẾ HỦY KÈO =================
        console.log('\n--- TEST CASE 2: TICK XANH - KHÁCH GỌI ĐÍCH DANH XẾ, NHƯNG XẾ HỦY KÈO ---');
        parentEvents = []; driverEvents = [];
        
        let preferredBooking = await bookingService.createBooking({
            parentId: parentUser._id,
            kidId: new mongoose.Types.ObjectId(),
            routeId: testRoute._id,
            preferredDriverId: driver._id,
            scheduledTime: new Date()
        });

        await sleep(500);
        console.log('    >> Push gọi đích danh nảy bên máy Tài xế:', driverEvents.map(e => e.event));

        console.log('    >> Tài xế bận, bấm driverCancelBooking...');
        await bookingService.driverCancelBooking(preferredBooking._id, driver._id);

        await sleep(500);
        console.log('    >> Máy Phụ huynh bị báo hủy kèo:', parentEvents.map(e => e.event));

        // ================= DỌN DẸP =================
        console.log('\n[5] Tắt toàn bộ dọn dẹp...');
        parentSocket.disconnect();
        driverSocket.disconnect();
        httpServer.close();
        await mongoose.disconnect();
        process.exit(0);
        
    } catch (e) {
        console.error('TEST FAILED:', e);
        process.exit(1);
    }
}
startTest();
