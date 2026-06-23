import nodemailer from "nodemailer";
import redisClient from "../config/redisClient.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/core/user.model.js";
import Driver from "../models/core/driver.model.js";
import Vehicle from "../models/core/vehicle.model.js";
dotenv.config();

// Gửi, xác nhận OTP **************************************************************************

// Cấu hình Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail", // Có thể thay đổi theo nhà cung cấp bạn dùng (VD: Outlook, Yahoo, etc.)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Hàm sinh mã OTP 6 chữ số ngẫu nhiên
 */
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Gửi OTP tới email người dùng và lưu vào Redis
 * @param {string} email - Địa chỉ email của người dùng
 * @returns {Promise<Object>}
 */
export const sendOTP = async (email) => {
  try {
    const otp = generateOTP();

    // Lưu OTP vào Redis với tiền tố 'otp:', thời gian sống (TTL) là 300 giây (5 phút)
    await redisClient.set(`otp:${email}`, otp, "EX", 300);

    // Cấu hình nội dung email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Mã xác nhận OTP của bạn",
      text: `Chào bạn,\n\nMã xác nhận OTP của bạn là: ${otp}\n\nMã này sẽ hết hạn trong vòng 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.\n\nTrân trọng,`,
    };

    // Gửi email
    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: "OTP đã được gửi thành công",
      data: { messageId: info.messageId },
    };
  } catch (error) {
    console.error("Lỗi khi gửi OTP:", error);
    throw new Error("Không thể gửi mã OTP lúc này");
  }
};

/**
 * Xác nhận mã OTP do người dùng nhập vào
 * @param {string} email - Địa chỉ email của người dùng
 * @param {string} otpCode - Mã OTP người dùng nhập
 * @returns {Promise<Object>}
 */
export const verifyOTP = async (email, otpCode) => {
  try {
    // Lấy OTP đã lưu từ Redis
    const storedOTP = await redisClient.get(`otp:${email}`);

    // Kiểm tra xem OTP có tồn tại (hoặc đã hết hạn) không
    if (!storedOTP) {
      return {
        success: false,
        message: "Mã OTP không tồn tại hoặc đã hết hạn",
        data: null,
      };
    }

    // So sánh OTP nhập vào với OTP trong hệ thống
    if (storedOTP === otpCode.toString()) {
      // Xác thực thành công: Xóa OTP để tránh việc sử dụng lại
      await redisClient.del(`otp:${email}`);
      return { success: true, message: "Xác nhận OTP thành công", data: null };
    } else {
      return { success: false, message: "Mã OTP không chính xác", data: null };
    }
  } catch (error) {
    console.error("Lỗi khi xác nhận OTP:", error);
    throw new Error("Lỗi hệ thống khi xác thực OTP");
  }
};

// Đăng ký, đăng nhập, quên mật khẩu **************************************************************************

// Constants for token config
const ACCESS_TOKEN_SECRET =
  process.env.JWT_ACCESS_SECRET || "secret-access-token";
const REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_SECRET || "secret-refresh-token";
const ACCESS_TOKEN_EXP = process.env.JWT_ACCESS_EXP || "1h";
const REFRESH_TOKEN_EXP = process.env.JWT_REFRESH_EXP || "7d";
const REFRESH_TOKEN_TTL_REDIS = 7 * 24 * 60 * 60;

/**
 * Hàm tạo token
 */
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXP,
  });
  const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXP,
  });
  return { accessToken, refreshToken };
};

/**
 * Đăng ký tài khoản
 */
export const register = async (userData) => {
  try {
    const { phone, email, fullName, password, role } = userData;

    // Check user exists
    const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
    if (existingUser) {
      return { success: false, message: "Email hoặc số điện thoại đã tồn tại" };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      phone,
      email,
      fullName,
      password: hashedPassword,
      role: role || "parent",
    });

    await newUser.save();
    return {
      success: true,
      message: "Đăng ký thành công",
      data: { user: newUser },
    };
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error);
    throw new Error("Đăng ký không thành công");
  }
};

/**
 * Đăng ký tài xế
 * Tạo đồng thời User + Driver + Vehicle từ payload frontend register driver
 */
