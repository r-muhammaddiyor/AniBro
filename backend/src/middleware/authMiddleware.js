import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "./asyncHandler.js";

export const authenticate = asyncHandler(async (request, response, next) => {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return response.status(401).json({ message: "Authentication required" });
  }

  const token = authorization.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select("-passwordHash");

    if (!user) {
      return response.status(401).json({ message: "User not found" });
    }

    if (user.isBanned) {
      return response.status(403).json({ message: "User account is banned" });
    }

    request.user = user;
    next();
  } catch (_error) {
    response.status(401).json({ message: "Invalid or expired token" });
  }
});

export const requireAdmin = (request, response, next) => {
  if (request.user?.role !== "admin") {
    return response.status(403).json({ message: "Admin access required" });
  }

  next();
};
