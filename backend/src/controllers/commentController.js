import { body } from "express-validator";
import Comment from "../models/Comment.js";
import Anime from "../models/Anime.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const commentValidation = [
  body("animeId").isMongoId(),
  body("content").trim().isLength({ min: 2, max: 800 })
];

export const reactionValidation = [
  body("type").isIn(["like", "dislike"])
];

export const getCommentsByAnimeId = asyncHandler(async (request, response) => {
  const comments = await Comment.find({ animeId: request.params.animeId })
    .populate("userId", "username avatarURL role")
    .sort({ createdAt: -1 });

  response.json({ comments });
});

export const createComment = asyncHandler(async (request, response) => {
  const anime = await Anime.findById(request.body.animeId);

  if (!anime) {
    return response.status(404).json({ message: "Anime not found" });
  }

  const comment = await Comment.create({
    animeId: request.body.animeId,
    content: request.body.content,
    userId: request.user._id
  });

  await comment.populate("userId", "username avatarURL role");

  response.status(201).json({ comment });
});

export const reactToComment = asyncHandler(async (request, response) => {
  const comment = await Comment.findById(request.params.id);

  if (!comment) {
    return response.status(404).json({ message: "Comment not found" });
  }

  const userKey = request.user._id.toString();
  const previousReaction = comment.reactions.get(userKey);
  const nextReaction = request.body.type;

  if (previousReaction === "like") {
    comment.likes = Math.max(0, comment.likes - 1);
  }

  if (previousReaction === "dislike") {
    comment.dislikes = Math.max(0, comment.dislikes - 1);
  }

  if (previousReaction === nextReaction) {
    comment.reactions.delete(userKey);
  } else {
    comment.reactions.set(userKey, nextReaction);

    if (nextReaction === "like") {
      comment.likes += 1;
    } else {
      comment.dislikes += 1;
    }
  }

  await comment.save();
  await comment.populate("userId", "username avatarURL role");

  response.json({ comment });
});

export const deleteComment = asyncHandler(async (request, response) => {
  const comment = await Comment.findById(request.params.id);

  if (!comment) {
    return response.status(404).json({ message: "Comment not found" });
  }

  const isOwner = comment.userId.toString() === request.user._id.toString();
  const isAdmin = request.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return response.status(403).json({ message: "Not allowed to delete this comment" });
  }

  await comment.deleteOne();
  response.json({ message: "Comment deleted successfully" });
});
