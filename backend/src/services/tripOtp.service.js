import redisClient from "../config/redisClient.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Trip from "../models/operational/trip.model.js";

dotenv.config();

/**
 * Sinh mã OTP 6 số ngẫu nhiên
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Sinh mã OTP cho một chuyến đi, băm lại và lưu vào Redis.
 * Trả về OTP gốc (để gửi cho phụ huynh).
 * @param {string} tripId
 * @returns {Promise<string>} Mã OTP chưa bị băm
 */
export const generateTripOtp = async (tripId) => {
  try {
    const otp = generateOTP();

    // Băm OTP để lưu trữ bảo mật trong Redis
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    // Lưu vào Redis với key `tripOtp:${tripId}`, TTL 15 phút (900 giây)
    await redisClient.set(`tripOtp:${tripId}`, hashedOtp, "EX", 900);

    // Lưu ý logic gửi thông báo (Push Notification/SMS) tới phụ huynh sẽ được trigger từ đây

    // Trả về OTP gốc để hệ thống chuyển tiếp cho User
    return otp;
  } catch (error) {
    console.error("Lỗi khi sinh Trip OTP:", error);
    throw new Error("Lỗi hệ thống khi tạo OTP chuyến xe");
  }
};

/**
 * Xác thực mã OTP mà tài xế nhập vào so với trên mạng Redis.
 * Nếu thành công sẽ set otpVerified trên MongoDB = true
 * @param {string} tripId
 * @param {string} inputOtp
 * @returns {Promise<Object>} Trạng thái xác thực
 */
export const verifyTripOtp = async (tripId, inputOtp) => {
  try {
    const storedHashedOtp = await redisClient.get(`tripOtp:${tripId}`);

    if (!storedHashedOtp) {
      return {
        success: false,
        message: "Mã OTP không tồn tại hoặc đã hết hạn (TTL)",
      };
    }

    // Compare bcrypt hash
    const isMatch = await bcrypt.compare(inputOtp.toString(), storedHashedOtp);

    if (isMatch) {
      // Đánh dấu DB status logic
      await Trip.findByIdAndUpdate(
        tripId,
        { otpVerified: true },
        { returnDocument: "after" },
      );

      // Xoá mã khỏi Redis sau khi dùng thành công
      await redisClient.del(`tripOtp:${tripId}`);

      return {
        success: true,
        message: "Xác thực OTP thành công, bắt đầu hành trình",
      };
    } else {
      return { success: false, message: "Mã OTP không chính xác" };
    }
  } catch (error) {
    console.error("Lỗi khi xác thực Trip OTP:", error);
    throw new Error("Lỗi DB/Redis khi check OTP");
  }
};
