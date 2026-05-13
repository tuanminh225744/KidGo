import api from "../api/axios.js";

const handleResponse = async (promise) => {
  try {
    const { data } = await promise;
    return data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Đã có lỗi xảy ra khi gọi API",
    };
  }
};

export const getKidsByParent = async () => {
  return handleResponse(api.get("/kids"));
};

export const createKid = async (kidData) => {
  return handleResponse(api.post("/kids", kidData));
};

export const getKidById = async (kidId) => {
  return handleResponse(api.get(`/kids/${kidId}`));
};

export const updateKid = async (kidId, updateData) => {
  return handleResponse(api.put(`/kids/${kidId}`, updateData));
};

export const deleteKid = async (kidId) => {
  return handleResponse(api.delete(`/kids/${kidId}`));
};

export const setupSecurityQuestion = async (kidId, question, answer) => {
  return handleResponse(
    api.put(`/kids/${kidId}/security-question`, {
      securityQuestion: question,
      securityAnswer: answer,
    }),
  );
};

export const getKidSecurityQuestion = async (kidId) => {
  return handleResponse(api.get(`/kids/${kidId}/security-question`));
};

export const verifySecurityAnswer = async (kidId, answer) => {
  return handleResponse(
    api.post(`/kids/${kidId}/security-answer/verify`, {
      securityAnswer: answer,
    }),
  );
};

export const uploadKidAvatar = async (kidId, file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  return handleResponse(
    api.post(`/kids/${kidId}/upload-avatar`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  );
};
