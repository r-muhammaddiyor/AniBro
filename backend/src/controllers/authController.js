import bcrypt from "bcryptjs";
import { body } from "express-validator";
import User from "../models/User.js";
import asyncHandler from "../middleware/asyncHandler.js";
import createToken from "../utils/createToken.js";

const allowEmptyOrValidUrl = (value) => {
  if (value === undefined || value === null || value === "") {
    return true;
  }

  try {
    new URL(value);
    return true;
  } catch (_error) {
    throw new Error("Avatar URL must be valid");
  }
};

export const registerValidation = [
  body("username").trim().isLength({ min: 3, max: 32 }),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  body("avatarURL").optional().custom(allowEmptyOrValidUrl)
];

export const loginValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 })
];

export const updateProfileValidation = [
  body("username").optional().trim().isLength({ min: 3, max: 32 }),
  body("email").optional().isEmail().normalizeEmail(),
  body("avatarURL").optional().custom(allowEmptyOrValidUrl),
  body("password").optional().isLength({ min: 8 })
];

export const register = asyncHandler(async (request, response) => {
  const { username, email, password, avatarURL = "" } = request.body;
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
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatarURL: user.avatarURL
    }
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
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatarURL: user.avatarURL
    }
  });
});

export const getProfile = asyncHandler(async (request, response) => {
  response.json({ user: request.user });
});

export const updateProfile = asyncHandler(async (request, response) => {
  const user = await User.findById(request.user._id);
  const { username, email, avatarURL, password } = request.body;

  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email, _id: { $ne: user._id } });

    if (existingUser) {
      return response.status(409).json({ message: "Email already in use" });
    }
  }

  if (username) user.username = username;
  if (email) user.email = email;
  if (avatarURL !== undefined) user.avatarURL = avatarURL;
  if (password) user.passwordHash = await bcrypt.hash(password, 12);

  await user.save();

  response.json({
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatarURL: user.avatarURL
    }
  });
});
