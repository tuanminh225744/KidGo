import cron from 'node-cron';
import Redis from 'ioredis';
import * as turf from '@turf/turf';
import Trip from '../models/operational/trip.model.js';
import LocationLog from '../models/safetyAndLogs/locationLog.model.js';
import { getIo } from '../sockets/socketManager.js';

const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export const runTripAnalytics = async () => {
    try {
        // Tìm toàn bộ danh sách các chuyến xe đang lăn bánh
        const activeTrips = await Trip.find({ status: 'in_progress' });
        const io = getIo();

        for (const trip of activeTrips) {
            const driverIdStr = trip.driverId.toString();
            // Kéo lịch sử buffer GPS từ Redis về
            const rawBuffer = await redisClient.lrange(`trip_buffer:${driverIdStr}`, 0, -1);

            if (rawBuffer.length < 2) continue; // Phải có ít nhất 2 nhịp nhảy để làm toán

            // redis lrange: INDEX 0 LÀ ĐIỂM MỚI NHẤT
            const pts = rawBuffer.map(str => JSON.parse(str));
            const newestPoint = pts[0];
            const previousPoint = pts[1];

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
                if (speedKmh > 50) {
                    const warningKey = `speeding_warning:${trip._id}`;
                    const warningStart = await redisClient.get(warningKey);

                    if (!warningStart) {
                        // Lần đầu: Cảnh báo kín Bác Tài, lưu "án tích" trong Redis
                        await redisClient.setex(warningKey, 180, Date.now()); // tự xóa sau 3 phút
                        io.of('/driver').to(trip.driverId.toString()).emit('trip_alert_speeding', {
                            title: 'Cảnh báo Tốc Độ!',
                            message: `Bạn đang chạy ${Math.round(speedKmh)}km/h. Vui lòng giảm tốc độ để đảm bảo an toàn cho bé!`,
                        });
                    } else {
                        // Đã có "án tích": kiểm tra xem có cải tà quy chính chưa
                        const timeElapsedMs = Date.now() - parseInt(warningStart);
                        if (timeElapsedMs > 60 * 1000) { // > 1 phút vẫn không chịu phanh
                            io.of('/parent').to(trip.parentId.toString()).emit('trip_alert_speeding', {
                                title: 'Cảnh báo Tốc Độ tài xế!',
                                message: `Tài xế đang di chuyển khá nhanh (${Math.round(speedKmh)}km/h) liên tục hơn 1 phút qua. Bố/Mẹ có thể nhắn tin nhắc nhở bác tài nhé.`,
                            });
                        }
                    }
                } else {
                    // Ngoan ngoãn giảm tốc -> xóa "án tích" trong Redis
                    await redisClient.del(`speeding_warning:${trip._id}`);
                }
            }

            // ============================================
            // 2. TÍNH TOÁN NGỦ GẬT / DỪNG LẠI
            // ============================================
            // (Tạm thời đóng theo yêu cầu — mở lại sau)

            // ============================================
            // 3. SẮP ĐẾN NHÀ (Proximity Alert)
            // ============================================
            const distToDropoff = turf.distance(currentPosition, dropoffPosition, { units: 'kilometers' });
            if (distToDropoff < 0.5) {
                io.of('/parent').to(trip.parentId.toString()).emit('approaching_dropoff', {
                    title: 'Bé cưng sắp về tới!',
                    message: `Khoảng cách chỉ còn ${Math.round(distToDropoff * 1000)}m. Mẹ chuẩn bị ra đón bé nha.`,
                    tripId: trip._id
                });
            }

            // ============================================
            // 4. GHI LOCATION LOG (Single Source of Truth)
            // ============================================
            // Lưu toàn bộ điểm GPS trong buffer vào LocationLog (raw, full resolution).
            // KHÔNG ghi vào Trip.actualRoute nữa — getCompressedRoute() sẽ tính từ LocationLog khi cần.
            const logDocs = pts.map((pt, i) => {
                let speed = null;
                if (i < pts.length - 1) {
                    const nextPt = pts[i + 1];
                    const d = turf.distance(
                        turf.point([nextPt.lng, nextPt.lat]),
                        turf.point([pt.lng, pt.lat]),
                        { units: 'kilometers' }
                    );
                    const tHrs = (pt.time - nextPt.time) / (1000 * 60 * 60);
                    speed = tHrs > 0 ? d / tHrs : 0;
                }
                return {
                    tripId: trip._id,
                    coords: { type: 'Point', coordinates: [pt.lng, pt.lat] },
                    speed: speed !== null ? Math.round(speed) : undefined,
                    recordedAt: new Date(pt.time),
                };
            });
            await LocationLog.insertMany(logDocs, { ordered: false });

            // Đốt cầu: Xóa sạch buffer để phút tiếp theo đo lại từ đầu
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
