import redisClient from "../../config/redisClient.js";
import { sendAlert, sendDanger } from "./notificationHelper.js";

export const checkAbnormalStop = async (trip, speedKmh, timeDiffHours) => {
  const alertMinutes = parseInt(process.env.STOP_ALERT_MINUTES || "5", 10);
  const dangerMinutes = parseInt(process.env.STOP_DANGER_MINUTES || "10", 10);

  if (timeDiffHours > 0 && speedKmh < 5) {
    const stopKey = `unplanned_stop:${trip._id}`;
    const stopStart = await redisClient.get(stopKey);

    if (!stopStart) {
      await redisClient.setex(stopKey, dangerMinutes * 60, Date.now());
    } else {
      const stopDurationMs = Date.now() - parseInt(stopStart);
      const minutesElapsed = Math.round(stopDurationMs / 60000);

      // Check Danger
      if (minutesElapsed >= dangerMinutes) {
        const dangerKey = `unplanned_stop_danger_sent:${trip._id}`;
        const isDangerSent = await redisClient.get(dangerKey);

        if (!isDangerSent) {
          const title = "Cảnh báo dừng đỗ quá lâu";
          const message = `Tài xế đã dừng đỗ hoặc di chuyển cực kỳ chậm dưới 5km/h trong hơn ${dangerMinutes} phút.`;

          console.warn(`[TripMonitor] Unplanned stop danger for trip ${trip._id}: ${minutesElapsed} min`);
          await sendDanger(trip, title, message);

          await redisClient.setex(dangerKey, 600, "sent");
        }
      }
      // Check Alert
      else if (minutesElapsed >= alertMinutes) {
        const alertKey = `unplanned_stop_alert_sent:${trip._id}`;
        const isAlertSent = await redisClient.get(alertKey);

        if (!isAlertSent) {
          const title = "Lưu ý dừng đỗ";
          const message = `Tài xế có dấu hiệu dừng đỗ quá ${alertMinutes} phút.`;

          console.warn(`[TripMonitor] Unplanned stop alert for trip ${trip._id}: ${minutesElapsed} min`);
          await sendAlert(trip, title, message);

          await redisClient.setex(alertKey, dangerMinutes * 60, "sent");
        }
      }
    }
  } else if (speedKmh >= 5) {
    // Đang di chuyển -> xóa stop tracking
    await redisClient.del(`unplanned_stop:${trip._id}`);
    await redisClient.del(`unplanned_stop_alert_sent:${trip._id}`);
    await redisClient.del(`unplanned_stop_danger_sent:${trip._id}`);
  }
};
