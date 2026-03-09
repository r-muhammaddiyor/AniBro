import { createContext, useEffect, useMemo, useState } from "react";
import api from "../services/api.js";
import STORAGE_KEYS from "../utils/storage.js";

export const AuthContext = createContext(null);

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || "null");
  } catch (_error) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(localStorage.getItem(STORAGE_KEYS.token));
  const [isLoading, setIsLoading] = useState(Boolean(localStorage.getItem(STORAGE_KEYS.token)));

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/auth/profile");
        setUser(data.user);
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(data.user));
      } catch (_error) {
        localStorage.removeItem(STORAGE_KEYS.token);
        localStorage.removeItem(STORAGE_KEYS.user);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchProfile();
  }, [token]);

  const saveSession = (sessionToken, sessionUser) => {
    localStorage.setItem(STORAGE_KEYS.token, sessionToken);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(sessionUser));
    setToken(sessionToken);
    setUser(sessionUser);
  };

  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    saveSession(data.token, data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    saveSession(data.token, data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (payload) => {
    const { data } = await api.put("/auth/profile", payload);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(user && token),
      isAdmin: user?.role === "admin",
      login,
      register,
      logout,
      updateProfile
    }),
    [isLoading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