export const registerDriver = async (payload) => {
  const {
    email,
    phone,
    fullName,
    password,
    licenseNumber,
    licenseExpiry,
    licensePlate,
    brand,
    model,
    color,
    seatCount,
    inspectionExpiry,
  } = payload;

  const session = await User.startSession();
  try {
    let result = null;

    await session.withTransaction(async () => {
      const existingUser = await User.findOne({
        $or: [{ phone }, { email }],
      }).session(session);
      if (existingUser) {
        throw new Error("Email hoặc số điện thoại đã tồn tại");
      }

      const duplicateDriver = await Driver.findOne({ licenseNumber }).session(
        session,
      );
      if (duplicateDriver) {
        throw new Error("Số GPLX đã tồn tại");
      }

      const duplicateVehicle = await Vehicle.findOne({ licensePlate }).session(
        session,
      );
      if (duplicateVehicle) {
        throw new Error("Biển số xe đã tồn tại");
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const [newUser] = await User.create(
        [
          {
            phone,
            email,
            fullName,
            password: hashedPassword,
            role: "driver",
            isVerified: false,
          },
        ],
        { session },
      );

      const vehicleData = {
        licensePlate,
        brand,
        model,
        color,
        seatCount: seatCount ? Number(seatCount) : undefined,
        inspectionExpiry: inspectionExpiry
          ? new Date(inspectionExpiry)
          : undefined,
      };

      const [newVehicle] = await Vehicle.create([vehicleData], { session });

      const [newDriver] = await Driver.create(
        [
          {
            user: newUser._id,
            licenseNumber,
            licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : undefined,
            status: "pending",
            vehicleId: newVehicle._id,
          },
        ],
        { session },
      );

      result = {
        success: true,
        message: "Đăng ký tài xế thành công. Hồ sơ đang chờ duyệt.",
        data: {
          user: {
            _id: newUser._id,
            email: newUser.email,
            phone: newUser.phone,
            fullName: newUser.fullName,
            role: newUser.role,
          },
          driver: newDriver,
          vehicle: newVehicle,
        },
      };
    });

    return result;
  } catch (error) {
    console.error("Lỗi khi đăng ký tài xế:", error);
    return {
      success: false,
      message: error.message || "Đăng ký tài xế không thành công",
      data: null,
    };
  } finally {
    session.endSession();
  }
};

/**
 * Đăng nhập
 */
export const login = async (email, password) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return { success: false, message: "Email hoặc mật khẩu không chính xác" };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { success: false, message: "Email hoặc mật khẩu không chính xác" };
    }

    if (!user.isVerified) {
      return {
        success: false,
        message:
          "Tài khoản chưa được xác thực. Vui lòng xác thực email bằng mã OTP.",
      };
    }

    if (!user.isActive) {
      return {
        success: false,
        message:
          "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản lý.",
      };
    }

    // Driver accounts must also have an active driver profile
    if (user.role === "driver") {
      const driver = await Driver.findOne({ user: user._id }).select("status");

      if (!driver) {
        return {
          success: false,
          message: "Không tìm thấy hồ sơ tài xế. Vui lòng liên hệ quản lý.",
        };
      }

      if (driver.status !== "active") {
        return {
          success: false,
          message: "Tài khoản tài xế chưa được kích hoạt hoặc đã bị từ chối.",
        };
      }
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Store refresh token in redis
    await redisClient.set(
      `refreshToken:${user._id.toString()}`,
      refreshToken,
      "EX",
      REFRESH_TOKEN_TTL_REDIS,
    );

    return {
      success: true,
      message: "Đăng nhập thành công",
      data: {
        accessToken,
        refreshToken,
        user: {
          _id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      },
    };
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    throw new Error("Lỗi hệ thống khi đăng nhập");
  }
};

/**
 * Cấp lại token
 */
