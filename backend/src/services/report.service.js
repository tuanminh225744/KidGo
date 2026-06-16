import Report from "../models/support/report.model.js";
import Trip from "../models/operational/trip.model.js";
import { getIo } from "../sockets/socketManager.js";
import * as notificationService from "./notification.service.js";
import User from "../models/core/user.model.js";
import {
  AppError,
  AuthorizationError,
  NotFoundError,
} from "../utils/AppError.js";

const assertTripAccess = async (tripId, user) => {
  const query = { _id: tripId };
  if (user.role !== "admin") {
    query.parentId = user.id;
  }

  const trip = await Trip.findOne(query).select("_id parentId");
  if (!trip) {
    throw new NotFoundError(
      "Chuyến đi không tồn tại hoặc bạn không có quyền truy cập.",
    );
  }

  return trip;
};

export const createReport = async (parentId, data) => {
  const { tripId, title, content } = data || {};

  if (!tripId || !title || !content) {
    throw new AppError("Thiếu tripId, title hoặc content.", 400);
  }

  const trip = await Trip.findOne({ _id: tripId, parentId }).select("_id");
  if (!trip) {
    throw new NotFoundError("Chuyến đi không tồn tại hoặc không thuộc về bạn.");
  }

  const report = await Report.create({
    tripId,
    title: title.trim(),
    content: content.trim(),
    parentId,
    status: "PENDING",
  });
  const populated = await report.populate("parentId", "fullName avatar");

  try {
    const io = getIo();
    // Emit to admin namespace so admin UI can receive new report notifications
    if (io) {
      io.of("/admin").emit("new_report", { report: populated });
    }

    // Persist a notification for admins (recipientType=admin).
    // Resolve the admin user id (system has a single admin account) and set as recipientId.
    const getAdminId = async () => {
      const admin = await User.findOne({ role: "admin" }).select("_id");
      return admin ? admin._id : null;
    };

    const adminId = await getAdminId();
    if (adminId) {
      await notificationService.createNotification({
        recipientId: adminId,
        recipientType: "admin",
        type: "report_created",
        title: "Có report mới",
        body: `${title.trim()} - ${content.trim().slice(0, 200)}`,
        tripId,
        isRead: false,
      });
    } else {
      console.warn("No admin user found — skipping admin notification save.");
    }
  } catch (err) {
    // non-fatal: don't block report creation if socket/notification fails
    console.warn("Failed to emit/save report notification:", err.message);
  }
  return { success: true, message: "Report created", data: populated };
};

export const adminReply = async (reportId, adminId, answer) => {
  const report = await Report.findById(reportId);
  if (!report) {
    throw new NotFoundError("Report không tồn tại.");
  }

  report.adminAnswer = (answer || "").trim();
  report.status = "RESOLVED";
  await report.save();
  const populated = await report.populate("parentId", "fullName avatar");

  try {
    const io = getIo();
    if (io) {
      // Notify the parent who created the report
      io.of("/parent").to(report.parentId.toString()).emit("report_answered", {
        title: "Report đã được phản hồi",
        message: report.adminAnswer,
        reportId: report._id,
        tripId: report.tripId,
      });
    }

    // Save notification for parent
    await notificationService.createNotification({
      recipientId: report.parentId,
      recipientType: "parent",
      type: "report_reply",
      title: "Phản hồi từ Admin",
      body: report.adminAnswer || "Admin đã trả lời report của bạn.",
      tripId: report.tripId,
      isRead: false,
    });
  } catch (err) {
    console.warn("Failed to emit/save admin reply notification:", err.message);
  }

  return { success: true, message: "Reply saved", data: populated };
};

export const getReportsByTripId = async (tripId, user) => {
  await assertTripAccess(tripId, user);

  const reports = await Report.find({ tripId })
    .sort({ createdAt: -1 })
    .populate("parentId", "fullName avatar");
  return {
    success: true,
    message: "Reports fetched",
    data: { tripId, reports },
  };
};

export const getReportsByParentId = async (parentId) => {
  const reports = await Report.find({ parentId })
    .sort({ createdAt: -1 })
    .populate("tripId");
  return {
    success: true,
    message: "Reports fetched",
    data: { reports },
  };
};

export const deleteReport = async (reportId, user) => {
  const report = await Report.findById(reportId);
  if (!report) {
    throw new NotFoundError("Report không tồn tại.");
  }

  if (
    user.role !== "admin" &&
    report.parentId.toString() !== user.id.toString()
  ) {
    throw new AuthorizationError("Bạn không có quyền xóa report này.");
  }

  await report.deleteOne();
  return { success: true, message: "Report deleted", data: report };
};
