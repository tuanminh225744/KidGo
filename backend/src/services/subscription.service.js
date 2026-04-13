import Subscription from '../models/operational/subscription.model.js';

/**
 * 1. Đăng ký Tạo gói cước mới (Khi phụ huynh mua gói)
 */
export const createSubscription = async (data) => {
    try {
        const newSub = new Subscription(data);
        await newSub.save();
        return newSub;
    } catch (error) {
        throw new Error(`Lỗi tạo gói dịch vụ: ${error.message}`);
    }
};

/**
 * 2. Lấy thông tin Gói cước theo ID để hiển thị giao diện
 */
export const getSubscriptionById = async (subId) => {
    try {
        const sub = await Subscription.findById(subId);
        if (!sub) throw new Error('Không tìm thấy thông tin gói dịch vụ này.');
        return sub;
    } catch (error) {
        throw new Error(`Lỗi tra cứu gói: ${error.message}`);
    }
};

/**
 * 3. Chỉnh sửa thông tin / Gia hạn gói cước
 */
export const updateSubscription = async (subId, updateData) => {
    try {
        const updatedSub = await Subscription.findByIdAndUpdate(
            subId,
            { $set: updateData },
            { returnDocument: 'after', runValidators: true }
        );
        if (!updatedSub) throw new Error('Gói dịch vụ không tồn tại.');
        return updatedSub;
    } catch (error) {
        throw new Error(`Lỗi chỉnh sửa gói dịch vụ: ${error.message}`);
    }
};
