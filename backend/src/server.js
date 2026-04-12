import connectDB from "./config/db.js";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { syncLocationsToDB } from "./services/driver.service.js";
import setupDriverSockets from "./sockets/driver.socket.js";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

// Khởi tạo Socket.io tích hợp CORS
const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

connectDB();

app.use(express.json());

// Gắn Router hứng sự kiện Socket cho Driver
setupDriverSockets(io);

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
