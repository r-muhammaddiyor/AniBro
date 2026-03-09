import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
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
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 800
    },
    likes: {
      type: Number,
      default: 0
    },
    dislikes: {
      type: Number,
      default: 0
    },
    reactions: {
      type: Map,
      of: String,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

commentSchema.index({ animeId: 1, createdAt: -1 });

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
