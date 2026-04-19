import Trip from "../models/operational/trip.model.js";
import Driver from "../models/core/driver.model.js";
import Alert from "../models/safetyAndLogs/alert.model.js";
import Review from "../models/support/review.model.js";

export const getAdminDashboardStats = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // 1. Tổng số trip hôm nay
  const totalTripsToday = await Trip.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  // 2. Driver đang online
  const onlineDrivers = await Driver.countDocuments({ isOnline: true });

  // 3. Các Alert đang mở (Tình trạng chua giải quyết)
  const openAlerts = await Alert.countDocuments({ status: "open" });

  return {
    totalTripsToday,
    onlineDrivers,
    openAlerts,
  };
};

export const getAdvancedReports = async () => {
  // 1. Số chuyến theo ngày
  const tripsPerDay = await Trip.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // 2. Tổng số alert & Alert rate
  const totalTrips = await Trip.countDocuments();
  const totalAlerts = await Alert.countDocuments();
  const alertRate = totalTrips > 0 ? totalAlerts / totalTrips : 0;

  // 3. Rating trung bình tổng
  const overallRatingAggr = await Review.aggregate([
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
      },
    },
  ]);
  const overallAverageRating = overallRatingAggr.length > 0 ? overallRatingAggr[0].averageRating : 0;

  // 4. Rating trung bình cho từng tài xế
  const driverRatings = await Review.aggregate([
    {
      $group: {
        _id: "$driverId",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "drivers",
        localField: "_id",
        foreignField: "_id",
        as: "driverInfo",
      },
    },
    { $unwind: { path: "$driverInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "driverInfo.user",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        averageRating: 1,
        reviewCount: 1,
        driverName: "$userInfo.fullName",
        driverEmail: "$userInfo.email",
      },
    },
  ]);

  return {
    tripsPerDay,
    totalAlerts,
    totalTrips,
    alertRate,
    overallAverageRating,
    driverRatings,
  };
};

