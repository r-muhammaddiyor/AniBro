import { fileURLToPath } from "url";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import animeRoutes from "./routes/animeRoutes.js";
import episodeRoutes from "./routes/episodeRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import watchHistoryRoutes from "./routes/watchHistoryRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";

const app = express();
const uploadsDirectory = fileURLToPath(new URL("../uploads/", import.meta.url));

app.use(
  cors({
    origin: process.env.FRONTEND_URL?.split(",").map((item) => item.trim()) || "*",
    credentials: true
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "8mb" }));
app.use(express.urlencoded({ extended: true, limit: "8mb" }));
app.use("/uploads", express.static(uploadsDirectory));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/anime", animeRoutes);
app.use("/api/episodes", episodeRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/watch-history", watchHistoryRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
