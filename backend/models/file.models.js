import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    original_name: {
      type: String,
      required: true,
    },
    s3_key: {
      type: String,
      required: true,
    },
    mime_type: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ["PROFILE_IMAGE", "EDUCATIONAL_CERTIFICATE"],
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const File = mongoose.model("File", fileSchema);
export default File;
