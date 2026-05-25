import api from "../api/axios.js";

export const getParentAlerts = async (params = {}) => {
  return api.get("/alerts", { params });
};
