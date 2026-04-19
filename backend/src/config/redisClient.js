import Redis from "ioredis";

const redisClient = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379",
);

redisClient.on("error", (error) => {
  console.error("[Redis] Kết nối Redis lỗi:", error);
});

redisClient.on("connect", () => {
  console.log("[Redis] Redis client connected!");
});

export const closeRedis = async () => {
  try {
    await redisClient.quit();
    console.log("[Redis] Redis client đã đóng");
  } catch (error) {
    console.error("[Redis] Lỗi khi đóng Redis client:", error);
    try {
      redisClient.disconnect();
    } catch (disconnectError) {
      console.error(
        "[Redis] Lỗi khi disconnect Redis client:",
        disconnectError,
      );
    }
  }
};

export default redisClient;
