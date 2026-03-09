import api from "./api.js";
import STORAGE_KEYS from "../utils/storage.js";

const readGuestHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.guestHistory) || "[]");
  } catch (_error) {
    return [];
  }
};

const writeGuestHistory = (history) => {
  localStorage.setItem(STORAGE_KEYS.guestHistory, JSON.stringify(history.slice(0, 20)));
};

export const getWatchHistory = async (userId) => {
  const { data } = await api.get(`/watch-history/${userId}`);
  return data.history;
};

export const getGuestWatchHistory = () => readGuestHistory();

export const getGuestAnimeProgress = (animeId) => readGuestHistory().find((item) => item.animeId === animeId) || null;

export const saveGuestWatchProgress = (payload) => {
  const history = readGuestHistory().filter((item) => item.episodeId !== payload.episodeId && item.animeId !== payload.animeId);

  history.unshift({
    ...payload,
    updatedAt: new Date().toISOString()
  });

  writeGuestHistory(history);
  return history[0];
};

export const saveWatchProgress = async (payload) => {
  const { data } = await api.post("/watch-history", payload);
  return data.history;
};
