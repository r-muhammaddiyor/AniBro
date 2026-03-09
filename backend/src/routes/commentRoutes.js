import { Router } from "express";
import {
  commentValidation,
  createComment,
  deleteComment,
  getCommentsByAnimeId,
  reactToComment,
  reactionValidation
} from "../controllers/commentController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";

const router = Router();

router.get("/:animeId", getCommentsByAnimeId);
router.post("/", authenticate, commentValidation, validateRequest, createComment);
router.post("/:id/reaction", authenticate, reactionValidation, validateRequest, reactToComment);
router.delete("/:id", authenticate, deleteComment);

export default router;
