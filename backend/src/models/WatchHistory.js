import mongoose from "mongoose";

const watchHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    animeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Anime",
      required: true
    },
    episodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Episode",
      required: true
    },
    lastWatchedTimestamp: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

watchHistorySchema.index({ userId: 1, episodeId: 1 }, { unique: true });
watchHistorySchema.index({ userId: 1, updatedAt: -1 });

const WatchHistory = mongoose.model("WatchHistory", watchHistorySchema);

export default WatchHistory;
