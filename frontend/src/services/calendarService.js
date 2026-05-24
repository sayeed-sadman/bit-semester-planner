import api from "./api";

export const getCalendars = () =>
  api.get("/api/calendars").then((r) => r.data);

export const addCalendar = (icsUrl, displayName) =>
  api.post("/api/calendars", { icsURL: icsUrl, displayName }).then((r) => r.data);

export const deleteCalendar = (id) =>
  api.delete(`/api/calendars/${id}`).then((r) => r.data);

export const getEvents = (id) =>
  api.get(`/api/calendars/${id}/events`).then((r) => r.data);

export const getAllEvents = (weekStart, weekEnd) => {
  const params = new URLSearchParams();
  if (weekStart) params.set("weekStart", weekStart);
  if (weekEnd)   params.set("weekEnd",   weekEnd);
  const qs = params.toString();
  return api.get(`/api/calendars/events/all${qs ? `?${qs}` : ""}`).then((r) => r.data);
};
