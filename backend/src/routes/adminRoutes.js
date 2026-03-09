import { Router } from "express";
import {
  deleteCommentAsAdmin,
  getAdminStats,
  getUsers,
  toggleUserBan
} from "../controllers/adminController.js";
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate, requireAdmin);
router.get("/stats", getAdminStats);
router.get("/users", getUsers);
router.put("/users/:id/ban", toggleUserBan);
router.delete("/comments/:id", deleteCommentAsAdmin);

export default router;
