import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import bcrypt from "bcryptjs";
import { body } from "express-validator";
import Anime from "../models/Anime.js";
import User from "../models/User.js";
import asyncHandler from "../middleware/asyncHandler.js";
import createToken from "../utils/createToken.js";

const uploadsDirectory = new URL("../../uploads/avatars/", import.meta.url);

const allowEmptyUrlOrDataImage = (value) => {
  if (value === undefined || value === null || value === "") {
    return true;
  }

  if (typeof value !== "string") {
    throw new Error("Avatar upload is invalid");
  }

  if (value.startsWith("data:image/")) {
    return true;
  }

  if (value.startsWith("/uploads/")) {
    return true;
  }

  try {
    new URL(value);
    return true;
  } catch (_error) {
    throw new Error("Avatar must be a valid image URL or uploaded image data");
  }
};

const getImageExtension = (mimeType) => {
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/gif") return "gif";
  if (mimeType === "image/svg+xml") return "svg";
  return "png";
};

const persistAvatarValue = async (value) => {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  if (typeof value !== "string") {
    return "";
  }

  if (!value.startsWith("data:image/")) {
    return value;
  }

  const match = value.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

  if (!match) {
    throw new Error("Avatar upload is invalid");
  }

  const [, mimeType, encoded] = match;
  const extension = getImageExtension(mimeType);
  const fileName = `${randomUUID()}.${extension}`;
  const fileUrl = new URL(fileName, uploadsDirectory);

  await mkdir(uploadsDirectory, { recursive: true });
  await writeFile(fileUrl, Buffer.from(encoded, "base64"));

  return `/uploads/avatars/${fileName}`;
};

const resolveAvatarUrl = (avatarURL, request) => {
  if (!avatarURL) {
    return "";
  }

  if (avatarURL.startsWith("http://") || avatarURL.startsWith("https://") || avatarURL.startsWith("data:image/")) {
    return avatarURL;
  }

  if (avatarURL.startsWith("/")) {
    return `${request.protocol}://${request.get("host")}${avatarURL}`;
  }

  return avatarURL;
};

const shapeUser = (user, request) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  avatarURL: resolveAvatarUrl(user.avatarURL, request),
  favoriteAnimeIds: (user.favorites || []).map((item) => item.toString())
});

export const registerValidation = [
  body("username").trim().isLength({ min: 3, max: 32 }),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  body("avatarURL").optional().custom(allowEmptyUrlOrDataImage)
];

export const loginValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 })
];

export const updateProfileValidation = [
  body("username").optional().trim().isLength({ min: 3, max: 32 }),
  body("email").optional().isEmail().normalizeEmail(),
  body("avatarURL").optional().custom(allowEmptyUrlOrDataImage),
  body("password").optional().isLength({ min: 8 })
];

export const register = asyncHandler(async (request, response) => {
  const username = String(request.body.username || "").trim();
  const email = String(request.body.email || "").trim().toLowerCase();
  const password = String(request.body.password || "");
  const avatarURL = await persistAvatarValue(request.body.avatarURL);
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return response.status(409).json({ message: "Email already in use" });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    username,
    email,
    passwordHash,
    avatarURL
  });

  response.status(201).json({
    token: createToken(user),
    user: shapeUser(user, request)
  });
});

export const login = asyncHandler(async (request, response) => {
  const { email, password } = request.body;
  const user = await User.findOne({ email });

  if (!user) {
    return response.status(401).json({ message: "Invalid credentials" });
  }

  if (user.isBanned) {
    return response.status(403).json({ message: "User account is banned" });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    return response.status(401).json({ message: "Invalid credentials" });
  }

  response.json({
    token: createToken(user),
    user: shapeUser(user, request)
  });
});

export const getProfile = asyncHandler(async (request, response) => {
  response.json({ user: shapeUser(request.user, request) });
});

export const updateProfile = asyncHandler(async (request, response) => {
  const user = await User.findById(request.user._id);
  const { username, email, password } = request.body;

  if (email && email !== user.email) {
    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });

    if (existingUser) {
      return response.status(409).json({ message: "Email already in use" });
    }

    user.email = normalizedEmail;
  }

  if (username) user.username = String(username).trim();
  if (request.body.avatarURL !== undefined) user.avatarURL = await persistAvatarValue(request.body.avatarURL);
  if (password) user.passwordHash = await bcrypt.hash(password, 12);

  await user.save();

  response.json({ user: shapeUser(user, request) });
});

export const getFavorites = asyncHandler(async (request, response) => {
  const user = await User.findById(request.user._id).populate("favorites");
  response.json({
    items: (user?.favorites || []).map((anime) => ({
      _id: anime._id,
      title: anime.title,
      description: anime.description,
      posterURL: anime.posterURL,
      bannerURL: anime.bannerURL,
      genres: Array.isArray(anime.genres)
        ? anime.genres
        : typeof anime.genres === "string"
          ? anime.genres.split(",").map((item) => item.trim()).filter(Boolean)
          : [],
      releaseYear: anime.releaseYear,
      rating: anime.rating
    })),
    favoriteAnimeIds: (user?.favorites || []).map((item) => item._id.toString())
  });
});

export const addFavorite = asyncHandler(async (request, response) => {
  const anime = await Anime.findById(request.params.animeId);

  if (!anime) {
    return response.status(404).json({ message: "Anime not found" });
  }

  const user = await User.findByIdAndUpdate(
    request.user._id,
    { $addToSet: { favorites: anime._id } },
    { new: true }
  );

  response.status(201).json({ user: shapeUser(user, request) });
});

export const removeFavorite = asyncHandler(async (request, response) => {
  const user = await User.findByIdAndUpdate(
    request.user._id,
    { $pull: { favorites: request.params.animeId } },
    { new: true }
  );

  response.json({ user: shapeUser(user, request) });
});
