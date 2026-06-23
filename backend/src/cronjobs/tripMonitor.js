import cron from "node-cron";
import redisClient from "../config/redisClient.js";
import * as turf from "@turf/turf";
import Trip from "../models/operational/trip.model.js";
import { getIo } from "../sockets/socketManager.js";

export const runTripAnalytics = async () => {
  console.log("[Jobs] Bắt đầu check các chuyến xe!");
  try {
    // Tìm toàn bộ danh sách các chuyến xe đang lăn bánh
    const activeTrips = await Trip.find({ status: "in_progress" }).populate("routeId");
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
      let speedKmh = 0;

      // Setup Không Gian TurfJS
      const currentPosition = turf.point([newestPoint.lng, newestPoint.lat]);
      const dropoffCoords = trip.routeId?.actualDropoffCoords?.coordinates || trip.routeId?.estimatedDropoffCoords?.coordinates;
      if (!dropoffCoords || dropoffCoords.length !== 2) continue;
      const dropoffPosition = turf.point(dropoffCoords);

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
        speedKmh = distKm / timeDiffHours;
        if (speedKmh > 50) {
          const warningKey = `speeding_warning:${trip._id}`;
          const warningStart = await redisClient.get(warningKey);

          if (!warningStart) {
            await redisClient.setex(warningKey, 180, Date.now()); // tự xóa sau 3 phút
            console.warn(
              `[TripMonitor] Speed warning for trip ${trip._id}: ${Math.round(speedKmh)} km/h`,
            );
          } else {
            const timeElapsedMs = Date.now() - parseInt(warningStart);
            if (timeElapsedMs > 60 * 1000) {
              console.warn(
                `[TripMonitor] Persistent speed warning for trip ${trip._id}: ${Math.round(speedKmh)} km/h after ${Math.round(timeElapsedMs / 60000)} min`,
              );
            }
          }
        } else {
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
          await redisClient.setex(stopKey, 600, Date.now()); // theo dõi 10 phút
        } else {
          const stopDurationMs = Date.now() - parseInt(stopStart);
          if (stopDurationMs > 5 * 60 * 1000) {
            console.warn(
              `[TripMonitor] Unplanned stop for trip ${trip._id}: ${Math.round(stopDurationMs / 60000)} min`,
            );
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
        const gpsKey = `gps_lost:${trip._id}`;
        const gpsAlertSent = await redisClient.get(gpsKey);

        if (!gpsAlertSent) {
          console.warn(
            `[TripMonitor] GPS lost for trip ${trip._id}: ${Math.round(timeSinceLastUpdate / 60000)} min`,
          );
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
      const pickupCoords = trip.routeId?.actualPickupCoords?.coordinates || trip.routeId?.estimatedPickupCoords?.coordinates;
      if (!pickupCoords || pickupCoords.length !== 2) continue;
      const pickupPosition = turf.point(pickupCoords);
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
          console.warn(
            `[TripMonitor] Detour warning for trip ${trip._id}: ${Math.round(deviation * 1000)}m`,
          );
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
