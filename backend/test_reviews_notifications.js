import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

// Cấu hình Dotenv
dotenv.config();

// Các cấu hình
const SERVER_URL = `http://localhost:${process.env.PORT || 5000}`;
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || "abcasfnasoifjbcwb837f91bdfc";

// IDs giả lập
const DUMMY_PARENT_ID = new mongoose.Types.ObjectId().toString();
const DUMMY_DRIVER_ID = new mongoose.Types.ObjectId().toString();
const DUMMY_ADMIN_ID = new mongoose.Types.ObjectId().toString();
const DUMMY_TRIP_ID = new mongoose.Types.ObjectId().toString();

// Hàm tạo JWT token giả lập để test
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
};

// Hàm chạy fetch
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

// Quá trình Test
const startTest = async () => {
  console.log("=== BẮT ĐẦU CHẠY KIỂM THỬ API ===\n");

  // Kết nối DB (để tạo mock)
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("[DB] Đã kết nối với MongoDB");
  } catch (err) {
    console.error("[DB] Không thể kết nối MongoDB:", err);
    return;
  }

  // 1. Tạo dữ liệu Mock (Users & Trip) trực tiếp vào DB
  const User = mongoose.model("User", new mongoose.Schema({ phone: String, email: String, password: String, fullName: String, role: String }, { strict: false }));
  const Trip = mongoose.model("Trip", new mongoose.Schema({ bookingId: mongoose.Schema.Types.ObjectId, driverId: mongoose.Schema.Types.ObjectId, kidId: mongoose.Schema.Types.ObjectId, parentId: mongoose.Schema.Types.ObjectId, vehicleId: mongoose.Schema.Types.ObjectId, status: String }, { strict: false }));

  console.log("\n[SETUP] Tạo dữ liệu mock cho Test...");
  const mockParent = await User.create({ _id: DUMMY_PARENT_ID, email: "parent_test@gmail.com", phone: "0999999999", password: "mock", fullName: "Phụ Huynh Test", role: "parent" });
  const mockAdmin = await User.create({ _id: DUMMY_ADMIN_ID, email: "admin_test@gmail.com", phone: "0888888888", password: "mock", fullName: "Admin Test", role: "admin" });
  
  // Trip của parent này
  const mockTrip = await Trip.create({ 
    _id: DUMMY_TRIP_ID, 
    parentId: DUMMY_PARENT_ID, 
    driverId: DUMMY_DRIVER_ID,
    kidId: new mongoose.Types.ObjectId(),
    bookingId: new mongoose.Types.ObjectId(),
    vehicleId: new mongoose.Types.ObjectId(),
    status: "completed" 
  });
  
  // Token
  const parentToken = generateToken(DUMMY_PARENT_ID, "parent");
  const adminToken = generateToken(DUMMY_ADMIN_ID, "admin");

  try {
    // --- BÀI TEST 1: Phụ huynh đánh giá tài xế ---
    console.log("\n[TEST 1] POST /reviews - Tạo đánh giá mới (Mã Parent)");
    let res = await fetchAPI("/reviews", {
      method: "POST",
      headers: { Authorization: `Bearer ${parentToken}` },
      body: JSON.stringify({
        tripId: DUMMY_TRIP_ID,
        rating: 5,
        comment: "Tài xế lái xe rất an toàn, đúng giờ!",
        tags: ["safe_driving", "punctual"]
      })
    });
    console.log(` > Status: ${res.status}`);
    console.log(` > Response:`, res.data);

    // --- BÀI TEST 2: Phụ huynh sửa đánh giá tài xế ---
    console.log("\n[TEST 2] POST /reviews - Sửa đánh giá (Mã Parent)");
    res = await fetchAPI("/reviews", {
      method: "POST",
      headers: { Authorization: `Bearer ${parentToken}` },
      body: JSON.stringify({
        tripId: DUMMY_TRIP_ID,
        rating: 4,
        comment: "Sửa lại comment: Tài xế ổn.",
        tags: ["safe_driving"]
      })
    });
    console.log(` > Status: ${res.status}`);
    console.log(` > Response:`, res.data);

    // --- BÀI TEST 3: Đánh giá bằng 1 Trip không tồn tại ---
    console.log("\n[TEST 3] POST /reviews - Lỗi khi đánh giá trip lạ");
    const fakeTripId = new mongoose.Types.ObjectId().toString();
    res = await fetchAPI("/reviews", {
        method: "POST",
        headers: { Authorization: `Bearer ${parentToken}` },
        body: JSON.stringify({ tripId: fakeTripId, rating: 5 })
    });
    console.log(` > Status: ${res.status}`);
    console.log(` > Response:`, res.data);

    // --- BÀI TEST 4: Admin tạo thông báo hệ thống ---
    console.log("\n[TEST 4] POST /notifications - Hệ thống/Admin tạo thông báo");
    res = await fetchAPI("/notifications", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        recipientId: DUMMY_PARENT_ID,
        recipientType: "parent",
        type: "system_alert",
        title: "Cập nhật ứng dụng KidGo",
        body: "Ứng dụng KidGo có phiên bản mới, vui lòng cập nhật.",
        channel: "push"
      })
    });
    console.log(` > Status: ${res.status}`);
    console.log(` > Response:`, res.data);

    // --- BÀI TEST 5: Phụ huynh lấy danh sách thông báo ---
    console.log("\n[TEST 5] GET /notifications - Phụ Huynh lấy thông báo (Chỉ của họ)");
    res = await fetchAPI("/notifications", {
      method: "GET",
      headers: { Authorization: `Bearer ${parentToken}` }
    });
    console.log(` > Status: ${res.status}`);
    console.log(` > Thông báo lấy được: ${res.data.count} (Kỳ vọng: >0)`);
    console.log(` > Dữ liệu mẫu:`, res.data.data ? res.data.data[0] : null);

    // --- BÀI TEST 6: Admin lấy danh sách tất cả thông báo ---
    console.log("\n[TEST 6] GET /notifications - Admin lấy tất cả thông báo (Mọi người)");
    res = await fetchAPI("/notifications", {
      method: "GET",
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(` > Status: ${res.status}`);
    console.log(` > Tổng thông báo lấy được: ${res.data.count}`);

  } catch (err) {
    console.error("[LỖI CHẠY TEST]", err);
  } finally {
    // Dọn dẹp Mock User & Trip
    console.log("\n[CLEANUP] Xóa dữ liệu Mock...");
    await User.deleteMany({ _id: { $in: [DUMMY_PARENT_ID, DUMMY_ADMIN_ID] } });
    await Trip.deleteMany({ _id: DUMMY_TRIP_ID });
    const Review = mongoose.model("Review", new mongoose.Schema({}, { strict: false }));
    await Review.deleteMany({ parentId: DUMMY_PARENT_ID });
    const Notification = mongoose.model("Notification", new mongoose.Schema({}, { strict: false }));
    await Notification.deleteMany({ recipientId: DUMMY_PARENT_ID, title: "Cập nhật ứng dụng KidGo" });

    // Đóng DB
    await mongoose.connection.close();
    console.log("=== KẾT THÚC KIỂM THỬ ===");
    process.exit(0); // Exit process
  }
};

startTest();
