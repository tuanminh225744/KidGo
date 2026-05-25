import api from "../api/axios.js";

export const getKidsByParent = async () => {
  return api.get("/kids");
};

export const createKid = async (kidData) => {
  return api.post("/kids", kidData);
};

export const getKidById = async (kidId) => {
  return api.get(`/kids/${kidId}`);
};

export const updateKid = async (kidId, updateData) => {
  return api.put(`/kids/${kidId}`, updateData);
};

export const deleteKid = async (kidId) => {
  return api.delete(`/kids/${kidId}`);
};

export const setupSecurityQuestion = async (kidId, question, answer) => {
  return api.put(`/kids/${kidId}/security-question`, {
    securityQuestion: question,
    securityAnswer: answer,
  });
};

export const getKidSecurityQuestion = async (kidId) => {
  return api.get(`/kids/${kidId}/security-question`);
};

export const verifySecurityAnswer = async (kidId, answer) => {
  return api.post(`/kids/${kidId}/security-answer/verify`, {
    securityAnswer: answer,
  });
};

export const uploadKidAvatar = async (kidId, file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  return api.post(`/kids/${kidId}/upload-avatar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
