import Report from "../models/support/report.model.js";
import Trip from "../models/operational/trip.model.js";
import { AppError, AuthorizationError, NotFoundError } from "../utils/AppError.js";

const assertTripAccess = async (tripId, user) => {
  const query = { _id: tripId };
  if (user.role !== "admin") {
    query.parentId = user.id;
  }

  const trip = await Trip.findOne(query).select("_id parentId");
  if (!trip) {
    throw new NotFoundError("Chuyến đi không tồn tại hoặc bạn không có quyền truy cập.");
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

  return report.populate("parentId", "fullName avatar");
};

export const getReportsByTripId = async (tripId, user) => {
  await assertTripAccess(tripId, user);

  const reports = await Report.find({ tripId })
    .sort({ createdAt: -1 })
    .populate("parentId", "fullName avatar");

  return { tripId, reports };
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
  return report;
};
