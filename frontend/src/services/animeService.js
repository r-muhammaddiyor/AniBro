import api from "./api.js";

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value !== null && value !== undefined)
  );

export const getAnimeList = async (params) => {
  const { data } = await api.get("/anime", { params: cleanParams(params) });
  return data;
};

export const getAnimeById = async (id) => {
  const { data } = await api.get(`/anime/${id}`);
  return data;
};

export const createAnime = async (payload) => {
  const { data } = await api.post("/anime", payload);
  return data.anime;
};

export const updateAnime = async (id, payload) => {
  const { data } = await api.put(`/anime/${id}`, payload);
  return data.anime;
};

export const deleteAnime = async (id) => {
  const { data } = await api.delete(`/anime/${id}`);
  return data;
};
