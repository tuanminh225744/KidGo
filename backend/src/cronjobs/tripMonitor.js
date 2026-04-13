import cron from 'node-cron';
import Redis from 'ioredis';
import * as turf from '@turf/turf';
import Trip from '../models/operational/trip.model.js';
import { getIo } from '../sockets/socketManager.js';

const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export const runTripAnalytics = async () => {
    try {
        // Tìm toàn bộ danh sách các chuyến xe đang lăn bánh
        const activeTrips = await Trip.find({ status: 'in_progress' });
        const io = getIo();

        for (const trip of activeTrips) {
            const driverIdStr = trip.driverId.toString();
            // Kéo nguyên cục Lịch sử 5 tọa độ gần nhất (60 giây) từ Redis về
            const rawBuffer = await redisClient.lrange(`trip_buffer:${driverIdStr}`, 0, -1);

            if (rawBuffer.length < 2) continue; // Phải có ít nhất 2 nhịp nhảy để làm toán

            // redis lrange trả về mảng với INDEX 0 LÀ ĐIỂM MỚI NHẤT (Vừa push cuối cùng)
            const pts = rawBuffer.map(str => JSON.parse(str));
            const newestPoint = pts[0];
            const previousPoint = pts[1];
            const oldestPoint = pts[pts.length - 1];

            // Setup Không Gian TurfJS
            const currentPosition = turf.point([newestPoint.lng, newestPoint.lat]);
            const dropoffPosition = turf.point(trip.plannedRoute.dropoffCoords.coordinates);

            // ============================================
            // 1. TÍNH TOÁN XE ĐUA VƯỢT TỐC ĐỘ (Speeding đa tầng)
            // ============================================
            const distKm = turf.distance(
                turf.point([previousPoint.lng, previousPoint.lat]),
                currentPosition,
                { units: 'kilometers' }
            );
            const timeDiffHours = (newestPoint.time - previousPoint.time) / (1000 * 60 * 60);

            if (timeDiffHours > 0) {
                const speedKmh = distKm / timeDiffHours;
                if (speedKmh > 50) { // Nếu vượt 50km/h
                    const warningKey = `speeding_warning:${trip._id}`;
                    const warningStart = await redisClient.get(warningKey);

                    if (!warningStart) {
                        // Lần đầu phát hiện: Lưu bộ đếm thời gian và cảnh báo KÍN cho Bác Tài
                        await redisClient.setex(warningKey, 180, Date.now()); // Expire 3 phút tự động xóa
                        io.of('/driver').to(trip.driverId.toString()).emit('trip_alert_speeding', {
                            title: 'Cảnh báo Tốc Độ!',
                            message: `Bạn đang chạy ${Math.round(speedKmh)}km/h. Vui lòng giảm tốc độ để đảm bảo an toàn cho bé!`,
                        });
                    } else {
                        // Đã có tiền án, kiểm tra thời gian ngoan cố
                        const timeElapsedMs = Date.now() - parseInt(warningStart);
                        if (timeElapsedMs > 2 * 60 * 1000) { // Quá 2 phút vẫn chưa chịu phanh lại
                            // Lúc này mới Báo động Đỏ cho Phụ huynh
                            io.of('/parent').to(trip.parentId.toString()).emit('trip_alert_speeding', {
                                title: 'Cảnh báo Tốc Độ tài xế!',
                                message: `Tài xế đang di chuyển khá nhanh (${Math.round(speedKmh)}km/h) trong liên tục hơn 2 phút qua. Bố/Mẹ có thể nhắn tin nhắc nhở bác tài nhé.`,
                            });
                        }
                    }
                } else {
                    // Nếu ngoan ngoãn giảm tốc độ xuống < 50km/h, xóa ngay "án tích" trong Redis
                    await redisClient.del(`speeding_warning:${trip._id}`);
                }
            }

            // ============================================
            // 2. TÍNH TOÁN NGỦ GẬT / DỪNG LẠI (Tạm thời Đóng chức năng này theo yêu cầu)
            // ============================================
            // (Chờ nâng cấp và mở lại sau...)
            // ============================================
            // 3. TÍNH TOÁN SẮP ĐẾN NHÀ (Proximity Alert)
            // ============================================
            const distToDropoff = turf.distance(currentPosition, dropoffPosition, { units: 'kilometers' });
            if (distToDropoff < 0.5) { // Cách nhà < 500 mét
                io.of('/parent').to(trip.parentId.toString()).emit('approaching_dropoff', {
                    title: 'Bé cưng sắp về tới!',
                    message: `Khoảng cách chỉ còn ${Math.round(distToDropoff * 1000)}m. Mẹ chuẩn bị ra đón bé nha.`,
                    tripId: trip._id
                });
            }

            // ============================================
            // 4. LƯU MẢNG ĐƯỜNG ĐI LỊCH SỬ CHỐNG RÁC DB (Map Snapping)
            // ============================================
            /* 
             Bởi vì Mảng actualRoute có thể bự kinh khủng, ta chỉ lưu điểm NewestPoint VÀO MONGO 
             NẾU khoảng cách so với điểm lưu trước đó văng ra xa quá 10 mét.
            */
            let shouldSave = false;

            if (!trip.actualRoute || trip.actualRoute.length === 0) {
                shouldSave = true; // Khai trương điểm đầu tiên
            } else {
                const lastSaved = trip.actualRoute[trip.actualRoute.length - 1];
                const shiftDist = turf.distance(
                    turf.point(lastSaved.coordinates),
                    currentPosition,
                    { units: 'kilometers' }
                );
                if (shiftDist >= 0.01) { // 0.01 km = 10 mét
                    shouldSave = true;
                }
            }

            if (shouldSave) {
                const geoJsonFormat = {
                    type: 'Point',
                    coordinates: [newestPoint.lng, newestPoint.lat]
                };
                // Push thẳng mảng bằng DB cấp thấp để không khóa lock document
                await Trip.updateOne(
                    { _id: trip._id },
                    { $push: { actualRoute: geoJsonFormat } }
                );
                // console.log(`[TripMonitor] Đã đồng bộ 1 tọa độ nén vào Database cho chuyến ${trip._id}`);
            }

            // Xóa sạch Buffer List hiện tại cùa tài xế trên Redis để Phút tiếp theo nó bắt đầu đo lại từ đầu
            // Tính toán xong thì ta đốt củi qua cầu!
            await redisClient.del(`trip_buffer:${driverIdStr}`);
        }

    } catch (error) {
        console.error('[CronJob Error] Lỗi Hệ thống Giám thị Bản đồ Analytics:', error);
    }
};

/**
 * Nổ máy Cỗ máy Tính toán Không Gian Bản đồ
 */
export const startTripMonitor = () => {
    cron.schedule('* * * * *', runTripAnalytics);
    console.log(`✅ Khởi động thành công Trạm Khảo Sát Không Gian Bản Đồ (Trip Monitor - 1 phút/lần).`);
};
