import { body, query } from "express-validator";
import Anime from "../models/Anime.js";
import Comment from "../models/Comment.js";
import Episode from "../models/Episode.js";
import User from "../models/User.js";
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
  query("year").optional({ values: "falsy" }).isInt({ min: 1950, max: 2100 }),
  query("sort").optional({ values: "falsy" }).isIn(["new", "popular", "trending", "rating", "az"]),
  query("duration").optional({ values: "falsy" }).isIn(["short", "medium", "long"])
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

const shapeAnime = (anime, metrics = {}) => {
  const plainAnime = typeof anime.toObject === "function" ? anime.toObject() : anime;
  const animeId = plainAnime._id.toString();
  const scopedMetrics = metrics[animeId] || {};

  return {
    ...plainAnime,
    genres: normalizeGenres(plainAnime.genres),
    averageDuration: scopedMetrics.averageDuration || 0,
    episodeCount: scopedMetrics.episodeCount || 0,
    commentCount: scopedMetrics.commentCount || 0,
    favoriteCount: scopedMetrics.favoriteCount || 0
  };
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getDurationMatcher = (duration) => {
  if (duration === "short") return (value) => value > 0 && value < 1500;
  if (duration === "medium") return (value) => value >= 1500 && value <= 1800;
  if (duration === "long") return (value) => value > 1800;
  return () => true;
};

const getAnimeMetrics = async (animeIds) => {
  if (!animeIds.length) {
    return {};
  }

  const [episodeStats, commentStats, favoriteStats] = await Promise.all([
    Episode.aggregate([
      { $match: { animeId: { $in: animeIds } } },
      {
        $group: {
          _id: "$animeId",
          episodeCount: { $sum: 1 },
          averageDuration: { $avg: "$duration" }
        }
      }
    ]),
    Comment.aggregate([
      { $match: { animeId: { $in: animeIds } } },
      {
        $group: {
          _id: "$animeId",
          commentCount: { $sum: 1 }
        }
      }
    ]),
    User.aggregate([
      { $unwind: "$favorites" },
      { $match: { favorites: { $in: animeIds } } },
      {
        $group: {
          _id: "$favorites",
          favoriteCount: { $sum: 1 }
        }
      }
    ])
  ]);

  const metrics = Object.create(null);

  for (const stat of episodeStats) {
    metrics[stat._id.toString()] = {
      ...(metrics[stat._id.toString()] || {}),
      episodeCount: stat.episodeCount,
      averageDuration: Math.round(stat.averageDuration || 0)
    };
  }

  for (const stat of commentStats) {
    metrics[stat._id.toString()] = {
      ...(metrics[stat._id.toString()] || {}),
      commentCount: stat.commentCount
    };
  }

  for (const stat of favoriteStats) {
    metrics[stat._id.toString()] = {
      ...(metrics[stat._id.toString()] || {}),
      favoriteCount: stat.favoriteCount
    };
  }

  return metrics;
};

export const getAnimeList = asyncHandler(async (request, response) => {
  const page = Number(request.query.page || 1);
  const limit = Number(request.query.limit || 12);
  const search = request.query.search?.trim();
  const genre = request.query.genre?.trim();
  const rating = request.query.rating ? Number(request.query.rating) : undefined;
  const year = request.query.year ? Number(request.query.year) : undefined;
  const sort = request.query.sort?.trim() || (search ? "relevance" : "new");
  const duration = request.query.duration?.trim();

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

  const query = Anime.find(filters, search ? { score: { $meta: "textScore" } } : undefined);
  const animeDocs = await query.limit(250);
  const metrics = await getAnimeMetrics(animeDocs.map((item) => item._id));
  const durationMatcher = getDurationMatcher(duration);

  let items = animeDocs
    .map((anime) => {
      const shaped = shapeAnime(anime, metrics);
      const score = typeof anime.get === "function" ? anime.get("score") : anime.score;
      return {
        ...shaped,
        _searchScore: score || 0
      };
    })
    .filter((anime) => durationMatcher(anime.averageDuration || 0));

  items.sort((left, right) => {
    if (sort === "relevance") {
      return (right._searchScore || 0) - (left._searchScore || 0) || right.rating - left.rating;
    }

    if (sort === "popular") {
      return (right.favoriteCount || 0) - (left.favoriteCount || 0)
        || (right.commentCount || 0) - (left.commentCount || 0)
        || right.rating - left.rating;
    }

    if (sort === "trending") {
      return (right.commentCount || 0) - (left.commentCount || 0)
        || (right.favoriteCount || 0) - (left.favoriteCount || 0)
        || new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    }

    if (sort === "rating") {
      return right.rating - left.rating || (right.favoriteCount || 0) - (left.favoriteCount || 0);
    }

    if (sort === "az") {
      return left.title.localeCompare(right.title);
    }

    return right.releaseYear - left.releaseYear || new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });

  const total = items.length;
  const paginatedItems = items.slice((page - 1) * limit, page * limit).map(({ _searchScore, ...anime }) => anime);

  response.json({
    items: paginatedItems,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

export const getAnimeAutocomplete = asyncHandler(async (request, response) => {
  const q = request.query.q?.trim();

  if (!q) {
    return response.json({ items: [] });
  }

  const items = await Anime.find({ title: { $regex: escapeRegex(q), $options: "i" } })
    .select("title posterURL releaseYear rating genres")
    .sort({ rating: -1, createdAt: -1 })
    .limit(6);

  response.json({
    items: items.map((anime) => ({
      ...shapeAnime(anime),
      title: anime.title
    }))
  });
});

export const getAnimeRecommendations = asyncHandler(async (request, response) => {
  const anime = await Anime.findById(request.params.id);

  if (!anime) {
    return response.status(404).json({ message: "Anime not found" });
  }

  const sourceGenres = normalizeGenres(anime.genres);
  const candidates = await Anime.find({ _id: { $ne: anime._id } }).limit(60);
  const metrics = await getAnimeMetrics(candidates.map((item) => item._id));

  const items = candidates
    .map((item) => {
      const shaped = shapeAnime(item, metrics);
      const overlap = shaped.genres.filter((genre) => sourceGenres.includes(genre)).length;
      return {
        ...shaped,
        _overlap: overlap
      };
    })
    .filter((item) => item._overlap > 0)
    .sort((left, right) => right._overlap - left._overlap || right.rating - left.rating || (right.favoriteCount || 0) - (left.favoriteCount || 0))
    .slice(0, 6)
    .map(({ _overlap, ...item }) => item);

  response.json({ items });
});

export const getAnimeById = asyncHandler(async (request, response) => {
  const anime = await Anime.findById(request.params.id);

  if (!anime) {
    return response.status(404).json({ message: "Anime not found" });
  }

  const [episodes, continueWatching, metrics] = await Promise.all([
    Episode.find({ animeId: anime._id }).sort({ episodeNumber: 1 }),
    request.user
      ? WatchHistory.find({ userId: request.user._id, animeId: anime._id })
          .sort({ updatedAt: -1 })
          .limit(1)
          .populate("episodeId")
      : [],
    getAnimeMetrics([anime._id])
  ]);

  response.json({
    anime: shapeAnime(anime, metrics),
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
    WatchHistory.deleteMany({ animeId: anime._id }),
    User.updateMany({}, { $pull: { favorites: anime._id } })
  ]);

  response.json({ message: "Anime deleted successfully" });
});
