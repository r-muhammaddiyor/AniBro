import User from "../models/User.js";
import Anime from "../models/Anime.js";
import Episode from "../models/Episode.js";
import Comment from "../models/Comment.js";
import WatchHistory from "../models/WatchHistory.js";
import cleanupLegacyAnimeIndexes from "./cleanupLegacyAnimeIndexes.js";

const syncIndexes = async () => {
  await cleanupLegacyAnimeIndexes(Anime);

  const models = [User, Anime, Episode, Comment, WatchHistory];

  for (const model of models) {
    await model.syncIndexes();
    console.log(`Indexes synced for ${model.modelName}`);
  }
};

export default syncIndexes;
