import api from "../api/axios.js";

export const getCurrentProfile = async () => {
  return api.get("/users/me");
};
