import Booking from '../models/operational/booking.model.js';
import Trip from '../models/operational/trip.model.js';
import Route from '../models/operational/route.model.js';
import Driver from '../models/core/driver.model.js';
import { getIo } from '../sockets/socketManager.js';
import { getNearbyDrivers } from './driver.service.js';

// Memory Object lưu trữ luồng hệ thống để có thể ngắt bất kì lúc nào
const activeBookingTimers = {};

/**
 * Xóa toàn bộ các Timer đếm giờ của một booking
 */
const clearBookingTimer = (bookingId) => {
    if (activeBookingTimers[bookingId]) {
        activeBookingTimers[bookingId].forEach(timer => clearTimeout(timer));
        delete activeBookingTimers[bookingId];
    }
};

/**
 * Ngắt kèo tự động do Timeout 5 phút
 */
const triggerTimeoutCancel = async (bookingId) => {
    try {
        const booking = await Booking.findById(bookingId);
        if (booking && booking.status === 'pending') {
            booking.status = 'cancelled';
            booking.assignedDriverId = null;
            await booking.save();

            const io = getIo();
            // Bắn cho phụ huynh dể họ tìm cuốc mới
            io.of('/parent').to(booking.parentId.toString()).emit('pairing_timeout', {
                message: 'Vượt quá 5 phút chờ. Rất tiếc không có tài xế rảnh nào tiếp nhận yêu cầu, hệ thống đã hủy ghép xe.',
                bookingId: booking._id
            });
            console.log(`[Timer] Booking ${bookingId} cancelled due to 5 mins timeout.`);
        }
    } catch (e) {
        console.error('Lỗi timeout booking ngầm:', e);
    } finally {
        clearBookingTimer(bookingId);
    }
};

/**
 * Lọc mảng Redis trả về để kiếm xem ông xế nào thực sự Rảnh rang
 */
const filterFreeDrivers = async (nearbyDriverIdArray) => {
    if (!nearbyDriverIdArray || nearbyDriverIdArray.length === 0) return [];

    // nearbyDriverIdArray: [["id1", "0.5"], ["id2", "1.2"]] 
    const ids = nearbyDriverIdArray.map(item => item[0]);

    const freeDrivers = await Driver.find({
        _id: { $in: ids },
        isOnline: true,
        rideStatus: 'free' // CHỈ bắt xế free
    }).select('_id');

    return freeDrivers.map(d => d._id.toString());
};

/**
 * Cơ chế Dò sóng: Vệt dầu loang 0'(2km) -> 1'(5km) -> 2'(10km) -> 5'(Timeout)
 */
const startGenericMatchingCycle = async (bookingId, lat, lng) => {
    activeBookingTimers[bookingId] = [];

    const sweepFn = async (radius) => {
        const checkBooking = await Booking.findById(bookingId);
        if (!checkBooking || checkBooking.status !== 'pending') return;

        const rawNearby = await getNearbyDrivers(lat, lng, radius, 'km');
        const freeDriverIds = await filterFreeDrivers(rawNearby);

        const io = getIo();
        if (freeDriverIds.length > 0) {
            freeDriverIds.forEach(driverId => {
                io.of('/driver').to(driverId).emit('new_booking_available', {
                    message: `Có 1 cuốc đón vé trong bán kính ${radius}km`,
                    bookingId: bookingId
                });
            });
            console.log(`[Match Cycle] Booking ${bookingId} quét ${radius}km -> Ping ${freeDriverIds.length} tài xế rảnh.`);
        }
    };

    // Vừa vào nổ cú sóng đầu tiên
    sweepFn(2);

    // Kế hoạch nổ sóng tương lai
    const t1 = setTimeout(() => sweepFn(5), 60 * 1000);
    const t2 = setTimeout(() => sweepFn(10), 120 * 1000);
    const tFail = setTimeout(() => triggerTimeoutCancel(bookingId), 300 * 1000);

    activeBookingTimers[bookingId].push(t1, t2, tFail);
};

export const createBooking = async (bookingData) => {
    try {
        const booking = new Booking({
            ...bookingData,
            status: 'pending' // Chuyến mới luôn ở trạng thái chờ
        });
        await booking.save();

        const io = getIo();

        if (booking.preferredDriverId) {
            // Push đích danh cho tài xế VIP
            io.of('/driver').to(booking.preferredDriverId.toString()).emit('booking_assigned', {
                message: 'Bạn nhận được 1 cuốc xe từ danh sách ưu tiên của phụ huynh!',
                bookingId: booking._id
            });

            // Thiết lập Timeout 5 phút cho Xế ưu tiên
            activeBookingTimers[booking._id] = [
                setTimeout(() => triggerTimeoutCancel(booking._id), 300 * 1000)
            ];
        } else {
            // Lấy tọa độ điểm đón từ Route để tiến hành dô sóng
            const route = await Route.findById(booking.routeId);
            if (!route || !route.pickupCoords || !route.pickupCoords.coordinates) {
                throw new Error("Không đủ tọa độ để khởi động Rada dò tìm cuốc (Route ID thiếu/sai).");
            }

            const [lng, lat] = route.pickupCoords.coordinates;
            // Tiến hành mở máy dò
            await startGenericMatchingCycle(booking._id, lat, lng);
        }

        return booking;
    } catch (error) {
        throw new Error(`Lỗi tạo booking: ${error.message}`);
    }
};