export const refreshAccessToken = async (refreshToken) => {
  try {
    if (!refreshToken) {
      return {
        success: false,
        message: "Không cung cấp refresh token",
        data: null,
      };
    }

    // Verify token format/signature
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    } catch (err) {
      return {
        success: false,
        message: "Refresh token không hợp lệ hoặc đã hết hạn",
        data: null,
      };
    }

    const userId = decoded.userId;

    // Verify with redis
    const storedToken = await redisClient.get(`refreshToken:${userId}`);
    if (!storedToken || storedToken !== refreshToken) {
      return {
        success: false,
        message: "Refresh token đã bị thu hồi hoặc không chính xác",
        data: null,
      };
    }

    // Generate new pair
    const newTokens = generateTokens(userId);

    // Store new refresh token in Redis
    await redisClient.set(
      `refreshToken:${userId}`,
      newTokens.refreshToken,
      "EX",
      REFRESH_TOKEN_TTL_REDIS,
    );

    return {
      success: true,
      message: "Cấp token thành công",
      data: {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
      },
    };
  } catch (error) {
    console.error("Lỗi khi cấp lại token:", error);
    throw new Error("Lỗi hệ thống khi cấp lại token");
  }
};

/**
 * Yêu cầu đặt lại mật khẩu bằng cách gửi OTP qua email
 */
export const forgotPassword = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Prevent info leaking by doing a pseudo-success or actual false.
      return {
        success: false,
        message: "Không tìm thấy người dùng với email này",
        data: null,
      };
    }

    // Use existing sendOTP function
    const result = await sendOTP(email);
    return result;
  } catch (error) {
    console.error("Lỗi forgot password:", error);
    throw new Error("Không thể gửi yêu cầu đặt lại mật khẩu");
  }
};

/**
 * Đặt lại mật khẩu với OTP
 */
export const resetPassword = async (email, otpCode, newPassword) => {
  try {
    // Verify OTP
    const otpResult = await verifyOTP(email, otpCode);
    if (!otpResult.success) {
      return otpResult;
    }

    const user = await User.findOne({ email });
    if (!user) {
      return {
        success: false,
        message: "Người dùng không tồn tại",
        data: null,
      };
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Optional: revoke all current refresh tokens in redis
    await redisClient.del(`refreshToken:${user._id.toString()}`);

    return {
      success: true,
      message: "Đặt lại mật khẩu thành công",
      data: null,
    };
  } catch (error) {
    console.error("Lỗi đặt lại mật khẩu:", error);
    throw new Error("Lỗi hệ thống khi đặt lại mật khẩu");
  }
};

/**
 * Đăng xuất
 * Xóa refresh token khỏi Redis
 */
export const logout = async (userId) => {
  try {
    if (!userId) {
      return {
        success: false,
        message: "Không thể xác định người dùng",
        data: null,
      };
    }
    await redisClient.del(`refreshToken:${userId}`);
    return { success: true, message: "Đăng xuất thành công", data: null };
  } catch (error) {
    console.error("Lỗi khi đăng xuất:", error);
    throw new Error("Lỗi hệ thống khi đăng xuất");
  }
};

/**
 * Xác nhận OTP và trả JWT (Dành cho việc user nhập mã OTP thành công)
 * Ngoài ra đổi trạng thái isVerified của User sang true nếu chưa
 */
export const verifyOTPAndLogin = async (email, otpCode) => {
  try {
    // 1. Kiểm tra OTP
    const otpResult = await verifyOTP(email, otpCode);
    if (!otpResult.success) {
      return otpResult;
    }

    // 2. Lấy thông tin user
    const user = await User.findOne({ email });
    if (!user) {
      return {
        success: false,
        message: "Người dùng không tồn tại. Vui lòng đăng ký trước.",
        data: null,
      };
    }

    // 3. Nếu user chưa verify, chuyển thành verified
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    // 4. Sinh JWT và lưu refresh token
    const { accessToken, refreshToken } = generateTokens(user._id);
    await redisClient.set(
      `refreshToken:${user._id.toString()}`,
      refreshToken,
      "EX",
      REFRESH_TOKEN_TTL_REDIS,
    );

    return {
      success: true,
      message: "Xác thực OTP và đăng nhập thành công",
      data: {
        accessToken,
        refreshToken,
        user: {
          _id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
    };
  } catch (error) {
    console.error("Lỗi khi xác thực OTP và login:", error);
    throw new Error("Lỗi hệ thống khi cấp token");
  }
};
