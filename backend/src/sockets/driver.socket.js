import { updateLocationInRedis } from "../services/driver.service.js";

export default function setupDriverSockets(io) {
  // Tạo namespace chuyên biệt cho nhóm Driver
  const driverNamespace = io.of("/driver");

  driverNamespace.on("connection", (socket) => {
    console.log(`[Socket] Driver connected: ${socket.id}`);

    let currentDriverId = null;

    const authenticateDriver = (data) => {
      if (!data?.driverId) {
        return;
      }

      currentDriverId = data.driverId;
      console.log(`[Socket] Authenticated driver: ${currentDriverId}`);
      socket.join(currentDriverId.toString());
    };

    socket.on("authenticate", authenticateDriver);

    const handleLocationUpdate = async (data) => {
      if (!currentDriverId && data?.driverId) {
        currentDriverId = data.driverId;
      }

      if (!currentDriverId) {
        return socket.emit("error", {
          message: "Yêu cầu xác thực (authenticate/authentice) trước.",
        });
      }

      const lat = Number(data?.lat);
      const lng = Number(data?.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return socket.emit("error", {
          message: "lat và lng phải là số hợp lệ.",
        });
      }
      // console.log(
      //   `[Socket] Driver ${currentDriverId}: update location lat:${lat}, lng:${lng}`,
      // );
      await updateLocationInRedis(currentDriverId, lat, lng);
    };

    socket.on("update_location", handleLocationUpdate);

    socket.on("disconnect", () => {
      console.log(`[Socket] Driver disconnected: ${socket.id}`);
      // Tips: Trong tương lai có thể bổ sung update isOnline = false tại đây.
    });
  });
}
