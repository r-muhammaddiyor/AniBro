import User from "../models/User.js";
import Anime from "../models/Anime.js";
import Episode from "../models/Episode.js";
import Comment from "../models/Comment.js";
import WatchHistory from "../models/WatchHistory.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const getAdminStats = asyncHandler(async (_request, response) => {
  const [users, anime, episodes, comments, activeWatchers] = await Promise.all([
    User.countDocuments(),
    Anime.countDocuments(),
    Episode.countDocuments(),
    Comment.countDocuments(),
    WatchHistory.distinct("userId")
  ]);

  response.json({
    stats: {
      users,
      anime,
      episodes,
      comments,
      activeWatchers: activeWatchers.length
    }
  });
});

export const getUsers = asyncHandler(async (_request, response) => {
  const users = await User.find().select("-passwordHash").sort({ createdAt: -1 });
  response.json({ users });
});

export const toggleUserBan = asyncHandler(async (request, response) => {
  const user = await User.findById(request.params.id).select("-passwordHash");

  if (!user) {
    return response.status(404).json({ message: "User not found" });
  }

  user.isBanned = !user.isBanned;
  await user.save();

  response.json({ user });
});

export const deleteCommentAsAdmin = asyncHandler(async (request, response) => {
  const comment = await Comment.findById(request.params.id);

  if (!comment) {
    return response.status(404).json({ message: "Comment not found" });
  }

  await comment.deleteOne();
  response.json({ message: "Comment deleted successfully" });
});
