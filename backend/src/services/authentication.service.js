import nodemailer from 'nodemailer';
import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

console.log(process.env.EMAIL_USER);
console.log(process.env.EMAIL_PASS);

// Cấu hình Redis (sử dụng biến môi trường hoặc mặc định cục bộ)
const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Cấu hình Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', // Có thể thay đổi theo nhà cung cấp bạn dùng (VD: Outlook, Yahoo, etc.)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
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
        await redisClient.set(`otp:${email}`, otp, 'EX', 300);

        // Cấu hình nội dung email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Mã xác nhận OTP của bạn',
            text: `Chào bạn,\n\nMã xác nhận OTP của bạn là: ${otp}\n\nMã này sẽ hết hạn trong vòng 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.\n\nTrân trọng,`
        };

        // Gửi email
        const info = await transporter.sendMail(mailOptions);

        return {
            success: true,
            message: 'OTP đã được gửi thành công',
            messageId: info.messageId
        };
    } catch (error) {
        console.error('Lỗi khi gửi OTP:', error);
        throw new Error('Không thể gửi mã OTP lúc này');
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
            return { success: false, message: 'Mã OTP không tồn tại hoặc đã hết hạn' };
        }

        // So sánh OTP nhập vào với OTP trong hệ thống
        if (storedOTP === otpCode.toString()) {
            // Xác thực thành công: Xóa OTP để tránh việc sử dụng lại
            await redisClient.del(`otp:${email}`);
            return { success: true, message: 'Xác nhận OTP thành công' };
        } else {
            return { success: false, message: 'Mã OTP không chính xác' };
        }
    } catch (error) {
        console.error('Lỗi khi xác nhận OTP:', error);
        throw new Error('Lỗi hệ thống khi xác thực OTP');
    }
};
