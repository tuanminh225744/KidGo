import PreferredDriver from '../models/support/preferredDriver.model.js';
import Driver from '../models/core/driver.model.js';
import User from '../models/core/user.model.js';

/**
 * Thêm một tài xế vào danh sách ưu tiên của phụ huynh
 * @param {Object} data Tham số { parentId, driverId, nickname, priority }
 * @returns {Promise<Object>} Bản ghi PreferredDriver vừa tạo
 */
export const addPreferredDriver = async ({ parentId, driverId, nickname, priority = 1 }) => {
    try {
        // Kiểm tra xem User parent có tồn tại không
        const parent = await User.findById(parentId);
        if (!parent || !parent.isActive) {
            throw new Error('Phụ huynh không tồn tại hoặc tài khoản đã bị vô hiệu hóa.');
        }

        // Kiểm tra xem Driver có tồn tại không
        const driver = await Driver.findById(driverId);
        if (!driver || !driver.isActive) {
            throw new Error('Tài xế không tồn tại hoặc không còn hoạt động.');
        }

        // Kiểm tra xem đã được thêm trước đó chưa
        const existing = await PreferredDriver.findOne({ parentId, driverId });
        if (existing) {
            throw new Error('Tài xế này đã có trong danh sách ưu tiên của bạn.');
        }

        const newPreferredDriver = new PreferredDriver({
            parentId,
            driverId,
            nickname,
            priority
        });

        await newPreferredDriver.save();
        return newPreferredDriver;
    } catch (error) {
        console.error('Lỗi khi thêm tài xế ưu tiên:', error);
        throw new Error(error.message || 'Lỗi hệ thống khi thêm tài xế ưu tiên');
    }
};

/**
 * Lấy danh sách tài xế ưu tiên của phụ huynh
 * @param {String} parentId 
 * @returns {Promise<Array>} Danh sách các PreferredDriver details
 */
export const getPreferredDrivers = async (parentId) => {
     try {
        const list = await PreferredDriver.find({ parentId })
            .sort({ priority: 1, addedAt: -1 })
            .populate({
                path: 'driverId',
                populate: {
                    path: 'user', // Populate luôn thông tin User của tài xế đó (để lấy tên, sđt)
                    select: 'fullName phone email avatar'
                }
            });
        return list;
     } catch (error) {
         console.error('Lỗi khi tải danh sách tài xế ưu tiên:', error);
         throw new Error('Lỗi hệ thống khi lấy danh sách tài xế ưu tiên');
     }
};

/**
 * Gỡ bỏ một tài xế khỏi danh sách ưu tiên
 * @param {String} parentId 
 * @param {String} driverId 
 * @returns {Promise<Object>} Status object
 */
export const removePreferredDriver = async (parentId, driverId) => {
    try {
        const result = await PreferredDriver.findOneAndDelete({ parentId, driverId });
        if (!result) {
            throw new Error('Tài xế này không nằm trong danh sách ưu tiên của bạn.');
        }
        return { success: true, message: 'Đã xóa tài xế khỏi danh sách ưu tiên thành công' };
    } catch (error) {
        console.error('Lỗi khi xóa tài xế ưu tiên:', error);
        throw new Error(error.message || 'Lỗi hệ thống khi xóa tài xế ưu tiên');
    }
};
