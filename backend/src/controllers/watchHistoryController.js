import { body } from "express-validator";
import WatchHistory from "../models/WatchHistory.js";
import Episode from "../models/Episode.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const watchHistoryValidation = [
  body("animeId").isMongoId(),
  body("episodeId").isMongoId(),
  body("lastWatchedTimestamp").isFloat({ min: 0 })
];

export const getWatchHistoryByUserId = asyncHandler(async (request, response) => {
  const requestedUserId = request.params.userId;
  const currentUserId = request.user._id.toString();

  if (requestedUserId !== currentUserId && request.user.role !== "admin") {
    return response.status(403).json({ message: "Not allowed to view this watch history" });
  }

  const history = await WatchHistory.find({ userId: requestedUserId })
    .populate("animeId", "title posterURL bannerURL")
    .populate("episodeId", "episodeNumber title duration thumbnailURL")
    .sort({ updatedAt: -1 });

  response.json({ history });
});

export const saveWatchHistory = asyncHandler(async (request, response) => {
  const episode = await Episode.findById(request.body.episodeId);

  if (!episode) {
    return response.status(404).json({ message: "Episode not found" });
  }

  const record = await WatchHistory.findOneAndUpdate(
    {
      userId: request.user._id,
      episodeId: request.body.episodeId
    },
    {
      $set: {
        animeId: request.body.animeId,
        lastWatchedTimestamp: request.body.lastWatchedTimestamp
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  )
    .populate("animeId", "title posterURL bannerURL")
    .populate("episodeId", "episodeNumber title duration thumbnailURL");

  response.status(201).json({ history: record });
});
