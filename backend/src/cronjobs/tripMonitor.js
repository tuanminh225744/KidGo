import cron from "node-cron";
import redisClient from "../config/redisClient.js";
import * as turf from "@turf/turf";
import Trip from "../models/operational/trip.model.js";
import LocationLog from "../models/safetyAndLogs/locationLog.model.js";
import { getIo } from "../sockets/socketManager.js";
import { createAlert } from "../services/alert.service.js";

export const runTripAnalytics = async () => {
  try {
    // Tìm toàn bộ danh sách các chuyến xe đang lăn bánh
    const activeTrips = await Trip.find({ status: "in_progress" });
    const io = getIo();

    for (const trip of activeTrips) {
      const driverIdStr = trip.driverId.toString();
      // Kéo lịch sử buffer GPS từ Redis về
      const rawBuffer = await redisClient.lrange(
        `trip_buffer:${driverIdStr}`,
        0,
        -1,
      );

      if (rawBuffer.length < 2) continue; // Phải có ít nhất 2 nhịp nhảy để làm toán

      // redis lrange: INDEX 0 LÀ ĐIỂM MỚI NHẤT
      const pts = rawBuffer.map((str) => JSON.parse(str));
      const newestPoint = pts[0];
      const previousPoint = pts[1];

      // Setup Không Gian TurfJS
      const currentPosition = turf.point([newestPoint.lng, newestPoint.lat]);
      const dropoffPosition = turf.point(
        trip.plannedRoute.dropoffCoords.coordinates,
      );

      // ============================================
      // 1. TÍNH TOÁN XE ĐUA VƯỢT TỐC ĐỘ (Speeding đa tầng)
      // ============================================
      const distKm = turf.distance(
        turf.point([previousPoint.lng, previousPoint.lat]),
        currentPosition,
        { units: "kilometers" },
      );
      const timeDiffHours =
        (newestPoint.time - previousPoint.time) / (1000 * 60 * 60);

      if (timeDiffHours > 0) {
        const speedKmh = distKm / timeDiffHours;
        if (speedKmh > 50) {
          const warningKey = `speeding_warning:${trip._id}`;
          const warningStart = await redisClient.get(warningKey);

          if (!warningStart) {
            // Lần đầu: Tạo cảnh báo tốc độ
            await redisClient.setex(warningKey, 180, Date.now()); // tự xóa sau 3 phút
            await createAlert({
              tripId: trip._id,
              driverId: trip.driverId,
              parentId: trip.parentId,
              type: "speed",
              level: speedKmh > 70 ? "critical" : "warning",
              location: {
                type: "Point",
                coordinates: [newestPoint.lng, newestPoint.lat],
              },
              metadata: { speed_kmh: Math.round(speedKmh) },
            });
          } else {
            // Đã có cảnh báo: kiểm tra xem có cải tà quy chính chưa
            const timeElapsedMs = Date.now() - parseInt(warningStart);
            if (timeElapsedMs > 60 * 1000) {
              // > 1 phút vẫn không chịu phanh
              // Tạo cảnh báo nghiêm trọng hơn hoặc cập nhật
              await createAlert({
                tripId: trip._id,
                driverId: trip.driverId,
                parentId: trip.parentId,
                type: "speed",
                level: "critical",
                location: {
                  type: "Point",
                  coordinates: [newestPoint.lng, newestPoint.lat],
                },
                metadata: {
                  speed_kmh: Math.round(speedKmh),
                  duration_minutes: Math.round(timeElapsedMs / 60000),
                },
              });
            }
          }
        } else {
          // Ngoan ngoãn giảm tốc -> xóa "án tích" trong Redis
          await redisClient.del(`speeding_warning:${trip._id}`);
        }
      }

      // ============================================
      // 2. TÍNH TOÁN DỪNG LẠI BẤT THƯỜNG
      // ============================================
      if (timeDiffHours > 0 && speedKmh === 0) {
        const stopKey = `unplanned_stop:${trip._id}`;
        const stopStart = await redisClient.get(stopKey);

        if (!stopStart) {
          // Bắt đầu dừng
          await redisClient.setex(stopKey, 600, Date.now()); // theo dõi 10 phút
        } else {
          const stopDurationMs = Date.now() - parseInt(stopStart);
          if (stopDurationMs > 5 * 60 * 1000) {
            // > 5 phút
            await createAlert({
              tripId: trip._id,
              driverId: trip.driverId,
              parentId: trip.parentId,
              type: "unplanned_stop",
              level: "warning",
              location: {
                type: "Point",
                coordinates: [newestPoint.lng, newestPoint.lat],
              },
              metadata: { stop_duration: Math.round(stopDurationMs / 60000) },
            });
            // Reset để tránh spam
            await redisClient.del(stopKey);
          }
        }
      } else {
        // Đang di chuyển -> xóa stop tracking
        await redisClient.del(`unplanned_stop:${trip._id}`);
      }

      // ============================================
      // 4. TÍNH TOÁN MẤT TÍN HIỆU GPS
      // ============================================
      const timeSinceLastUpdate = Date.now() - newestPoint.time;
      if (timeSinceLastUpdate > 2 * 60 * 1000) {
        // > 2 phút
        const gpsKey = `gps_lost:${trip._id}`;
        const gpsAlertSent = await redisClient.get(gpsKey);

        if (!gpsAlertSent) {
          await createAlert({
            tripId: trip._id,
            driverId: trip.driverId,
            parentId: trip.parentId,
            type: "gps_lost",
            level: "critical",
            location: {
              type: "Point",
              coordinates: [newestPoint.lng, newestPoint.lat],
            },
            metadata: {
              last_update_minutes: Math.round(timeSinceLastUpdate / 60000),
            },
          });
          await redisClient.setex(gpsKey, 300, "sent"); // tránh spam trong 5 phút
        }
      } else {
        await redisClient.del(`gps_lost:${trip._id}`);
      }

      // ============================================
      // 5. TÍNH TOÁN LỆCH TUYẾN
      // ============================================
      const distToDropoff = turf.distance(currentPosition, dropoffPosition, {
        units: "kilometers",
      });
      // Giả sử planned route là đường thẳng từ pickup đến dropoff
      const pickupPosition = turf.point(
        trip.plannedRoute.pickupCoords.coordinates,
      );
      const totalRouteDist = turf.distance(pickupPosition, dropoffPosition, {
        units: "kilometers",
      });
      const distFromPickup = turf.distance(currentPosition, pickupPosition, {
        units: "kilometers",
      });

      // Nếu đang ở giữa lộ trình nhưng cách dropoff quá xa (>1km) và không gần pickup
      if (
        distFromPickup > 0.5 &&
        distToDropoff > 1 &&
        distToDropoff > totalRouteDist * 0.8
      ) {
        const detourKey = `detour:${trip._id}`;
        const detourAlertSent = await redisClient.get(detourKey);

        if (!detourAlertSent) {
          const deviation = Math.max(distToDropoff - totalRouteDist, 0);
          await createAlert({
            tripId: trip._id,
            driverId: trip.driverId,
            parentId: trip.parentId,
            type: deviation > 2 ? "major_detour" : "detour",
            level: deviation > 2 ? "critical" : "warning",
            location: {
              type: "Point",
              coordinates: [newestPoint.lng, newestPoint.lat],
            },
            metadata: { deviation_meters: Math.round(deviation * 1000) },
          });
          await redisClient.setex(detourKey, 600, "sent"); // tránh spam 10 phút
        }
      } else {
        await redisClient.del(`detour:${trip._id}`);
      }

      // ============================================
      // 6. SẮP ĐẾN NHÀ (Proximity Alert)
      // ============================================
      if (distToDropoff < 0.5) {
        io.of("/parent")
          .to(trip.parentId.toString())
          .emit("approaching_dropoff", {
            title: "Bé cưng sắp về tới!",
            message: `Khoảng cách chỉ còn ${Math.round(distToDropoff * 1000)}m. Mẹ chuẩn bị ra đón bé nha.`,
            tripId: trip._id,
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
            { units: "kilometers" },
          );
          const tHrs = (pt.time - nextPt.time) / (1000 * 60 * 60);
          speed = tHrs > 0 ? d / tHrs : 0;
        }
        return {
          tripId: trip._id,
          coords: { type: "Point", coordinates: [pt.lng, pt.lat] },
          speed: speed !== null ? Math.round(speed) : undefined,
          recordedAt: new Date(pt.time),
        };
      });
      await LocationLog.insertMany(logDocs, { ordered: false });

      // Đốt cầu: Xóa sạch buffer để phút tiếp theo đo lại từ đầu
      await redisClient.del(`trip_buffer:${driverIdStr}`);
    }
  } catch (error) {
    console.error(
      "[CronJob Error] Lỗi Hệ thống Giám thị Bản đồ Analytics:",
      error,
    );
  }
};

/**
 * Nổ máy Cỗ máy Tính toán Không Gian Bản đồ
 */
export const startTripMonitor = () => {
  const task = cron.schedule("* * * * *", runTripAnalytics);
  console.log(`[Jobs] Trip monitor jobs launched successfully.`);
  return task;
};
