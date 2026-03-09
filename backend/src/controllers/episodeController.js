import { body } from "express-validator";
import Episode from "../models/Episode.js";
import Anime from "../models/Anime.js";
import WatchHistory from "../models/WatchHistory.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const episodeValidation = [
  body("animeId").isMongoId(),
  body("episodeNumber").isInt({ min: 1 }),
  body("title").trim().notEmpty(),
  body("videoURL").isURL(),
  body("duration").isInt({ min: 1 }),
  body("introEndTime").optional().isInt({ min: 0 }),
  body("thumbnailURL").optional({ values: "falsy" }).isURL(),
  body("subtitleURL").optional({ values: "falsy" }).isURL()
];

export const updateEpisodeValidation = [
  body("episodeNumber").optional().isInt({ min: 1 }),
  body("title").optional().trim().notEmpty(),
  body("videoURL").optional().isURL(),
  body("duration").optional().isInt({ min: 1 }),
  body("introEndTime").optional().isInt({ min: 0 }),
  body("thumbnailURL").optional({ values: "falsy" }).isURL(),
  body("subtitleURL").optional({ values: "falsy" }).isURL()
];

export const getEpisodesByAnimeId = asyncHandler(async (request, response) => {
  const episodes = await Episode.find({ animeId: request.params.animeId }).sort({
    episodeNumber: 1
  });

  response.json({ episodes });
});

export const createEpisode = asyncHandler(async (request, response) => {
  const anime = await Anime.findById(request.body.animeId);

  if (!anime) {
    return response.status(404).json({ message: "Anime not found" });
  }

  const episode = await Episode.create(request.body);
  response.status(201).json({ episode });
});

export const updateEpisode = asyncHandler(async (request, response) => {
  const episode = await Episode.findByIdAndUpdate(request.params.id, request.body, {
    new: true,
    runValidators: true
  });

  if (!episode) {
    return response.status(404).json({ message: "Episode not found" });
  }

  response.json({ episode });
});

export const deleteEpisode = asyncHandler(async (request, response) => {
  const episode = await Episode.findById(request.params.id);

  if (!episode) {
    return response.status(404).json({ message: "Episode not found" });
  }

  await Promise.all([
    episode.deleteOne(),
    WatchHistory.deleteMany({ episodeId: episode._id })
  ]);

  response.json({ message: "Episode deleted successfully" });
});
