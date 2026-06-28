import api from "../api/axios.js";

export const getCurrentProfile = async () => {
  return api.get("/users/me");
};

export const updateProfile = async (profileData) => {
  return api.put("/users/me", profileData);
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  return api.post("/users/upload-avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
