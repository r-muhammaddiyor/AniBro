import api from "./api.js";

export const getProfile = async () => {
  const { data } = await api.get("/auth/profile");
  return data.user;
};
