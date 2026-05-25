import api from "../api/axios.js";

export const getParentAlerts = async (params = {}) => {
  return api.get("/alerts", { params });
};

export const getAlertDetail = async (alertId) => {
  return api.get(`/alerts/${alertId}`);
};

export const acknowledgeAlert = async (alertId) => {
  return api.patch(`/alerts/${alertId}/acknowledge`);
};

export const resolveAlert = async (alertId, resolutionData) => {
  return api.patch(`/alerts/${alertId}/resolve`, resolutionData);
};

export const escalateAlert = async (alertId) => {
  return api.patch(`/alerts/${alertId}/escalate`);
};
