import PreferredDriver from "../models/support/preferredDriver.model.js";
import Driver from "../models/core/driver.model.js";
import User from "../models/core/user.model.js";


// Giới hạn tối đa theo spec
const MAX_PREFERRED_DRIVERS = 20;

/**
 * Lấy danh sách tài xế ưu tiên của phụ huynh kèm trạng thái Online/Free realtime
 * @param {String} parentId
 * @returns {Promise<Object>} Danh sách PreferredDriver kèm isOnline, isFree
 */
export const getPreferredDrivers = async (parentId) => {
  try {
    const list = await PreferredDriver.find({ parentId })
      .sort({ priority: 1, addedAt: -1 })
      .populate({
        path: "driverId",
        select: "user isOnline rideStatus rating totalTrips",
        populate: {
          path: "user",
          select: "fullName phone avatar",
        },
      });

    // Gắn thêm trạng thái realtime cho từng tài xế
    const enriched = list.map((item) => {
      const driver = item.driverId;
      const isOnline = driver?.isOnline === true;
      const isFree = driver?.rideStatus === "free";

      return {
        _id: item._id,
        driverId: driver?._id,
        nickname: item.nickname,
        priority: item.priority,
        addedAt: item.addedAt,
        driver: {
          fullName: driver?.user?.fullName,
          phone: driver?.user?.phone,
          avatar: driver?.user?.avatar,
          rating: driver?.rating,
          totalTrips: driver?.totalTrips,
        },
        // Chỉ available = true khi Online VÀ Free (không có chuyến)
        isAvailable: isOnline && isFree,
        isOnline,
        isFree,
      };
    });

    return {
      success: true,
      message: "Preferred drivers fetched",
      data: enriched,
    };
  } catch (error) {
    console.error("Lỗi khi tải danh sách tài xế ưu tiên:", error);
    throw new Error("Lỗi hệ thống khi lấy danh sách tài xế ưu tiên");
  }
};

/**
 * Thêm một tài xế vào danh sách ưu tiên của phụ huynh
 * Hỗ trợ thêm qua driverId (sau chuyến đi) HOẶC qua số điện thoại tài xế
 * @param {Object} data { parentId, driverId?, phone?, nickname?, priority? }
 * @returns {Promise<Object>} Bản ghi PreferredDriver vừa tạo
 */
export const addPreferredDriver = async ({
  parentId,
  driverId,
  phone,
  nickname,
  priority = 1,
}) => {
  try {
    // Kiểm tra phụ huynh tồn tại
    const parent = await User.findById(parentId);
    if (!parent || !parent.isActive) {
      throw new Error(
        "Phụ huynh không tồn tại hoặc tài khoản đã bị vô hiệu hóa."
      );
    }

    let driver;

    if (phone) {
      // Cách 2: Tìm tài xế qua số điện thoại
      const driverUser = await User.findOne({ phone, role: "driver" });
      if (!driverUser) {
        throw new Error(
          "Không tìm thấy tài xế với số điện thoại này."
        );
      }
      driver = await Driver.findOne({ user: driverUser._id });
    } else if (driverId) {
      // Cách 1: Tìm tài xế qua driverId trực tiếp
      driver = await Driver.findById(driverId);
    } else {
      throw new Error("Phải cung cấp driverId hoặc phone của tài xế.");
    }

    if (!driver || !driver.isActive) {
      throw new Error("Tài xế không tồn tại hoặc không còn hoạt động.");
    }

    // Kiểm tra giới hạn 20 tài xế (theo spec)
    const count = await PreferredDriver.countDocuments({ parentId });
    if (count >= MAX_PREFERRED_DRIVERS) {
      throw new Error(
        `Bạn đã đạt giới hạn tối đa ${MAX_PREFERRED_DRIVERS} tài xế ưu tiên. Vui lòng xóa bớt để thêm mới.`
      );
    }

    // Kiểm tra xem đã được thêm trước đó chưa
    const existing = await PreferredDriver.findOne({
      parentId,
      driverId: driver._id,
    });
    if (existing) {
      throw new Error("Tài xế này đã có trong danh sách ưu tiên của bạn.");
    }

    const newPreferredDriver = new PreferredDriver({
      parentId,
      driverId: driver._id,
      nickname,
      priority,
    });

    await newPreferredDriver.save();

    return {
      success: true,
      message: "Thêm tài xế vào danh sách ưu tiên thành công.",
      data: newPreferredDriver,
    };
  } catch (error) {
    console.error("Lỗi khi thêm tài xế ưu tiên:", error);
    throw new Error(error.message || "Lỗi hệ thống khi thêm tài xế ưu tiên");
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
    const result = await PreferredDriver.findOneAndDelete({
      parentId,
      driverId,
    });
    if (!result) {
      throw new Error("Tài xế này không nằm trong danh sách ưu tiên của bạn.");
    }
    return {
      success: true,
      message: "Đã xóa tài xế khỏi danh sách ưu tiên thành công.",
      data: null,
    };
  } catch (error) {
    console.error("Lỗi khi xóa tài xế ưu tiên:", error);
    throw new Error(error.message || "Lỗi hệ thống khi xóa tài xế ưu tiên");
  }
};

/**
 * Cập nhật nickname và priority của tài xế ưu tiên
 * @param {String} parentId
 * @param {String} driverId
 * @param {Object} updateData { nickname?, priority? }
 * @returns {Promise<Object>} Updated PreferredDriver
 */
export const updatePreferredDriver = async (parentId, driverId, updateData) => {
  try {
    const updated = await PreferredDriver.findOneAndUpdate(
      { parentId, driverId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate({
      path: "driverId",
      select: "user isOnline rideStatus rating",
      populate: {
        path: "user",
        select: "fullName phone avatar",
      },
    });

    if (!updated) {
      throw new Error("Tài xế này không nằm trong danh sách ưu tiên của bạn.");
    }

    return {
      success: true,
      message: "Cập nhật tài xế ưu tiên thành công.",
      data: updated,
    };
  } catch (error) {
    console.error("Lỗi khi cập nhật tài xế ưu tiên:", error);
    throw new Error(
      error.message || "Lỗi hệ thống khi cập nhật tài xế ưu tiên"
    );
  }
};
