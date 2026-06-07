import Trip from "../models/operational/trip.model.js";
import Driver from "../models/core/driver.model.js";
import Review from "../models/support/review.model.js";

// ── Dashboard ───────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/dashboard
 * Tổng quan: trips hôm nay, drivers online, active trips
 */
export const getAdminDashboardStats = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const [totalTripsToday, onlineDrivers, activeTrips] = await Promise.all([
    Trip.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } }),
    Driver.countDocuments({ isOnline: true }),
    Trip.countDocuments({ status: { $in: ["picking_up", "in_progress"] } }),
  ]);

  return {
    success: true,
    message: "Dashboard stats fetched",
    data: { totalTripsToday, onlineDrivers, activeTrips, openAlerts: 0 },
  };
};

// ── Reports ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/reports/trips
 * Báo cáo chuyến theo khoảng thời gian
 * Query: startDate, endDate
 */
export const getTripReport = async ({ startDate, endDate } = {}) => {
  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  const matchStage = Object.keys(dateFilter).length
    ? { $match: { createdAt: dateFilter } }
    : { $match: {} };

  const [tripsPerDay, statusBreakdown, totalTrips] = await Promise.all([
    Trip.aggregate([
      matchStage,
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Trip.aggregate([
      matchStage,
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Trip.countDocuments(
      Object.keys(dateFilter).length ? { createdAt: dateFilter } : {},
    ),
  ]);

  return {
    success: true,
    message: "Trip report fetched",
    data: { totalTrips, tripsPerDay, statusBreakdown },
  };
};

/**
 * GET /api/v1/admin/reports/alerts
 * Báo cáo alert rate theo driver (đã ngừng dùng alert model)
 */
export const getAlertReport = async () => {
  const totalTrips = await Trip.countDocuments();
  return {
    success: true,
    message: "Alert report fetched",
    data: {
      totalTrips,
      totalAlerts: 0,
      alertRate: 0,
      alertsByType: [],
      alertRatePerDriver: [],
    },
  };
};

/**
 * GET /api/v1/admin/reports/drivers
 * Xếp hạng tài xế theo rating + số chuyến
 */
export const getDriverRankingReport = async () => {
  const rankings = await Review.aggregate([
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
        driverId: "$_id",
        averageRating: { $round: ["$averageRating", 2] },
        reviewCount: 1,
        totalTrips: "$driverInfo.totalTrips",
        certificationLevel: "$driverInfo.certificationLevel",
        driverName: "$userInfo.fullName",
        licenseNumber: "$driverInfo.licenseNumber",
        status: "$driverInfo.status",
      },
    },
    { $sort: { averageRating: -1, reviewCount: -1 } },
  ]);

  return { success: true, message: "Driver rankings fetched", data: rankings };
};

/**
 * GET /api/v1/admin/reports/export
 * Export tất cả trips ra CSV
 */
export const exportReportCSV = async ({
  type = "trips",
  startDate,
  endDate,
} = {}) => {
  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  if (type === "trips") {
    const matchQuery = Object.keys(dateFilter).length
      ? { createdAt: dateFilter }
      : {};

    const trips = await Trip.find(matchQuery)
      .sort({ createdAt: -1 })
      .populate("routeId")
      .populate("driverId", "licenseNumber")
      .populate("parentId", "fullName email")
      .populate("kidId", "fullName")
      .lean();

    // Tạo nội dung CSV
    const header =
      "tripId,status,parentName,parentEmail,kidName,driverLicense,pickupAddress,dropoffAddress,createdAt\n";
    const rows = trips
      .map((t) =>
        [
          t._id,
          t.status,
          t.parentId?.fullName ?? "",
          t.parentId?.email ?? "",
          t.kidId?.fullName ?? "",
          t.driverId?.licenseNumber ?? "",
          t.routeId?.estimatedPickupAddress ||
            t.routeId?.actualPickupAddress ||
            "",
          t.routeId?.estimatedDropoffAddress ||
            t.routeId?.actualDropoffAddress ||
            "",
          t.createdAt?.toISOString() ?? "",
        ].join(","),
      )
      .join("\n");

    return {
      success: true,
      message: "CSV exported",
      data: { csv: header + rows, filename: `trips_export_${Date.now()}.csv` },
    };
  }

  if (type === "alerts") {
    const header =
      "alertId,type,level,status,driverLicense,parentName,detectedAt,resolvedAt\n";
    return {
      success: true,
      message: "CSV exported",
      data: { csv: header, filename: `alerts_export_${Date.now()}.csv` },
    };
  }

  throw new Error("type phải là 'trips' hoặc 'alerts'.");
};

// Legacy export (giữ lại để không break code cũ)
export const getAdvancedReports = async () => {
  const [tripReport, alertReport, driverRankings] = await Promise.all([
    getTripReport(),
    getAlertReport(),
    getDriverRankingReport(),
  ]);
  return {
    success: true,
    message: "Advanced reports fetched",
    data: { ...tripReport, ...alertReport, driverRankings },
  };
};
