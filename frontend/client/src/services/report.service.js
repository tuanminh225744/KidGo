import api from "../api/axios.js";

export const createReport = async (data) => {
  return api.post("/reports", data);
};

export const getReportsByTripId = async (tripId) => {
  return api.get(`/reports/trip/${tripId}`);
};

export const adminReply = async (reportId, payload) => {
  return api.post(`/reports/${reportId}/reply`, payload);
};

export const getReportsByParent = async () => {
  return api.get("/reports/me");
};