export const editBooking = async (bookingId, parentId, updateData) => {
    try {
        const booking = await Booking.findOne({ _id: bookingId, parentId });
        if (!booking) throw new Error('Không tìm thấy booking hoặc bạn không có quyền sửa.');

        if (['confirmed', 'cancelled'].includes(booking.status)) {
            throw new Error(`Không thể chỉnh sửa chuyến đi vì trạng thái đã là ${booking.status}.`);
        }

        Object.assign(booking, updateData);
        await booking.save();

        const io = getIo();

        io.of('/parent').to(parentId.toString()).emit('booking_updated', {
            message: 'Lịch trình chuyến đi đã được bạn cập nhật thành công.',
            bookingId: booking._id
        });

        if (booking.assignedDriverId) {
            io.of('/driver').to(booking.assignedDriverId.toString()).emit('booking_updated', {
                message: 'Phụ huynh vừa thay đổi thông tin địa điểm hay giờ đi, hãy kiểm tra lại!',
                bookingId: booking._id
            });
        }

        return booking;
    } catch (error) {
        throw new Error(`Lỗi sửa booking: ${error.message}`);
    }
};

export const parentCancelBooking = async (bookingId, parentId) => {
    try {
        const booking = await Booking.findOneAndUpdate(
            { _id: bookingId, parentId },
            { status: 'cancelled' },
            { returnDocument: 'after' }
        );

        if (!booking) throw new Error('Hủy thất bại. Booking không tồn tại.');

        // Xóa Timer quét xe trên bầu trời nếu phụ huynh nhột hủy ngang
        clearBookingTimer(booking._id);

        const io = getIo();
        if (booking.assignedDriverId) {
            // Báo sang máy ông xế biết đường mà về
            io.of('/driver').to(booking.assignedDriverId.toString()).emit('booking_cancelled_by_parent', {
                message: 'Phụ huynh đã hủy chuyến xe. Cuốc xe này tự động vô hiệu lực.',
                bookingId: booking._id
            });
            // Update lại status ông xế là rảnh rang
            await Driver.findByIdAndUpdate(booking.assignedDriverId, { rideStatus: 'free' });
        }

        return booking;
    } catch (error) {
        throw new Error(`Lỗi hủy booking: ${error.message}`);
    }
};

export const driverAcceptBooking = async (bookingId, driverId) => {
    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) throw new Error('Không có booking này.');
        if (booking.status !== 'pending') throw new Error(`Cuốc xe đang ${booking.status}. Bàn tay của bạn chậm quá rồi!`);

        booking.assignedDriverId = driverId;
        booking.status = 'matched';
        await booking.save();

        // Xóa ngầm Timer gợn sóng hay Timeout 5 phút vì xe đã có chủ chốt
        clearBookingTimer(booking._id);

        // Khóa trạng thái tài xế lên "Đang chờ đón khách" tránh để bị push spam
        await Driver.findByIdAndUpdate(driverId, { rideStatus: 'waiting_for_kid' });

        const io = getIo();
        io.of('/parent').to(booking.parentId.toString()).emit('driver_accepted_booking', {
            title: 'Tuyệt quá',
            message: 'Đã có tài xế nhận đón vé yêu của bạn. Nhấn để xem định vị của chiếc xe!',
            driverId: driverId,
            bookingId: booking._id
        });

        return booking;
    } catch (error) {
        throw new Error(`Lỗi tài xế nhận chuyến: ${error.message}`);
    }
};

export const driverCancelBooking = async (bookingId, driverId) => {
    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) throw new Error('Không thể hủy lệnh đón không tồn tại.');

        booking.status = 'cancelled';
        booking.assignedDriverId = null;
        await booking.save();

        // Xóa Timer bận của bộ nhớ
        clearBookingTimer(booking._id);

        // Trục xuất ông xế lên trạng thái Rảnh Free để còn kiếm cuốc khác
        await Driver.findByIdAndUpdate(driverId, { rideStatus: 'free' });

        const io = getIo();
        io.of('/parent').to(booking.parentId.toString()).emit('driver_rejected_booking', {
            title: 'Tài xế hủy chuyến',
            message: 'Tài xế có thể đã gặp trục trặc và vừa hủy lệnh đón bé. Vui lòng thao tác book một chuyến mới ngay nhé!',
            bookingId: booking._id
        });

        return booking;
    } catch (error) {
        throw new Error(`Lỗi tài xế hủy cuộc: ${error.message}`);
    }
};
