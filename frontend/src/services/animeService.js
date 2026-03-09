import api from "./api.js";

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value !== null && value !== undefined)
  );

export const getAnimeList = async (params) => {
  const { data } = await api.get("/anime", { params: cleanParams(params) });
  return data;
};

export const getAnimeAutocomplete = async (query) => {
  try {
    const { data } = await api.get("/anime/autocomplete", {
      params: cleanParams({ q: query })
    });
    return data.items;
  } catch (error) {
    if (error.response?.status === 404) {
      return [];
    }

    throw error;
  }
};

export const getAnimeRecommendations = async (id) => {
  try {
    const { data } = await api.get(`/anime/${id}/recommendations`);
    return data.items;
  } catch (error) {
    if (error.response?.status === 404) {
      return [];
    }

    throw error;
  }
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
