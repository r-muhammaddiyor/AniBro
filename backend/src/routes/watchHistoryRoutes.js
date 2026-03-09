import { Router } from "express";
import {
  getWatchHistoryByUserId,
  saveWatchHistory,
  watchHistoryValidation
} from "../controllers/watchHistoryController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";

const router = Router();

router.get("/:userId", authenticate, getWatchHistoryByUserId);
router.post("/", authenticate, watchHistoryValidation, validateRequest, saveWatchHistory);

export default router;
