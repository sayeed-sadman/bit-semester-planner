import api from "./api";

export const getPlanner = () =>
  api.get("/api/planner").then((r) => r.data);

export const addModule = (moduleId) =>
  api.post(`/api/planner/${moduleId}`).then((r) => r.data);

export const removeModule = (moduleId) =>
  api.delete(`/api/planner/${moduleId}`).then((r) => r.data);

export const getStatus = (moduleId) =>
  api.get(`/api/planner/${moduleId}/status`).then((r) => r.data);
