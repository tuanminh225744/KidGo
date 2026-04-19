import mongoose from "mongoose";
import dotenv from "dotenv";
import Redis from "ioredis";

dotenv.config();

const SERVER_URL = `http://localhost:${process.env.PORT || 5000}`;
const redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

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
  console.log("=== BẮT ĐẦU CHẠY KIỂM THỬ AUTH OTP API ===\n");

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("[DB] Đã kết nối với MongoDB");
  } catch (err) {
    console.error("[DB] Không thể kết nối MongoDB:", err);
    return;
  }

  const User = mongoose.model("User", new mongoose.Schema({ email: String, isVerified: Boolean }, { strict: false }));
  
  const mockEmail = "test_otp_login_flow@kidgo.vn";
  
  console.log("\n[SETUP] Tạo người dùng thử nghiệm chưa xác thực...");
  await User.deleteOne({ email: mockEmail });
  const mockUser = await User.create({ email: mockEmail, phone: "1231231235", password: "mock", fullName: "User OTP Test", role: "parent", isVerified: false });

  try {
    // --- TEST 1: Gửi OTP ---
    console.log(`\n[TEST 1] POST /api/v1/auth/send-otp - Yêu cầu gửi OTP tới ${mockEmail}`);
    let res = await fetchAPI("/api/v1/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ email: mockEmail })
    });
    console.log(` > Status: ${res.status}`);
    console.log(` > Response:`, res.data);

    // Lấy lén mã OTP vừa được tạo ra từ Redis chứ không phải email
    const otpCode = await redisClient.get(`otp:${mockEmail}`);
    console.log(` > [Internal] Mã OTP trích xuất từ Redis: ${otpCode}`);

    // --- TEST 2: Xác thực mã OTP và nhận Token ---
    console.log(`\n[TEST 2] POST /api/v1/auth/verify-otp - Nhập OTP đúng để đăng nhập`);
    res = await fetchAPI("/api/v1/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email: mockEmail, otp: otpCode })
    });
    console.log(` > Status: ${res.status}`);
    console.log(` > Response:`, res.data);

    const accessToken = res.data.accessToken;
    const refreshToken = res.data.refreshToken;

    // Xác nhận trạng thái User đã cập nhật chưa
    const userVerifiedCheck = await User.findOne({ email: mockEmail });
    console.log(` > Kiểm tra logic update DB: isVerified = ${userVerifiedCheck.isVerified} (Kỳ vọng: true)`);

    // --- TEST 3: Đăng nhập bằng OTP sai mã ---
    console.log(`\n[TEST 3] POST /api/v1/auth/verify-otp - Nhập OTP sai mã`);
    res = await fetchAPI("/api/v1/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email: mockEmail, otp: "000000" })
    });
    console.log(` > Status: ${res.status}`);
    console.log(` > Response:`, res.data);

    // --- TEST 4: Refresh Access Token ---
    console.log(`\n[TEST 4] POST /api/v1/auth/refresh - Gia hạn Access Token`);
    res = await fetchAPI("/api/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken })
    });
    console.log(` > Status: ${res.status}`);
    console.log(` > Response có cấp accessToken mới không?: ${!!res.data.accessToken}`);

    // --- TEST 5: Đăng xuất ---
    console.log(`\n[TEST 5] POST /api/v1/auth/logout - Người dùng tự dăng xuất`);
    res = await fetchAPI("/api/v1/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    console.log(` > Status: ${res.status}`);
    console.log(` > Response:`, res.data);

  } catch (err) {
    console.error("[LỖI CHẠY TEST]", err);
  } finally {
    console.log("\n[CLEANUP] Xóa dữ liệu Mock...");
    await User.deleteMany({ email: mockEmail });
    await redisClient.quit();
    await mongoose.connection.close();
    console.log("=== KẾT THÚC KIỂM THỬ ===");
  }
};

startTest();
