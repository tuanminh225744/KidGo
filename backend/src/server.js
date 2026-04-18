import connectDB from "./config/db.js";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { syncLocationsToDB } from "./services/driver.service.js";
import { initSocketConfig } from "./sockets/socketManager.js";
import { startScheduleScanner } from "./cronjobs/scheduleScanner.js";
import { startTripMonitor } from "./cronjobs/tripMonitor.js";
import AlertRoutes from "./routes/AlertRoutes.js";
import {
  loggerMiddleware,
  errorLoggerMiddleware,
} from "./middlewares/logger.middleware.js";
import { apiLimiter } from "./middlewares/rateLimiter.middleware.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/errorHandler.middleware.js";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

// Gọi khối lệnh gốc trung tâm quản lý mọi namespace socket
initSocketConfig(httpServer);
// Kích hoạt vệ tinh quét Lịch Trình tự động gọi xe
startScheduleScanner();
// Kích hoạt Cảnh Sát Máy (Giám sát Tốc Độ, Sai Tuyến)
startTripMonitor();

connectDB();

// ============================================
// Middleware Order
// ============================================
// 1. Logger (ghi lại request)
app.use(loggerMiddleware);

// 2. Security & Body Parser
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. HTTP Logger (morgan)
app.use(morgan("dev"));

// 4. Rate Limiter (giới hạn request)
app.use(apiLimiter);

// ============================================
// Routes
// ============================================
app.use("/alerts", AlertRoutes);

// 5. 404 Handler (trước error handler)
app.use(notFoundHandler);

// 6. Error Logger (ghi lại error)
app.use(errorLoggerMiddleware);

// 7. Global Error Handler (xử lý error, phải ở cuối cùng)
app.use(errorHandler);

// Lên lịch Job chạy ngầm: Gom mẻ Tọa độ từ Redis đổ lên Mongo 1 phút / 1 lần
const SYNC_INTERVAL = 60 * 1000;
setInterval(async () => {
  await syncLocationsToDB();
}, SYNC_INTERVAL);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(
    `⚡ Socket.io enabled and Sync CronJob started (1 min interval).`,
  );
});

app.get("/", (req, res) => {
  res.send("API is running...");
});
