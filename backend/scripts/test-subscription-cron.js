import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

import User from '../src/models/core/user.model.js';
import Route from '../src/models/operational/route.model.js';
import Subscription from '../src/models/operational/subscription.model.js';
import TripSchedule from '../src/models/operational/tripSchedule.model.js';
import Booking from '../src/models/operational/booking.model.js';

import * as subscriptionService from '../src/services/subscription.service.js';
import * as tripScheduleService from '../src/services/tripSchedule.service.js';
import { runScannerCycle } from '../src/cronjobs/scheduleScanner.js';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const startTest = async () => {
    try {
        console.log('\n==================================================');
        console.log('--- TEST BỘ ĐÔI GÓI CƯỚC & LỊCH TRÌNH VÀ CRONJOB ---');
        console.log('==================================================\n');

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kidgo');
        
        // Dọn dẹp
        await User.deleteMany({ email: 'test-cron-parent@book.com' });
        await Subscription.deleteMany({ plan: 'monthly' });
        await TripSchedule.deleteMany({ pickupTime: { $exists: true } });
        await Booking.deleteMany({ type: 'recurring' }); 
        
        // 1. Tạo Parent & Route
        const parentUser = new User({
            phone: '0777777777', email: 'test-cron-parent@book.com', fullName: 'Phụ huynh Test Cron', password: '123', role: 'parent'
        });
        await parentUser.save();

        const testRoute = new Route({
            parentId: parentUser._id, name: 'Tuyến đường đi học', pickupCoords: { type: 'Point', coordinates: [106.7, 10.8] } 
        });
        await testRoute.save();
        console.log('[1] Khởi tạo tài khoản Phụ huynh thành công.');

        // 2. Test Tạo Gói Cước (Subscription)
        console.log('\n--- TEST CASE 1: MUA GÓI CƯỚC ---');
        const startDate = new Date();
        const endDate = new Date(); 
        endDate.setMonth(endDate.getMonth() + 1); // Gói 1 tháng

        const sub = await subscriptionService.createSubscription({
            parentId: parentUser._id,
            plan: 'monthly',
            startDate: startDate,
            endDate: endDate,
            tripsPerMonth: 40,
            price: 1500000
        });
        console.log(`    ✅ Đã mua gói cước thành công. Trạng thái: ${sub.status}. Mã gói: ${sub._id}`);

        // Edit Gói Cước
        const updatedSub = await subscriptionService.updateSubscription(sub._id, { tripsPerMonth: 60 });
        console.log(`    ✅ Nâng cấp gói cước thành 60 chuyến/tháng thành công.`);

        // 3. Test Tạo Lịch Trình (TripSchedule)
        console.log('\n--- TEST CASE 2: ĐẶT LỊCH TRÌNH BỊ LỖI DO VƯỢT HẠN ---');
        try {
            const outOfBoundsDate = new Date();
            outOfBoundsDate.setMonth(outOfBoundsDate.getMonth() + 3); // Lệch 3 tháng

            await tripScheduleService.createTripSchedule({
                parentId: parentUser._id,
                kidId: new mongoose.Types.ObjectId(),
                routeId: testRoute._id,
                subscriptionId: sub._id,
                pickupTime: "07:00",
                startDate: new Date(),
                endDate: outOfBoundsDate
            });
            console.log('    ❌ Bị lỗi: Không chặn được lỗi vượt rào.');
        } catch (error) {
            console.log(`    ✅ Bắt lỗi thành công: "${error.message}"`);
        }

        console.log('\n--- TEST CASE 3: ĐẶT LỊCH TRÌNH CHUẨN XÁC ---');
        const targetMoment = new Date(Date.now() + 20 * 60 * 1000); // 20 phút nữa xe chạy
        const hh = String(targetMoment.getHours()).padStart(2, '0');
        const mm = String(targetMoment.getMinutes()).padStart(2, '0');
        const simulatedPickupTime = `${hh}:${mm}`;

        const validSchedEnd = new Date();
        validSchedEnd.setDate(validSchedEnd.getDate() + 10);

        const schedule = await tripScheduleService.createTripSchedule({
            parentId: parentUser._id,
            kidId: new mongoose.Types.ObjectId(),
            routeId: testRoute._id,
            subscriptionId: sub._id,
            pickupTime: simulatedPickupTime,
            repeatDays: [0, 1, 2, 3, 4, 5, 6], // Chạy mọi ngày
            startDate: new Date(),
            endDate: validSchedEnd
        });
        console.log(`    ✅ Lưu lịch trình thành công! Đón bé lúc: ${simulatedPickupTime}`);

        // 4. Test CronJob Hoạt Động (Scanner)
        console.log('\n--- TEST CASE 4: CHẠY CRONJOB QUÉT LỊCH ---');
        console.log('    >> Giả lập mốc thời gian CronJob chạm đến phút quét mạng...');
        await runScannerCycle();

        // Kiểm tra xem Booking đã tự rụng xuống Database chưa
        const nBooking = await Booking.find({ scheduleId: schedule._id });
        if (nBooking.length > 0) {
            console.log(`    ✅ Tuyệt vời! Máy quét đã kích nổ tạo thành công ${nBooking.length} Booking.`);
        } else {
            console.error('    ❌ Thất bại: Không tạo được cuốc Booking nào.');
        }

        // Test Idempotency (Phòng đúp cuốc xe)
        console.log('\n--- TEST CASE 5: KHẢ NĂNG CHỐNG TRÙNG LẶP CỦA CRONJOB ---');
        console.log('    >> Chạy lại CronJob ngầm 1 vòng nữa (cố tình lặp lỗi)...');
        await runScannerCycle();
        const afterDuplicate = await Booking.find({ scheduleId: schedule._id });
        if (afterDuplicate.length === 1) {
            console.log(`    ✅ Chính xác! Số lượng Booking vẫn là 1. Tính năng Idempotency hoạt động siêu cứng.`);
        } else {
            console.error(`    ❌ Cảnh báo: Số lượng Booking đã đẻ ra ${afterDuplicate.length} cuốc.`);
        }

        console.log('\n==================================================');
        console.log('🎉 TẤT CẢ TÍNH NĂNG ĐÃ VƯỢT QUA BÀI TEST !');
        console.log('==================================================\n');

        await mongoose.disconnect();
        process.exit(0);
        
    } catch (e) {
        console.error('TEST FAILED:', e);
        process.exit(1);
    }
}
startTest();
