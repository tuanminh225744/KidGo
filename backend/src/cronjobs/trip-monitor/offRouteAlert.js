import redisClient from "../../config/redisClient.js";
import { sendAlert, sendDanger } from "./notificationHelper.js";
import * as turf from "@turf/turf";

export const checkOffRoute = async (trip, currentPosition) => {
  const alertMeters = parseInt(process.env.OFF_ROUTE_ALERT_METERS || "200", 10);
  const dangerMeters = parseInt(process.env.OFF_ROUTE_DANGER_METERS || "500", 10);

  const waypoints = trip.routeId?.estimatedWaypoints || [];

  // Cần ít nhất 2 điểm để tạo đường thẳng LineString
  if (waypoints.length < 2) return;

  // Chuyển array of PointSchema [{ type: "Point", coordinates: [lng, lat] }] thành coordinates cho LineString
  const lineCoords = waypoints.map((wp) => wp.coordinates);
  const routeLine = turf.lineString(lineCoords);

  // Tính khoảng cách ngắn nhất từ điểm hiện tại đến đường line lộ trình
  const distanceKm = turf.pointToLineDistance(currentPosition, routeLine, { units: "kilometers" });
  const deviationMeters = distanceKm * 1000;

  if (deviationMeters > dangerMeters) {
    const dangerKey = `off_route_danger_sent:${trip._id}`;
    const isDangerSent = await redisClient.get(dangerKey);

    if (!isDangerSent) {
      const title = "Cảnh báo đi sai lộ trình nghiêm trọng";
      const message = `Tài xế đã đi chệch khỏi lộ trình dự kiến hơn ${Math.round(deviationMeters)}m.`;

      console.warn(`[TripMonitor] Off route danger for trip ${trip._id}: ${Math.round(deviationMeters)}m`);
      await sendDanger(trip, title, message);

      await redisClient.setex(dangerKey, 600, "sent"); // 10 phút
    }
  } else if (deviationMeters > alertMeters) {
    const alertKey = `off_route_alert_sent:${trip._id}`;
    const isAlertSent = await redisClient.get(alertKey);

    if (!isAlertSent) {
      const title = "Lưu ý chệch lộ trình";
      const message = `Tài xế đang đi chệch khỏi lộ trình dự kiến ${Math.round(deviationMeters)}m.`;

      console.warn(`[TripMonitor] Off route alert for trip ${trip._id}: ${Math.round(deviationMeters)}m`);
      await sendAlert(trip, title, message);

      await redisClient.setex(alertKey, 600, "sent"); // 10 phút
    }
  } else {
    // Trở lại đúng đường
    await redisClient.del(`off_route_alert_sent:${trip._id}`);
    await redisClient.del(`off_route_danger_sent:${trip._id}`);
  }
};
