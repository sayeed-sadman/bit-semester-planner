import { createContext, useContext, useState, useEffect } from "react";
import { setAuthCredentials, clearAuthCredentials } from "../services/api";
import { getMe } from "../services/authService";

const AUTH_STORAGE_KEY = "auth_credentials";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "ADMIN";
  const isStudent = user?.role === "STUDENT";

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) {
      setLoading(false);
      return;
    }
    try {
      const { email, password } = JSON.parse(atob(stored));
      setAuthCredentials(email, password);
      getMe()
        .then((data) => setUser(data))
        .catch(() => localStorage.removeItem(AUTH_STORAGE_KEY))
        .finally(() => setLoading(false));
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setAuthCredentials(email, password);
    try {
      const data = await getMe();
      setUser(data);
      localStorage.setItem(AUTH_STORAGE_KEY, btoa(JSON.stringify({ email, password })));
      return data;
    } catch (err) {
      clearAuthCredentials();
      throw err;
    }
  };

  const logout = () => {
    clearAuthCredentials();
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    window.location.href = "/login";
  };

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  };

  const clearUser = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, isStudent, loading, login, logout, updateUser, clearUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
