import Trip from '../models/operational/trip.model.js';
import Driver from '../models/core/driver.model.js';
import LocationLog from '../models/safetyAndLogs/locationLog.model.js';
import * as turf from '@turf/turf';
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

/**
 * 4. Lấy lộ trình nén để vẽ đường đi trên bản đồ.
 *    Nguồn duy nhất: LocationLog collection (raw GPS) → lọc nén 10m tại query time.
 *    Dùng cho: Frontend vẽ Polyline (Google Maps / Mapbox)
 */
export const getCompressedRoute = async (tripId, minDistMeters = 10) => {
    const trip = await Trip.findById(tripId).select('status plannedRoute scheduledPickupTime');
    if (!trip) throw new Error('Hành trình không tồn tại.');

    // Kéo toàn bộ điểm raw theo thứ tự thời gian tăng dần
    const logs = await LocationLog
        .find({ tripId })
        .sort({ recordedAt: 1 })
        .select('coords recordedAt -_id');

    // Áp dụng thuật toán Map Snapping (chỉ giữ điểm nếu cách điểm trước > minDistMeters)
    const minDistKm = minDistMeters / 1000;
    const polyline = [];
    for (const log of logs) {
        const [lng, lat] = log.coords.coordinates;
        if (polyline.length === 0) {
            polyline.push({ lat, lng });
            continue;
        }
        const last = polyline[polyline.length - 1];
        const dist = turf.distance(
            turf.point([last.lng, last.lat]),
            turf.point([lng, lat]),
            { units: 'kilometers' }
        );
        if (dist >= minDistKm) {
            polyline.push({ lat, lng });
        }
    }

    return {
        tripId: trip._id,
        status: trip.status,
        plannedRoute: trip.plannedRoute,
        polyline,
        totalPoints: polyline.length,
        totalRawPoints: logs.length,
    };
};

/**
 * 5. Lấy toàn bộ Log GPS độ phân giải cao (raw, 10 giây / điểm).
 *    Dữ liệu nguồn: collection LocationLog
 *    Dùng cho: Admin tra cứu sự cố, phân tích chi tiết
 */
export const getRawLocationLog = async (tripId, { page = 1, limit = 500 } = {}) => {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
        LocationLog
            .find({ tripId })
            .sort({ recordedAt: 1 })  // Thứ tự thời gian tăng dần
            .skip(skip)
            .limit(limit)
            .select('coords speed heading accuracy recordedAt -_id'),
        LocationLog.countDocuments({ tripId }),
    ]);

    // Flatten coords để client không phải xử lý GeoJSON
    const points = logs.map(l => ({
        lat: l.coords.coordinates[1],
        lng: l.coords.coordinates[0],
        speed: l.speed,
        heading: l.heading,
        accuracy: l.accuracy,
        time: l.recordedAt,
    }));

    return {
        tripId,
        page,
        total,
        totalPages: Math.ceil(total / limit),
        points,
    };
};
