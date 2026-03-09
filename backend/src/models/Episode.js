import mongoose from "mongoose";

const episodeSchema = new mongoose.Schema(
  {
    animeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Anime",
      required: true
    },
    episodeNumber: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    videoURL: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    introEndTime: {
      type: Number,
      default: 0
    },
    thumbnailURL: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

episodeSchema.index({ animeId: 1, episodeNumber: 1 }, { unique: true });

const Episode = mongoose.model("Episode", episodeSchema);

export default Episode;
