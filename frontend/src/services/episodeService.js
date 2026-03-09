import api from "./api.js";

export const getEpisodesByAnimeId = async (animeId) => {
  const { data } = await api.get(`/episodes/${animeId}`);
  return data.episodes;
};

export const createEpisode = async (payload) => {
  const { data } = await api.post("/episodes", payload);
  return data.episode;
};

export const updateEpisode = async (id, payload) => {
  const { data } = await api.put(`/episodes/${id}`, payload);
  return data.episode;
};

export const deleteEpisode = async (id) => {
  const { data } = await api.delete(`/episodes/${id}`);
  return data;
};
