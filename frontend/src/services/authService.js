import api from "./api";

export const register = (firstName, lastName, email, password) =>
  api.post("/api/auth/register", { firstName, lastName, email, password }).then((r) => r.data);

export const getMe = () =>
  api.get("/api/auth/me").then((r) => r.data);

export const updateMe = (data) =>
  api.put("/api/auth/me", data).then((r) => r.data);

export const deleteMe = () =>
  api.delete("/api/auth/me");
