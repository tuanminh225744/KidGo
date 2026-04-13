import Trip from '../models/operational/trip.model.js';
import Driver from '../models/core/driver.model.js';
import { getIo } from '../sockets/socketManager.js';
import Redis from 'ioredis';

const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

/**
 * 1. Tài xế bắt đầu di chuyển đến điểm đón
 * Sinh mã OTP bảo mật giao quyền chốt chuyến cho Phụ huynh
 */
export const driverStartPickup = async (tripId) => {
    try {
        const trip = await Trip.findById(tripId);
        if (!trip) throw new Error('Hành trình không tồn tại.');
        
        trip.status = 'picking_up';
        await trip.save();

        await Driver.findByIdAndUpdate(trip.driverId, { rideStatus: 'driving_to_pickup' });

        // Tạo mã OTP dùng 1 lần (6 số ngẫu nhiên) để xác thực bé nhóc lên xe
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await redisClient.setex(`trip_otp:${trip._id}`, 7200, otpCode); // Timeout bốc hơi sau 2 giờ

        const io = getIo();
        
        // Bắn Socket 1: Xe đang nổ máy di chuyển
        io.of('/parent').to(trip.parentId.toString()).emit('driver_is_coming', {
            title: 'Tài xế đang quay xe tới!',
            message: 'Tài xế đã bắt đầu di chuyển đến điểm đón bé. Vui lòng chuẩn bị cặp xách ra cửa nhé.',
            tripId: trip._id
        });

        // Bắn Socket 2: Bàn giao chìa khóa OTP cho Mẹ
        io.of('/parent').to(trip.parentId.toString()).emit('trip_otp_created', {
            title: 'Mã PIN đón con',
            otp: otpCode,
            message: 'Khi tài xế chui ra mở cửa, vui lòng đọc hoặc Chat gửi MÃ PIN NÀY cho bác tài để chứng minh đón đúng mã bé.',
            tripId: trip._id
        });

        return trip;
    } catch (error) {
        throw new Error(`Lỗi cập nhật chặng đường: ${error.message}`);
    }
};

/**
 * 2. Tài xế tới gặp mặt Bé & Nhập khớp Mã OTP
 */
export const driverPickupKid = async (tripId, enteredOtp) => {
    try {
        const trip = await Trip.findById(tripId);
        if (!trip) throw new Error('Hành trình không tồn tại.');

        // Kiểm tra độ trong sạch của OTP
        const storedOtp = await redisClient.get(`trip_otp:${trip._id}`);
        if (!storedOtp || storedOtp !== enteredOtp.toString()) {
            throw new Error('Mã OTP Phụ huynh cung cấp không chính xác hoặc chuyến xe này đã hết hạn OTP.');
        }

        // Nhập đúng -> Tiêu hủy OTP ngay lập tức
        await redisClient.del(`trip_otp:${trip._id}`);

        trip.status = 'in_progress';
        trip.actualPickupTime = new Date();
        trip.otpVerified = true; 
        await trip.save();

        // Nâng cấp trạng thái ông xế lên "Đang bon bon trên cầu"
        await Driver.findByIdAndUpdate(trip.driverId, { rideStatus: 'in_trip' });

        const io = getIo();
        io.of('/parent').to(trip.parentId.toString()).emit('kid_picked_up', {
            title: 'Đã đón bé - Rất An Toàn!',
            message: 'Xác thực MÃ PIN thành công. Hành khách nhí đã yên vị trên ghế và bắt đầu di chuyển.',
            tripId: trip._id
        });

        return trip;
    } catch (error) {
        throw new Error(`Lỗi quá trình tiếp nhận bé: ${error.message}`);
    }
};

/**
 * 3. Tài xế đến nơi, kết thúc chuyến xe mỹ mãn
 */
export const driverDropoffKid = async (tripId) => {
    try {
        const trip = await Trip.findById(tripId);
        if (!trip) throw new Error('Hành trình không tồn tại.');

        trip.status = 'completed';
        trip.actualDropoffTime = new Date();
        await trip.save();

        // Chuyến đi dứt điểm, Thả xích ông xế về Trạng thái "Tự Do 100%"
        await Driver.findByIdAndUpdate(trip.driverId, { rideStatus: 'free' });

        const io = getIo();
        io.of('/parent').to(trip.parentId.toString()).emit('kid_dropped_off', {
            title: 'Hành trình Mỹ Vãn',
            message: 'Bé con đã được thả xuống điểm trả một cách hoàn hảo. Cảm ơn Mẹ đã giao phó cho KidGo!',
            tripId: trip._id
        });

        return trip;
    } catch (error) {
        throw new Error(`Lỗi ấn nút trả khách: ${error.message}`);
    }
};
