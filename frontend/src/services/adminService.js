import api from "./api.js";

export const getAdminStats = async () => {
  const { data } = await api.get("/admin/stats");
  return data.stats;
};

export const getAdminUsers = async () => {
  const { data } = await api.get("/admin/users");
  return data.users;
};

export const toggleUserBan = async (id) => {
  const { data } = await api.put(`/admin/users/${id}/ban`);
  return data.user;
};

export const deleteCommentAsAdmin = async (id) => {
  const { data } = await api.delete(`/admin/comments/${id}`);
  return data;
};
