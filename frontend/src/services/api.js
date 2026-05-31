import axios from "axios";

const api = axios.create({
  baseURL: "",
  headers: { "Content-Type": "application/json" },
});

let authCredentials = null;

export const setAuthCredentials = (email, password) => {
  authCredentials = { email, password };
};

export const clearAuthCredentials = () => {
  authCredentials = null;
};

api.interceptors.request.use((config) => {
  if (authCredentials) {
    const encoded = btoa(authCredentials.email + ":" + authCredentials.password);
    config.headers.Authorization = "Basic " + encoded;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthProbe = error.config?.url === "/api/auth/me";
    if (error.response && error.response.status === 401 && !isAuthProbe) {
      clearAuthCredentials();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
