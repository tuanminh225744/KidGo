import connectDB from "./config/db.js";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import { syncLocationsToDB } from "./services/driver.service.js";
import { initSocketConfig } from "./sockets/socketManager.js";
import { startScheduleScanner } from "./cronjobs/scheduleScanner.js";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

// Gọi khối lệnh gốc trung tâm quản lý mọi namespace socket
initSocketConfig(httpServer);
// Kích hoạt vệ tinh quét Lịch Trình tự động gọi xe
startScheduleScanner();

connectDB();

app.use(express.json());

// Lên lịch Job chạy ngầm: Gom mẻ Tọa độ từ Redis đổ lên Mongo 1 phút / 1 lần
const SYNC_INTERVAL = 60 * 1000;
setInterval(async () => {
  await syncLocationsToDB();
}, SYNC_INTERVAL);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`⚡ Socket.io enabled and Sync CronJob started (1 min interval).`);
});

app.get("/", (req, res) => {
  res.send("API is running...");
});
