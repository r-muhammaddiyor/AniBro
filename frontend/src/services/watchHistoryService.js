import api from "./api.js";

export const getWatchHistory = async (userId) => {
  const { data } = await api.get(`/watch-history/${userId}`);
  return data.history;
};

export const saveWatchProgress = async (payload) => {
  const { data } = await api.post("/watch-history", payload);
  return data.history;
};
