import Driver from "../models/core/driver.model.js";
import User from "../models/core/user.model.js";
import Trip from "../models/operational/trip.model.js";
import redisClient from "../config/redisClient.js";
import * as routeService from "./route.service.js";

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

    return { success: true, message: "Driver created", data: newDriver };
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
    return { success: true, message: "Driver fetched", data: driver };
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
    return { success: true, message: "Driver updated", data: updatedDriver };
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
    return {
      success: true,
      message: "Driver soft-deleted",
      data: deletedDriver,
    };
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
 * @param {String} [routeId] optional route id to write waypoint into
 */
export const updateLocationInRedis = async (
  driverId,
  lat,
  lng,
  routeId = null,
) => {
  try {
    const geoJsonPoint = {
      type: "Point",
      coordinates: [lng, lat], // GeoJSON chuẩn: [longitude, latitude]
      updatedAt: new Date().toISOString(),
    };

    // Decide whether to append the latest point to DB every ~30s.
    // IMPORTANT: only consider writing to DB when `routeId` is provided.
    let shouldAppendWaypoint = false;
    if (routeId) {
      try {
        const lastSavedStr = await redisClient.hget(
          "driver_last_db_save",
          driverId.toString(),
        );
        const nowTime = Date.now();
        if (!lastSavedStr) {
          // first time saving to DB for this driver
          shouldAppendWaypoint = true;
        } else {
          const lastSaved = Number(lastSavedStr);
          if (Number.isNaN(lastSaved) || nowTime - lastSaved >= 30 * 1000) {
            shouldAppendWaypoint = true;
          }
        }
      } catch (err) {
        console.error("Error reading driver_last_db_save from Redis:", err);
      }
    } else {
      // No routeId => never write to DB here (only keep Redis buffer)
      shouldAppendWaypoint = false;
    }

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

    // console.log(
    //   `[Redis] Updated location for driver ${driverId}: lat=${lat}, lng=${lng}, shouldAppendWaypoint=${shouldAppendWaypoint}`,
    // );

    // 3. Đẩy vào Buffer ngắn hạn (trip_buffer) phục vụ riêng cho Cảnh Sát Bản Đồ (CronJob Monitor) tính toán
    const payloadStr = JSON.stringify({ lat, lng, time: Date.now() });
    await redisClient.lpush(`trip_buffer:${driverId.toString()}`, payloadStr);
    // Cắt ngọn, chỉ xài RAM lưu kho lưu đúng 6 điểm gần nhất (60 giây vòng đời)
    await redisClient.ltrim(`trip_buffer:${driverId.toString()}`, 0, 5);
    // console.log("[Redis] Lưu địa điểm thành công");

    // Nếu đủ 30s kể từ lần ghi trước, append waypoint vào Route.actualWaypoints
    if (shouldAppendWaypoint) {
      try {
        console.log("[Redis] Lưu waypoint vào route", routeId);
        await routeService.appendActualWaypoint(driverId, lat, lng, routeId);
        // Update last DB save timestamp
        try {
          await redisClient.hset(
            "driver_last_db_save",
            driverId.toString(),
            Date.now().toString(),
          );
        } catch (e) {
          console.error("Error updating driver_last_db_save in Redis:", e);
        }
      } catch (err) {
        console.error("Error appending waypoint to routes:", err);
      }
    }
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
    if (!dataStr) return { success: true, message: "No location", data: null };
    return {
      success: true,
      message: "Driver location fetched",
      data: JSON.parse(dataStr),
    };
  } catch (error) {
    console.error(`Lỗi lấy tọa độ tài xế ${driverId}:`, error);
    return { success: false, message: "Error fetching driver location" };
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
    console.log("da tim thay driver trong pham vi:", nearby);
    return { success: true, message: "Nearby drivers fetched", data: nearby };
  } catch (error) {
    console.error("Lỗi tìm tài xế qua Redis GEO:", error);
    return { success: false, message: "Error fetching nearby drivers" };
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
    return {
      success: true,
      message: "Realtime locations fetched",
      data: locations,
    };
  } catch (error) {
    console.error("Lỗi lấy danh sách tọa độ thực:", error);
    return { success: false, message: "Error fetching realtime locations" };
  }
};

/**
 * Gom lại tất cả tọa độ trong Redis và tạo 1 lệnh bulkWrite duy nhất để ghi đè vào MongoDB
 */
export const syncLocationsToDB = async () => {
  try {
    const rawData = await redisClient.hgetall("driver_locations");
    const driverIds = Object.keys(rawData);

    if (driverIds.length === 0)
      return { success: true, message: "No locations to sync", data: null }; // Không có dữ liệu để Update

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
      // console.log(
      //   `[Batch Sync] Đã đồng bộ ${result.modifiedCount} vị trí tài xế từ Redis xuống MongoDB.`,
      // );
      // Tùy nhu cầu, chúng ta có thể làm sạch Redis của các Driver đã sync hoặc cứ để đó đè lên bằng tọa độ mới.
      // Do Hash tự động overwrite key cũ nên không bị phình to dữ liệu.
    }
  } catch (error) {
    console.error("[Batch Sync Error] Lỗi đẩy tọa độ từ Redis vào DB:", error);
  }
};

