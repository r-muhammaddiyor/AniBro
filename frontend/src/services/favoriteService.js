import api from "./api.js";

export const getFavorites = async () => {
  try {
    const { data } = await api.get("/auth/favorites");
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      return { items: [], favoriteAnimeIds: [] };
    }

    throw error;
  }
};

export const addFavorite = async (animeId) => {
  const { data } = await api.post(`/auth/favorites/${animeId}`);
  return data.user;
};

export const removeFavorite = async (animeId) => {
  const { data } = await api.delete(`/auth/favorites/${animeId}`);
  return data.user;
};
