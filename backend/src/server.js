import connectDB from "./config/db.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { syncLocationsToDB } from "./services/driver.service.js";
import { initSocketConfig, getIo } from "./sockets/socketManager.js";
import { startScheduleScanner } from "./cronjobs/scheduleScanner.js";
import { startTripMonitor } from "./cronjobs/tripMonitor.js";
import AlertRoutes from "./routes/AlertRoutes.js";
import ReviewRoutes from "./routes/ReviewRoutes.js";
import NotificationRoutes from "./routes/NotificationRoutes.js";
import DashboardRoutes from "./routes/DashboardRoutes.js";
import AdminUserRoutes from "./routes/AdminUserRoutes.js";
import AuthRoutes from "./routes/AuthRoutes.js";
import UserRoutes from "./routes/UserRoutes.js";
import KidRoutes from "./routes/KidRoutes.js";
import {
  loggerMiddleware,
  errorLoggerMiddleware,
  closeLogStreams,
} from "./middlewares/logger.middleware.js";
import { apiLimiter } from "./middlewares/rateLimiter.middleware.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/errorHandler.middleware.js";
import { closeRedis } from "./config/redisClient.js";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

let scheduleScannerTask = null;
let tripMonitorTask = null;

// Gọi khối lệnh gốc trung tâm quản lý mọi namespace socket
initSocketConfig(httpServer);
// Kích hoạt vệ tinh quét Lịch Trình tự động gọi xe
scheduleScannerTask = startScheduleScanner();
// Kích hoạt Cảnh Sát Máy (Giám sát Tốc Độ, Sai Tuyến)
tripMonitorTask = startTripMonitor();

connectDB();

// ============================================
// Middleware Order
// ============================================
// 1. Logger (ghi lại request)
app.use(loggerMiddleware);

// 2. Security & Body Parser
app.use(helmet({ crossOriginResourcePolicy: false }));
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
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/users", UserRoutes);
app.use("/api/v1/kids", KidRoutes);
app.use("/alerts", AlertRoutes);
app.use("/reviews", ReviewRoutes);
app.use("/notifications", NotificationRoutes);
app.use("/dashboard", DashboardRoutes);
app.use("/admin/users", AdminUserRoutes);

// 5. 404 Handler (trước error handler)
app.use(notFoundHandler);

// 6. Error Logger (ghi lại error)
app.use(errorLoggerMiddleware);

// 7. Global Error Handler (xử lý error, phải ở cuối cùng)
app.use(errorHandler);

// Lên lịch Job chạy ngầm: Gom mẻ Tọa độ từ Redis đổ lên Mongo 1 phút / 1 lần
const SYNC_INTERVAL = 60 * 1000;
const syncInterval = setInterval(async () => {
  await syncLocationsToDB();
}, SYNC_INTERVAL);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`[Server] Server running at http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
  res.send("API is running...");
});

const gracefulShutdown = async (signal) => {
  console.log(`[Shutdown] Bắt đầu tắt server vì ${signal}`);

  if (scheduleScannerTask) {
    try {
      scheduleScannerTask.stop();
      scheduleScannerTask.destroy();
      console.log("[Shutdown] Đã dừng scheduleScanner task.");
    } catch (error) {
      console.error("[Shutdown] Lỗi khi dừng scheduleScanner task:", error);
    }
  }

  if (tripMonitorTask) {
    try {
      tripMonitorTask.stop();
      tripMonitorTask.destroy();
      console.log("[Shutdown] Đã dừng tripMonitor task.");
    } catch (error) {
      console.error("[Shutdown] Lỗi khi dừng tripMonitor task:", error);
    }
  }

  clearInterval(syncInterval);
  console.log("[Shutdown] Đã xóa sync interval.");

  const io = getIo();
  if (io) {
    try {
      io.close();
      console.log("[Shutdown] Đã đóng socket.io.");
    } catch (error) {
      console.error("[Shutdown] Lỗi khi đóng socket.io:", error);
    }
  }

  try {
    await closeRedis();
  } catch (error) {
    console.error("[Shutdown] Lỗi khi đóng Redis:", error);
  }

  try {
    await mongoose.connection.close(false);
    console.log("[Shutdown] Đã đóng kết nối MongoDB.");
  } catch (error) {
    console.error("[Shutdown] Lỗi khi đóng MongoDB:", error);
  }

  try {
    await new Promise((resolve, reject) => {
      httpServer.close((err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    console.log("[Shutdown] HTTP server đã đóng.");
  } catch (error) {
    console.error("[Shutdown] Lỗi khi đóng HTTP server:", error);
  }

  try {
    closeLogStreams();
  } catch (error) {
    console.error("[Shutdown] Lỗi khi đóng log streams:", error);
  }

  const exitCode = ["SIGINT", "SIGTERM"].includes(signal) ? 0 : 1;
  process.exit(exitCode);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("uncaughtException", (error) => {
  console.error("[Shutdown] uncaughtException:", error);
  gracefulShutdown("uncaughtException");
});
process.on("unhandledRejection", (reason) => {
  console.error("[Shutdown] unhandledRejection:", reason);
  gracefulShutdown("unhandledRejection");
});
