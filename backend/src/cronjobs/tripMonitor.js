import cron from "node-cron";
import redisClient from "../config/redisClient.js";
import * as turf from "@turf/turf";
import Trip from "../models/operational/trip.model.js";

import { checkSpeeding } from "./trip-monitor/speedingAlert.js";
import { checkAbnormalStop } from "./trip-monitor/abnormalStopAlert.js";
import { checkGpsLoss } from "./trip-monitor/gpsLossAlert.js";
import { checkOffRoute } from "./trip-monitor/offRouteAlert.js";

export const runTripAnalytics = async () => {
  console.log("[Jobs] Bắt đầu check các chuyến xe!");
  try {
    const activeTrips = await Trip.find({ status: "in_progress" }).populate("routeId");

    for (const trip of activeTrips) {
      const driverIdStr = trip.driverId.toString();

      const rawBuffer = await redisClient.lrange(`trip_buffer:${driverIdStr}`, 0, -1);

      if (rawBuffer.length < 2) {
        if (rawBuffer.length === 1) {
          const pts = rawBuffer.map((str) => JSON.parse(str));
          await checkGpsLoss(trip, pts[0].time);
        }
        continue;
      }

      // redis lrange: INDEX 0 LÀ ĐIỂM MỚI NHẤT
      const pts = rawBuffer.map((str) => JSON.parse(str));
      const newestPoint = pts[0];
      const previousPoint = pts[1];
      let speedKmh = 0;

      const currentPosition = turf.point([newestPoint.lng, newestPoint.lat]);

      // Tính tốc độ
      const distKm = turf.distance(
        turf.point([previousPoint.lng, previousPoint.lat]),
        currentPosition,
        { units: "kilometers" },
      );
      const timeDiffHours = (newestPoint.time - previousPoint.time) / (1000 * 60 * 60);

      if (timeDiffHours > 0) {
        speedKmh = distKm / timeDiffHours;
      }

      // 1. Kiểm tra Vượt Tốc Độ
      await checkSpeeding(trip, speedKmh);

      // 2. Kiểm tra Dừng Đỗ Bất Thường
      await checkAbnormalStop(trip, speedKmh, timeDiffHours);

      // 3. Kiểm tra Mất Tín Hiệu GPS
      await checkGpsLoss(trip, newestPoint.time);

      // 4. Kiểm tra Đi Lệch Tuyến
      await checkOffRoute(trip, currentPosition);

      // Xóa buffer
      await redisClient.del(`trip_buffer:${driverIdStr}`);
    }
  } catch (error) {
    console.error("[CronJob Error] Lỗi Hệ thống Giám thị Bản đồ Analytics:", error);
  }
};

export const startTripMonitor = () => {
  const task = cron.schedule("* * * * *", runTripAnalytics);
  console.log(`[Jobs] Trip monitor jobs launched successfully.`);
  return task;
};
