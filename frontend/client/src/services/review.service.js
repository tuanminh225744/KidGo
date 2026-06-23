import api from "../api/axios.js";

export const createReview = async (data) => {
  return api.post("/reviews", data);
};
