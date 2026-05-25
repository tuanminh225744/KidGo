import api from "../api/axios.js";

export const createRoute = async (routeData) => {
  return api.post("/routes", routeData);
};

export const getRoutesByParent = async () => {
  return api.get("/routes");
};

export const getRouteById = async (routeId) => {
  return api.get(`/routes/${routeId}`);
};
