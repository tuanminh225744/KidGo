import Driver from "../models/core/driver.model.js";
import User from "../models/core/user.model.js";
import redisClient from "../config/redisClient.js";

// CRUD Driver *******************************************************************
/**
 * Create a new driver profile for a user
 * @param {Object} driverData - Contains 'user' (userId) and driver fields
 * @returns {Object} Created driver document
 */
export const createDriver = async (driverData) => {
  try {
    const newDriver = new Driver(driverData);
    await newDriver.save();

    // Also update the User document to hold this driverId
    await User.findByIdAndUpdate(driverData.user, {
      driverId: newDriver._id,
      role: "driver", // Optionally upgrade their role
    });

    return newDriver;
  } catch (error) {
    throw new Error(`Error creating driver: ${error.message}`);
  }
};

/**
 * Get Driver by ID
 * @param {String} driverId
 * @returns {Object} Driver document
 */
export const getDriverById = async (driverId) => {
  try {
    const driver = await Driver.findById(driverId).populate("user");
    if (!driver || !driver.isActive) {
      throw new Error("Driver not found or is inactive");
    }
    return driver;
  } catch (error) {
    throw new Error(`Error fetching driver: ${error.message}`);
  }
};

/**
 * Update Driver details
 * @param {String} driverId
 * @param {Object} updateData
 * @returns {Object} Updated driver document
 */
export const updateDriver = async (driverId, updateData) => {
  try {
    const updatedDriver = await Driver.findByIdAndUpdate(
      driverId,
      { $set: updateData },
      { returnDocument: "after", runValidators: true },
    );
    if (!updatedDriver) {
      throw new Error("Driver not found");
    }
    return updatedDriver;
  } catch (error) {
    throw new Error(`Error updating driver: ${error.message}`);
  }
};

/**
 * Soft delete a driver
 * @param {String} driverId
 * @returns {Object} Soft deleted driver document
 */
export const softDeleteDriver = async (driverId) => {
  try {
    const deletedDriver = await Driver.findByIdAndUpdate(
      driverId,
      { isActive: false },
      { returnDocument: "after" },
    );
    if (!deletedDriver) {
      throw new Error("Driver not found");
    }
    return deletedDriver;
  } catch (error) {
    throw new Error(`Error soft deleting driver: ${error.message}`);
  }
};

// Cập nhật vị trí tài xế, lấy tọa độ tài xế *******************************************************************

/**
 * Lưu tọa độ mới nhận qua Socket trực tiếp vào Redis
 * @param {String} driverId
 * @param {Number} lat
 * @param {Number} lng
 */
export const updateLocationInRedis = async (driverId, lat, lng) => {
  try {
    const geoJsonPoint = {
      type: "Point",
      coordinates: [lng, lat], // GeoJSON chuẩn: [longitude, latitude]
      updatedAt: new Date().toISOString(),
    };

    // 1. Lưu vào hash map để giữ metadata (thời gian update) truy cập O(1)
    await redisClient.hset(
      "driver_locations",
      driverId.toString(),
      JSON.stringify(geoJsonPoint),
    );

    // 2. Lưu vào Redis GEO để phục vụ tìm kiếm bán kính (nearby search) hiệu năng siêu cao
    await redisClient.geoadd(
      "driver_locations_geo",
      lng,
      lat,
      driverId.toString(),
    );

    // 3. Đẩy vào Buffer ngắn hạn (trip_buffer) phục vụ riêng cho Cảnh Sát Bản Đồ (CronJob Monitor) tính toán
    const payloadStr = JSON.stringify({ lat, lng, time: Date.now() });
    await redisClient.lpush(`trip_buffer:${driverId.toString()}`, payloadStr);
    // Cắt ngọn, chỉ xài RAM lưu kho lưu đúng 6 điểm gần nhất (60 giây vòng đời)
    await redisClient.ltrim(`trip_buffer:${driverId.toString()}`, 0, 5);
  } catch (error) {
    console.error(`Lỗi cập nhật Redis cho tài xế ${driverId}:`, error);
  }
};
/**
 * Lấy tọa độ real-time của MỘT tài xế (Dành cho Phụ huynh theo dõi trạng thái chuyến xe đang chạy)
 * @param {String} driverId
 * @returns {Object|null} GeoJSON Point
 */
export const getDriverLocation = async (driverId) => {
  try {
    const dataStr = await redisClient.hget(
      "driver_locations",
      driverId.toString(),
    );
    if (!dataStr) return null;
    return JSON.parse(dataStr);
  } catch (error) {
    console.error(`Lỗi lấy tọa độ tài xế ${driverId}:`, error);
    return null;
  }
};

/**
 * Tìm các tài xế quanh một tọa độ dựa vào Redis GEO
 * @param {Number} lat Vĩ độ tâm
 * @param {Number} lng Kinh độ tâm
 * @param {Number} radius Bán kính
 * @param {String} unit 'm' hoặc 'km'
 * @returns {Array} Danh sách tài xế trong bán kính kèm khoảng cách [[driverId, khoảng cách]]
 */
export const getNearbyDrivers = async (lat, lng, radius = 5, unit = "km") => {
  try {
    const nearby = await redisClient.geosearch(
      "driver_locations_geo",
      "FROMLONLAT",
      lng,
      lat,
      "BYRADIUS",
      radius,
      unit,
      "WITHDIST", // Trả kèm khoảng cách để hiển thị lên app
      "ASC", // Tài xế gần nhất hiện lên đầu
    );
    return nearby;
  } catch (error) {
    console.error("Lỗi tìm tài xế qua Redis GEO:", error);
    return [];
  }
};

/**
 * Lấy danh sách tọa độ mới nhất của tất cả tài xế đang online từ Redis
 */
export const getRealtimeLocations = async () => {
  try {
    const rawData = await redisClient.hgetall("driver_locations");
    const locations = {};
    for (const [driverId, dataStr] of Object.entries(rawData)) {
      locations[driverId] = JSON.parse(dataStr);
    }
    return locations;
  } catch (error) {
    console.error("Lỗi lấy danh sách tọa độ thực:", error);
    return {};
  }
};

/**
 * Gom lại tất cả tọa độ trong Redis và tạo 1 lệnh bulkWrite duy nhất để ghi đè vào MongoDB
 */
export const syncLocationsToDB = async () => {
  try {
    const rawData = await redisClient.hgetall("driver_locations");
    const driverIds = Object.keys(rawData);

    if (driverIds.length === 0) return; // Không có dữ liệu để Update

    const bulkOps = [];
    for (const driverId of driverIds) {
      const geoJsonPoint = JSON.parse(rawData[driverId]);

      const cleanPoint = {
        type: geoJsonPoint.type,
        coordinates: geoJsonPoint.coordinates,
      };

      bulkOps.push({
        updateOne: {
          filter: { _id: driverId },
          update: {
            $set: {
              currentLocation: cleanPoint,
              isOnline: true, // Gửi tọa độ = online
            },
          },
        },
      });
    }

    if (bulkOps.length > 0) {
      const result = await Driver.bulkWrite(bulkOps);
      console.log(
        `[Batch Sync] Đã đồng bộ ${result.modifiedCount} vị trí tài xế từ Redis xuống MongoDB.`,
      );
      // Tùy nhu cầu, chúng ta có thể làm sạch Redis của các Driver đã sync hoặc cứ để đó đè lên bằng tọa độ mới.
      // Do Hash tự động overwrite key cũ nên không bị phình to dữ liệu.
    }
  } catch (error) {
    console.error("[Batch Sync Error] Lỗi đẩy tọa độ từ Redis vào DB:", error);
  }
};
