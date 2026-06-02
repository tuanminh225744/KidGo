import api from "../api/axios.js";

export const getCurrentSubscription = async () => {
  return api.get("/subscriptions/me");
};

export const createSubscription = async (data) => {
  return api.post("/subscriptions", data);
};

export const cancelSubscription = async (subId) => {
  return api.patch(`/subscriptions/${subId}/cancel`);
};

export const getSubscriptionUsage = async (subId) => {
  return api.get(`/subscriptions/${subId}/usage`);
};