/**
 * Lấy driver profile theo userId
 */
export const getDriverByUserId = async (userId) => {
  try {
    const driver = await Driver.findOne({ user: userId }).populate("user");
    if (!driver) {
      throw new Error("Tài xế không tồn tại.");
    }
    return { success: true, message: "Driver fetched by user", data: driver };
  } catch (error) {
    throw new Error(`Lỗi lấy thông tin tài xế: ${error.message}`);
  }
};

// ── Admin Driver Management ─────────────────────────────────────────────────────

/**
 * Danh sách tài xế (filter theo status, phân trang, tìm kiếm)
 */
export const listDriversAdmin = async ({
  status,
  isOnline,
  rideStatus,
  search,
  page = 1,
  limit = 20,
} = {}) => {
  const query = {};
  if (status) query.status = status;
  if (isOnline !== undefined && isOnline !== "") query.isOnline = String(isOnline) === "true";
  if (rideStatus) query.rideStatus = rideStatus;

  const skip = (page - 1) * limit;

  // Nếu search, cần join với User để tìm theo tên/email
  let pipeline = [
    { $match: query },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
  ];

  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { "userInfo.fullName": { $regex: search, $options: "i" } },
          { "userInfo.email": { $regex: search, $options: "i" } },
          { licenseNumber: { $regex: search, $options: "i" } },
        ],
      },
    });
  }

  pipeline.push(
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        total: [{ $count: "count" }],
      },
    },
  );

  const result = await Driver.aggregate(pipeline);
  const drivers = result[0].data;
  const total = result[0].total[0]?.count ?? 0;

  return {
    success: true,
    message: "Drivers listed",
    data: { page, total, totalPages: Math.ceil(total / limit), drivers },
  };
};

/**
 * Chi tiết tài xế theo driverId (admin)
 */
export const getDriverDetailAdmin = async (driverId) => {
  const driver = await Driver.findById(driverId)
    .populate("user", "-password -deviceTokens")
    .populate("vehicles")
    .lean();
  if (!driver) throw new Error("Tài xế không tồn tại.");

  // Fetch active trip if driver is currently on a trip or scheduled
  const activeTrip = await Trip.findOne({
    driverId,
    status: { $in: ["scheduled", "picking_up", "in_progress"] },
  }).sort({ createdAt: -1 });
  
  if (activeTrip) {
    driver.activeTripId = activeTrip._id;
  }

  return { success: true, message: "Driver detail fetched", data: driver };
};

/**
 * Duyệt hồ sơ tài xế
 */
export const approveDriver = async (driverId) => {
  const driver = await Driver.findByIdAndUpdate(
    driverId,
    { status: "active" },
    { new: true },
  );
  if (!driver) throw new Error("Tài xế không tồn tại.");
  return { success: true, message: "Driver approved", data: driver };
};

/**
 * Từ chối hồ sơ tài xế
 */
export const rejectDriver = async (driverId) => {
  const driver = await Driver.findByIdAndUpdate(
    driverId,
    { status: "rejected" },
    { new: true },
  );
  if (!driver) throw new Error("Tài xế không tồn tại.");
  return { success: true, message: "Driver rejected", data: driver };
};

/**
 * Tạm khóa tài xế
 */
export const suspendDriver = async (driverId) => {
  const driver = await Driver.findByIdAndUpdate(
    driverId,
    { status: "suspended", isOnline: false },
    { new: true },
  );
  if (!driver) throw new Error("Tài xế không tồn tại.");
  // Đồng bộ khóa user
  await User.findByIdAndUpdate(driver.user, { isActive: false });
  return { success: true, message: "Driver suspended", data: driver };
};

/**
 * Mở khóa tài xế
 */
export const reactivateDriver = async (driverId) => {
  const driver = await Driver.findByIdAndUpdate(
    driverId,
    { status: "active" },
    { new: true },
  );
  if (!driver) throw new Error("Tài xế không tồn tại.");
  // Đồng bộ mở khóa user
  await User.findByIdAndUpdate(driver.user, { isActive: true });
  return { success: true, message: "Driver reactivated", data: driver };
};

/**
 * Cập nhật cấp chứng nhận tài xế (0-5)
 */
export const updateCertification = async (driverId, certificationLevel) => {
  if (certificationLevel < 0 || certificationLevel > 5) {
    throw new Error("certificationLevel phải từ 0 đến 5.");
  }
  const driver = await Driver.findByIdAndUpdate(
    driverId,
    { certificationLevel },
    { new: true },
  );
  if (!driver) throw new Error("Tài xế không tồn tại.");
  return { success: true, message: "Certification updated", data: driver };
};

/**
 * Lấy vị trí live của một tài xế (từ Redis)
 */
export const getLiveDriverLocation = async (driverId) => {
  const location = await getDriverLocation(driverId);
  return {
    success: true,
    message: "Live driver location",
    data: { driverId, location },
  };
};
