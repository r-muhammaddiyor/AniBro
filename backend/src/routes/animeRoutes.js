import { Router } from "express";
import {
  animeQueryValidation,
  animeUpdateValidation,
  animeValidation,
  createAnime,
  deleteAnime,
  getAnimeById,
  getAnimeList,
  updateAnime
} from "../controllers/animeController.js";
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import optionalAuth from "../utils/optionalAuth.js";

const router = Router();

router.get("/", animeQueryValidation, validateRequest, getAnimeList);
router.get("/:id", optionalAuth, getAnimeById);
router.post("/", authenticate, requireAdmin, animeValidation, validateRequest, createAnime);
router.put("/:id", authenticate, requireAdmin, animeUpdateValidation, validateRequest, updateAnime);
router.delete("/:id", authenticate, requireAdmin, deleteAnime);

export default router;
