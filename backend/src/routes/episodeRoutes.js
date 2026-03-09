import { Router } from "express";
import {
  createEpisode,
  deleteEpisode,
  episodeValidation,
  getEpisodesByAnimeId,
  updateEpisode,
  updateEpisodeValidation
} from "../controllers/episodeController.js";
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";

const router = Router();

router.get("/:animeId", getEpisodesByAnimeId);
router.post("/", authenticate, requireAdmin, episodeValidation, validateRequest, createEpisode);
router.put("/:id", authenticate, requireAdmin, updateEpisodeValidation, validateRequest, updateEpisode);
router.delete("/:id", authenticate, requireAdmin, deleteEpisode);

export default router;
