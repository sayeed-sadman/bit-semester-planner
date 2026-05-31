import api from "./api";

export const getNote = (moduleId) =>
  api.get(`/api/notes/${moduleId}`).then((r) => r.data);

export const saveNote = (moduleId, content) =>
  api.post(`/api/notes/${moduleId}`, { content }).then((r) => r.data);

export const deleteNote = (moduleId) =>
  api.delete(`/api/notes/${moduleId}`).then((r) => r.data);
