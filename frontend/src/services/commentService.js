import api from "./api.js";

export const getCommentsByAnimeId = async (animeId) => {
  const { data } = await api.get(`/comments/${animeId}`);
  return data.comments;
};

export const createComment = async (payload) => {
  const { data } = await api.post("/comments", payload);
  return data.comment;
};

export const reactToComment = async (id, type) => {
  const { data } = await api.post(`/comments/${id}/reaction`, { type });
  return data.comment;
};

export const deleteComment = async (id) => {
  const { data } = await api.delete(`/comments/${id}`);
  return data;
};
