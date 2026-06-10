import mongoose from "mongoose";
import historyPlugin from "../utils/historyPlugin.js";

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: false,
      trim: true,
    },

    last_name: {
      type: String,
      required: false,
      trim: true,
    },

    username: {
      type: String,
      required: false,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["User", "Admin"],
      default: "User",
    },

    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.plugin(historyPlugin, { entityType: "User" });

const User = mongoose.model("User", userSchema);
export default User;