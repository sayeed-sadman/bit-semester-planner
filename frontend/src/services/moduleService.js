import api from "./api";

export const getAll = (filters = {}) => {
  const params = {};
  if (filters.semester) params.semester = filters.semester;
  if (filters.type) params.type = filters.type;
  return api.get("/api/modules", { params }).then((r) => r.data);
};

export const getById = (id) =>
  api.get(`/api/modules/${id}`).then((r) => r.data);

export const create = (data) =>
  api.post("/api/modules", data).then((r) => r.data);

export const update = (id, data) =>
  api.put(`/api/modules/${id}`, data).then((r) => r.data);

export const deleteModule = (id) =>
  api.delete(`/api/modules/${id}`).then((r) => r.data);
