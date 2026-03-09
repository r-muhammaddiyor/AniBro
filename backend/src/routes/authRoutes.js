import { Router } from "express";
import {
  addFavorite,
  getFavorites,
  getProfile,
  login,
  loginValidation,
  register,
  registerValidation,
  removeFavorite,
  updateProfile,
  updateProfileValidation
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";

const router = Router();

router.post("/register", registerValidation, validateRequest, register);
router.post("/login", loginValidation, validateRequest, login);
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfileValidation, validateRequest, updateProfile);
router.get("/favorites", authenticate, getFavorites);
router.post("/favorites/:animeId", authenticate, addFavorite);
router.delete("/favorites/:animeId", authenticate, removeFavorite);

export default router;
