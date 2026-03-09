import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 32
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    avatarURL: {
      type: String,
      default: ""
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Anime"
      }
    ],
    isBanned: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

userSchema.index({ favorites: 1 });

const User = mongoose.model("User", userSchema);

export default User;
