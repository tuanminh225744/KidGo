import TripSchedule from '../models/operational/tripSchedule.model.js';
import Subscription from '../models/operational/subscription.model.js';

/**
 * 1. Khởi tạo Lịch trình lặp cố định
 */
export const createTripSchedule = async (scheduleData) => {
    try {
        // Kiểm tra rào cản validation với Gói cước (Subscription)
        if (scheduleData.subscriptionId) {
            const sub = await Subscription.findById(scheduleData.subscriptionId);
            if (!sub) throw new Error('Mã gói dịch vụ thanh toán không hợp lệ.');
            if (sub.status !== 'active') throw new Error(`Không thể móc nối lịch vào gói dịch vụ đang bị ${sub.status}.`);

            const schedStart = new Date(scheduleData.startDate);
            const schedEnd = scheduleData.endDate ? new Date(scheduleData.endDate) : null;

            // Lịch trình phải nằm bên trong Gói cước (Thời hạn Thẻ)
            if (schedStart < sub.startDate) {
                throw new Error('Ngày bắt đầu của lịch trình không được sớm hơn ngày kích hoạt gói cước.');
            }
            if (schedEnd && schedEnd > sub.endDate) {
                throw new Error('Ngày kết thúc của lịch trình đang vượt ra ngoài giới hạn hạn sử dụng của gói cước.');
            }
        }

        const newSchedule = new TripSchedule(scheduleData);
        await newSchedule.save();
        return newSchedule;
    } catch (error) {
        throw new Error(`Lỗi lưu lịch cố định: ${error.message}`);
    }
};

/**
 * 2. Xem chi tiết thông tin Lịch trình 
 */
export const getTripScheduleById = async (scheduleId) => {
    try {
        const schedule = await TripSchedule.findById(scheduleId);
        if (!schedule) throw new Error('Không tìm thấy bản ghi lịch trình.');
        return schedule;
    } catch (error) {
        throw new Error(`Lỗi truy xuất lịch trình: ${error.message}`);
    }
};

/**
 * 3. Chỉnh sửa Lịch trình cố định
 */
export const updateTripSchedule = async (scheduleId, updateData) => {
    try {
        /* Ghi chú Tương lai:
           - Nếu payload mảng `updateData` có chứa `startDate` hoặc `endDate` mới, 
             bạn phải lại query đến Subscription đắp lại luồng kiểm tra logic như hàm số 1 kia
             để nhỡ bệnh nhân cố tình dời lịch ra khỏi ngoài hạn Gói Cước nhé! */

        const updatedSched = await TripSchedule.findByIdAndUpdate(
            scheduleId,
            { $set: updateData },
            { returnDocument: 'after', runValidators: true }
        );
        if (!updatedSched) throw new Error('Căn cứ Lịch trình không tồn tại!');
        return updatedSched;
    } catch (error) {
        throw new Error(`Lỗi cập nhật dữ liệu lịch: ${error.message}`);
    }
};

/**
 * 4. Hủy bỏ Lịch trình (Xóa Mềm - Soft Delete) - Trả kết quả false cho isActive
 */
export const cancelTripSchedule = async (scheduleId) => {
    try {
        const cancelledSched = await TripSchedule.findByIdAndUpdate(
            scheduleId,
            { $set: { isActive: false } },
            { returnDocument: 'after' }
        );
        if (!cancelledSched) throw new Error('Không tra ra lịch trình cần khóa nòng.');
        return cancelledSched;
    } catch (error) {
        throw new Error(`Lỗi hủy lịch trình Database: ${error.message}`);
    }
};
