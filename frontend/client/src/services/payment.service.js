import api from "../api/axios.js";

export const previewPayment = async (data) => {
  return api.post("/payments/preview", data);
};

export const createPayment = async (data) => {
  return api.post("/payments", data);
};

export const getPayment = async (paymentId) => {
  return api.get(`/payments/${paymentId}`);
};

export const updatePaymentStatus = async (paymentId, data) => {
  return api.patch(`/payments/${paymentId}/status`, data);
};
