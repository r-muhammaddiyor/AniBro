import { body, query } from "express-validator";
import Anime from "../models/Anime.js";
import Comment from "../models/Comment.js";
import Episode from "../models/Episode.js";
import WatchHistory from "../models/WatchHistory.js";
import asyncHandler from "../middleware/asyncHandler.js";
import cleanupLegacyAnimeIndexes from "../utils/cleanupLegacyAnimeIndexes.js";

export const animeValidation = [
  body("title").trim().notEmpty(),
  body("description").trim().notEmpty(),
  body("posterURL").isURL(),
  body("bannerURL").isURL(),
  body("genres").isArray({ min: 1 }),
  body("releaseYear").isInt({ min: 1950, max: 2100 }),
  body("rating").isFloat({ min: 0, max: 10 })
];

export const animeUpdateValidation = [
  body("title").optional().trim().notEmpty(),
  body("description").optional().trim().notEmpty(),
  body("posterURL").optional().isURL(),
  body("bannerURL").optional().isURL(),
  body("genres").optional().isArray({ min: 1 }),
  body("releaseYear").optional().isInt({ min: 1950, max: 2100 }),
  body("rating").optional().isFloat({ min: 0, max: 10 })
];

export const animeQueryValidation = [
  query("page").optional({ values: "falsy" }).isInt({ min: 1 }),
  query("limit").optional({ values: "falsy" }).isInt({ min: 1, max: 50 }),
  query("rating").optional({ values: "falsy" }).isFloat({ min: 0, max: 10 }),
  query("year").optional({ values: "falsy" }).isInt({ min: 1950, max: 2100 })
];

const normalizeGenres = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const serializeGenres = (value) => normalizeGenres(value).join(", ");

const shapeAnime = (anime) => {
  const plainAnime = typeof anime.toObject === "function" ? anime.toObject() : anime;
  return {
    ...plainAnime,
    genres: normalizeGenres(plainAnime.genres)
  };
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getAnimeList = asyncHandler(async (request, response) => {
  const page = Number(request.query.page || 1);
  const limit = Number(request.query.limit || 12);
  const search = request.query.search?.trim();
  const genre = request.query.genre?.trim();
  const rating = request.query.rating ? Number(request.query.rating) : undefined;
  const year = request.query.year ? Number(request.query.year) : undefined;

  const filters = {};
  const andFilters = [];

  if (search) {
    filters.$text = { $search: search };
  }

  if (genre) {
    andFilters.push({
      $or: [
        { genres: genre },
        { genres: { $regex: `(^|,\\s*)${escapeRegex(genre)}(\\s*,|$)`, $options: "i" } }
      ]
    });
  }

  if (rating !== undefined) {
    filters.rating = { $gte: rating };
  }

  if (year !== undefined) {
    filters.releaseYear = year;
  }

  if (andFilters.length) {
    filters.$and = andFilters;
  }

  const [items, total] = await Promise.all([
    Anime.find(filters)
      .sort(search ? { score: { $meta: "textScore" } } : { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Anime.countDocuments(filters)
  ]);

  response.json({
    items: items.map(shapeAnime),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

export const getAnimeById = asyncHandler(async (request, response) => {
  const anime = await Anime.findById(request.params.id);

  if (!anime) {
    return response.status(404).json({ message: "Anime not found" });
  }

  const [episodes, continueWatching] = await Promise.all([
    Episode.find({ animeId: anime._id }).sort({ episodeNumber: 1 }),
    request.user
      ? WatchHistory.find({ userId: request.user._id, animeId: anime._id })
          .sort({ updatedAt: -1 })
          .limit(1)
          .populate("episodeId")
      : []
  ]);

  response.json({
    anime: shapeAnime(anime),
    episodes,
    continueWatching: continueWatching[0] || null
  });
});

export const createAnime = asyncHandler(async (request, response) => {
  await cleanupLegacyAnimeIndexes(Anime);

  const payload = {
    ...request.body,
    genres: serializeGenres(request.body.genres)
  };

  const anime = await Anime.create(payload);
  response.status(201).json({ anime: shapeAnime(anime) });
});

export const updateAnime = asyncHandler(async (request, response) => {
  const payload = {
    ...request.body,
    ...(request.body.genres ? { genres: serializeGenres(request.body.genres) } : {})
  };

  const anime = await Anime.findByIdAndUpdate(request.params.id, payload, {
    new: true,
    runValidators: true
  });

  if (!anime) {
    return response.status(404).json({ message: "Anime not found" });
  }

  response.json({ anime: shapeAnime(anime) });
});

export const deleteAnime = asyncHandler(async (request, response) => {
  const anime = await Anime.findById(request.params.id);

  if (!anime) {
    return response.status(404).json({ message: "Anime not found" });
  }

  await Promise.all([
    anime.deleteOne(),
    Episode.deleteMany({ animeId: anime._id }),
    Comment.deleteMany({ animeId: anime._id }),
    WatchHistory.deleteMany({ animeId: anime._id })
  ]);

  response.json({ message: "Anime deleted successfully" });
});
