import { Router } from "express";
import {
  getProfile,
  login,
  loginValidation,
  register,
  registerValidation,
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

export default router;
