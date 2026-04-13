import cron from 'node-cron';
import TripSchedule from '../models/operational/tripSchedule.model.js';
import Booking from '../models/operational/booking.model.js';
import { createBooking } from '../services/booking.service.js';

/**
 * Cỗ máy Quét Rada tự động đánh thức các Lịch Trình để biến thành Cuốc xe (Booking)
 */
export const startScheduleScanner = () => {
    // Lead time: Bọn mình đã chốt là Đánh thức trước 20 phút
    const LEAD_TIME_MINUTES = 20;

    // Chu kỳ: Cứ mỗi 1 phút hàm này lại tự động kích hoạt ngầm
    cron.schedule('* * * * *', async () => {
        try {
            // Bước 1: Suy ra thời điểm cần đón theo độ trễ
            const targetMoment = new Date(Date.now() + LEAD_TIME_MINUTES * 60 * 1000);

            // Format ra chuỗi thời gian chuẩn "HH:mm" trong Database (VD: 07:30)
            const hh = String(targetMoment.getHours()).padStart(2, '0');
            const mm = String(targetMoment.getMinutes()).padStart(2, '0');
            const targetTimeStr = `${hh}:${mm}`;

            const todayDayOfWeek = targetMoment.getDay(); // 0(CN) - 6(T7)
            const todayStart = new Date(targetMoment.getFullYear(), targetMoment.getMonth(), targetMoment.getDate());
            const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

            // Bước 2: Truy tìm các Lịch đang sống có Điểm Hẹn đúng bằng TargetTime
            const activeSchedules = await TripSchedule.find({
                isActive: true,
                pickupTime: targetTimeStr,
                // Rào cản gói vụ: Ngày quét phải đè nát bét nằm gọn trong Gói Cước
                startDate: { $lte: targetMoment },
                $or: [
                    { endDate: null },
                    { endDate: { $gte: targetMoment } }
                ]
            });

            // Bước 3: Phân tích từng hồ sơ cá nhân
            for (const schedule of activeSchedules) {

                // Lọc ngày thứ: Có phải hôm nay em bé đi học không?
                if (schedule.repeatDays && schedule.repeatDays.length > 0) {
                    if (!schedule.repeatDays.includes(todayDayOfWeek)) continue; // Hôm nay được nghỉ, bỏ lặp
                }

                // Chống Trượt/Đúp (Idempotency): Hôm nay Lịch này đã được ông Cronjob nào quét chưa?
                const existingBooking = await Booking.findOne({
                    scheduleId: schedule._id,
                    scheduledTime: { $gte: todayStart, $lt: todayEnd }
                });

                if (!existingBooking) {
                    // Bước 4: Chuyển sinh Lịch Trình thành một bảng Yêu Cầu Booking thực thụ
                    const bookingData = {
                        parentId: schedule.parentId,
                        kidId: schedule.kidId,
                        routeId: schedule.routeId,
                        scheduleId: schedule._id,
                        preferredDriverId: schedule.preferredDriverId,
                        scheduledTime: targetMoment,
                        type: 'recurring' // Nhãn hiệu lặp vòng mưu tả
                    };

                    // Nổ lệnh Booking (Bên dưới tự động Ping tín hiệu gọi Driver tới vớt)
                    await createBooking(bookingData);
                    console.log(`[CronJob - Máy Quét Lịch] 🕒 Bầu trời đã hé sáng. Tạo thành công cuốc gọi xe lặp vòng cho Lịch ${schedule._id}. Xe rước lúc ${targetTimeStr}.`);
                }
            }

        } catch (err) {
            console.error('[CronJob Error] Cỗ máy quét Lịch có vấn đề kỹ thuật:', err);
        }
    });

    console.log(`Khởi động thành công Vệ tinh Quét Lịch Trình Tự Động (Khoảng trễ: ${LEAD_TIME_MINUTES} phút).`);
};
