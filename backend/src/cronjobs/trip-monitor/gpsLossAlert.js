import redisClient from "../../config/redisClient.js";
import { sendAlert, sendDanger } from "./notificationHelper.js";

export const checkGpsLoss = async (trip, newestPointTime) => {
  const alertMinutes = parseInt(process.env.GPS_LOSS_ALERT_MINUTES || "2", 10);
  const dangerMinutes = parseInt(process.env.GPS_LOSS_DANGER_MINUTES || "5", 10);

  const timeSinceLastUpdateMs = Date.now() - newestPointTime;
  const minutesElapsed = Math.round(timeSinceLastUpdateMs / 60000);

  if (minutesElapsed >= dangerMinutes) {
    const dangerKey = `gps_lost_danger_sent:${trip._id}`;
    const isDangerSent = await redisClient.get(dangerKey);

    if (!isDangerSent) {
      const title = "Mất tín hiệu GPS nghiêm trọng";
      const message = `Không nhận được tín hiệu định vị từ tài xế trong hơn ${dangerMinutes} phút. Vui lòng liên hệ trực tiếp.`;

      console.warn(`[TripMonitor] GPS loss danger for trip ${trip._id}: ${minutesElapsed} min`);
      await sendDanger(trip, title, message);

      await redisClient.setex(dangerKey, 600, "sent");
    }
  } else if (minutesElapsed >= alertMinutes) {
    const alertKey = `gps_lost_alert_sent:${trip._id}`;
    const isAlertSent = await redisClient.get(alertKey);

    if (!isAlertSent) {
      const title = "Cảnh báo mất tín hiệu GPS";
      const message = `Tín hiệu định vị đã mất hơn ${alertMinutes} phút. Vui lòng kiểm tra lại kết nối mạng.`;

      console.warn(`[TripMonitor] GPS loss alert for trip ${trip._id}: ${minutesElapsed} min`);
      await sendAlert(trip, title, message);

      await redisClient.setex(alertKey, dangerMinutes * 60, "sent");
    }
  } else {
    // Tín hiệu bình thường
    await redisClient.del(`gps_lost_alert_sent:${trip._id}`);
    await redisClient.del(`gps_lost_danger_sent:${trip._id}`);
  }
};
