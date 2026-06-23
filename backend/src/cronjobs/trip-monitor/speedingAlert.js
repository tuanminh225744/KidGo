import redisClient from "../../config/redisClient.js";
import { sendAlert, sendDanger } from "./notificationHelper.js";

export const checkSpeeding = async (trip, speedKmh) => {
  const limitKmh = parseInt(process.env.SPEED_LIMIT_KMH || "50", 10);
  const dangerMinutes = parseInt(process.env.SPEED_DANGER_MINUTES || "3", 10);

  if (speedKmh > limitKmh) {
    const warningKey = `speeding_warning:${trip._id}`;
    const warningStart = await redisClient.get(warningKey);

    if (!warningStart) {
      // Lần đầu vi phạm
      await redisClient.setex(warningKey, dangerMinutes * 60, Date.now()); // tự xóa sau dangerMinutes phút
      const title = "Cảnh báo vượt quá tốc độ";
      const message = `Tài xế đang chạy quá tốc độ: ${Math.round(speedKmh)} km/h. Vui lòng giảm tốc độ để đảm bảo an toàn.`;

      console.warn(`[TripMonitor] Speed alert for trip ${trip._id}: ${Math.round(speedKmh)} km/h`);
      await sendAlert(trip, title, message);
    } else {
      // Đã vi phạm trước đó, kiểm tra thời gian
      const timeElapsedMs = Date.now() - parseInt(warningStart);

      if (timeElapsedMs > dangerMinutes * 60 * 1000) {
        // Đã quá thời gian dangerMinutes
        const dangerKey = `speeding_danger_sent:${trip._id}`;
        const isDangerSent = await redisClient.get(dangerKey);

        if (!isDangerSent) {
          const title = "Cảnh báo tốc độ nguy hiểm";
          const message = `Tài xế đã chạy quá tốc độ (${Math.round(speedKmh)} km/h) liên tục trong hơn ${dangerMinutes} phút.`;

          console.warn(`[TripMonitor] Persistent speed danger for trip ${trip._id}: ${Math.round(speedKmh)} km/h`);
          await sendDanger(trip, title, message);

          // Đánh dấu đã gửi danger để không gửi liên tục mỗi nhịp
          await redisClient.setex(dangerKey, 600, "sent");
        }
      }
    }
  } else {
    // Nếu tốc độ bình thường, xóa cảnh báo
    await redisClient.del(`speeding_warning:${trip._id}`);
    await redisClient.del(`speeding_danger_sent:${trip._id}`);
  }
};
