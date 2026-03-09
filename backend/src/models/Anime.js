import mongoose from "mongoose";

const animeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    posterURL: {
      type: String,
      required: true
    },
    bannerURL: {
      type: String,
      required: true
    },
    genres: {
      type: mongoose.Schema.Types.Mixed,
      default: ""
    },
    releaseYear: {
      type: Number,
      required: true
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

animeSchema.index({ title: "text", description: "text" });
animeSchema.index({ genres: 1, releaseYear: -1, rating: -1 });

const Anime = mongoose.model("Anime", animeSchema);

export default Anime;
