import api from "../api/axios.js";

export const getActiveTripsList = async () => {
  return api.get("/trips/active");
};
