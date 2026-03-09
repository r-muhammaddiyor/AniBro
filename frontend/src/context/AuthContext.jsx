import { createContext, useEffect, useMemo, useState } from "react";
import api from "../services/api.js";
import { addFavorite, getFavorites, removeFavorite } from "../services/favoriteService.js";
import STORAGE_KEYS from "../utils/storage.js";

export const AuthContext = createContext(null);

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || "null");
  } catch (_error) {
    return null;
  }
};

const getRequestMessage = (error) => {
  const validationMessage = error.response?.data?.errors?.[0]?.message;
  return validationMessage || error.response?.data?.message || "Something went wrong";
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(localStorage.getItem(STORAGE_KEYS.token));
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(localStorage.getItem(STORAGE_KEYS.token)));

  useEffect(() => {
    if (!token) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    const fetchSession = async () => {
      try {
        const { data: profileData } = await api.get("/auth/profile");
        setUser(profileData.user);
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(profileData.user));

        try {
          const favoritesData = await getFavorites();
          setFavorites(favoritesData.items || []);
        } catch (_error) {
          setFavorites([]);
        }
      } catch (_error) {
        localStorage.removeItem(STORAGE_KEYS.token);
        localStorage.removeItem(STORAGE_KEYS.user);
        setToken(null);
        setUser(null);
        setFavorites([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchSession();
  }, [token]);

  const saveSession = (sessionToken, sessionUser) => {
    localStorage.setItem(STORAGE_KEYS.token, sessionToken);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(sessionUser));
    setToken(sessionToken);
    setUser(sessionUser);
  };

  const login = async (payload) => {
    try {
      const { data } = await api.post("/auth/login", payload);
      saveSession(data.token, data.user);
      return data.user;
    } catch (error) {
      throw new Error(getRequestMessage(error));
    }
  };

  const register = async (payload) => {
    const cleanedPayload = {
      username: payload.username?.trim(),
      email: payload.email?.trim(),
      password: payload.password,
      ...(payload.avatarURL ? { avatarURL: payload.avatarURL } : {})
    };

    try {
      const { data } = await api.post("/auth/register", cleanedPayload);
      saveSession(data.token, data.user);
      return data.user;
    } catch (error) {
      const avatarRejected = error.response?.status === 422 && Boolean(cleanedPayload.avatarURL);

      if (!avatarRejected) {
        throw new Error(getRequestMessage(error));
      }

      try {
        const fallbackPayload = {
          username: cleanedPayload.username,
          email: cleanedPayload.email,
          password: cleanedPayload.password
        };
        const { data } = await api.post("/auth/register", fallbackPayload);
        saveSession(data.token, data.user);
        return data.user;
      } catch (fallbackError) {
        throw new Error(getRequestMessage(fallbackError));
      }
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
    setToken(null);
    setUser(null);
    setFavorites([]);
  };

  const updateProfile = async (payload) => {
    try {
      const cleanedPayload = {
        username: payload.username?.trim(),
        email: payload.email?.trim(),
        ...(payload.avatarURL !== undefined ? { avatarURL: payload.avatarURL } : {}),
        ...(payload.password ? { password: payload.password } : {})
      };
      const { data } = await api.put("/auth/profile", cleanedPayload);
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (error) {
      throw new Error(getRequestMessage(error));
    }
  };

  const refreshFavorites = async () => {
    if (!token) {
      setFavorites([]);
      return [];
    }

    const data = await getFavorites();
    setFavorites(data.items || []);
    return data.items || [];
  };

  const toggleFavorite = async (animeId) => {
    const isCurrentlyFavorite = (user?.favoriteAnimeIds || []).includes(animeId);
    const updatedUser = isCurrentlyFavorite ? await removeFavorite(animeId) : await addFavorite(animeId);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updatedUser));
    setUser(updatedUser);
    await refreshFavorites();
    return updatedUser;
  };

  const value = useMemo(
    () => ({
      user,
      token,
      favorites,
      isLoading,
      isAuthenticated: Boolean(user && token),
      isAdmin: user?.role === "admin",
      login,
      register,
      logout,
      updateProfile,
      refreshFavorites,
      toggleFavorite,
      isFavorite: (animeId) => (user?.favoriteAnimeIds || []).includes(animeId)
    }),
    [favorites, isLoading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
