import mongoose from "mongoose";

const driveItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DriveItem",
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["file", "folder"],
      required: true,
    },
    key: {
      type: String,
      default: null,
    },
    s3_url: {
      type: String,
      default: null,
    },
    mimeType: {
      type: String,
      default: null,
    },
    extension: {
      type: String,
      default: null,
    },
    size: {
      type: Number,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const DriveItem = mongoose.model("DriveItem", driveItemSchema);
export default DriveItem;
