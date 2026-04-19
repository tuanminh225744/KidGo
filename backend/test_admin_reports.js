import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const SERVER_URL = `http://localhost:${process.env.PORT || 5000}`;
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || "abcasfnasoifjbcwb837f91bdfc";

const DUMMY_ADMIN_ID = new mongoose.Types.ObjectId().toString();

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
};

const fetchAPI = async (endpoint, options = {}) => {
  const url = `${SERVER_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error(`[LỖI FETCH] ${url}:`, error.message);
    return { status: 500, error: error.message };
  }
};

const startTest = async () => {
  console.log("=== BẮT ĐẦU CHẠY KIỂM THỬ ADMIN & REPORTS API ===\n");

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("[DB] Đã kết nối với MongoDB");
  } catch (err) {
    console.error("[DB] Không thể kết nối MongoDB:", err);
    return;
  }

  const User = mongoose.model("User", new mongoose.Schema({ phone: String, email: String, password: String, fullName: String, role: String, isActive: Boolean, driverId: mongoose.Schema.Types.ObjectId }, { strict: false }));
  const Driver = mongoose.model("Driver", new mongoose.Schema({ user: mongoose.Schema.Types.ObjectId, isActive: Boolean }, { strict: false }));
  const Trip = mongoose.model("Trip", new mongoose.Schema({}, { strict: false }));

  console.log("\n[SETUP] Tạo dữ liệu mock cho Test...");
  const mockAdmin = await User.create({ _id: DUMMY_ADMIN_ID, email: "admin_report@gmail.com", phone: "0888888877", password: "mock", fullName: "Admin Report", role: "admin" });
  
  const mockDriverId = new mongoose.Types.ObjectId();
  const mockUserId = new mongoose.Types.ObjectId();

  const mockUserDriver = await User.create({ _id: mockUserId, email: "driver123@gmail.com", phone: "123123123", role: "driver", driverId: mockDriverId, isActive: true });
  const mockDriver = await Driver.create({ _id: mockDriverId, user: mockUserId, isActive: true });

  const adminToken = generateToken(DUMMY_ADMIN_ID, "admin");

  try {
    // --- TEST 1: Khóa tài khoản driver ---
    console.log("\n[TEST 1] PUT /admin/users/:id/status - Khóa User (Driver)");
    let res = await fetchAPI(`/admin/users/${mockUserId.toString()}/status`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ isActive: false })
    });
    console.log(` > Status: ${res.status}`);
    console.log(` > Response:`, res.data);

    // Kiem tra du lieu Driver trong mong do
    const finalDriver = await Driver.findById(mockDriverId);
    console.log(` > Driver.isActive trong Database hien tai: ${finalDriver.isActive}`);

    // --- TEST 2: Lấy Advanced Reports ---
    console.log("\n[TEST 2] GET /dashboard/admin/reports - Lấy dữ liệu Report");
    res = await fetchAPI("/dashboard/admin/reports", {
      method: "GET",
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(` > Status: ${res.status}`);
    console.log(` > Trips Per Day Count:`, res.data.data?.tripsPerDay?.length);
    console.log(` > Driver Ratings Count:`, res.data.data?.driverRatings?.length);
    console.log(` > Overall Alert Rate:`, res.data.data?.alertRate);
    console.log(` > Overall Rating:`, res.data.data?.overallAverageRating);

  } catch (err) {
    console.error("[LỖI CHẠY TEST]", err);
  } finally {
    console.log("\n[CLEANUP] Xóa dữ liệu Mock...");
    await User.deleteMany({ _id: { $in: [DUMMY_ADMIN_ID, mockUserId] } });
    await Driver.deleteMany({ _id: mockDriverId });
    await mongoose.connection.close();
    console.log("=== KẾT THÚC KIỂM THỬ ===");
  }
};

startTest();
