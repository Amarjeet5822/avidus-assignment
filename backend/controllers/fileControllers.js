import crypto from "crypto";
import File from "../models/file.models.js";
import AppError from "../utils/AppError.js";
import { uploadToS3, getPresignedUrl } from "../config/s3.config.js";

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError(400, "No file uploaded"));
    }

    const { category } = req.body;
    if (!["PROFILE_IMAGE", "EDUCATIONAL_CERTIFICATE"].includes(category)) {
      return next(new AppError(400, "Invalid category"));
    }

    const fileBuffer = req.file.buffer;
    const originalName = req.file.originalname;
    const mimetype = req.file.mimetype;
    const size = req.file.size;
    const userId = req.user.userId;

    // Generate unique file name for S3
    const uniqueSuffix = crypto.randomBytes(16).toString("hex");
    const extension = originalName.split(".").pop();
    const s3Key = `${userId}/${category.toLowerCase()}_${uniqueSuffix}.${extension}`;

    // Upload to S3
    await uploadToS3(fileBuffer, s3Key, mimetype);

    // Save metadata to MongoDB
    const fileDoc = new File({
      userId,
      original_name: originalName,
      s3_key: s3Key,
      mime_type: mimetype,
      size,
      category,
    });

    await fileDoc.save();

    res.status(201).json({
      message: "File uploaded successfully",
      fileId: fileDoc._id,
    });
  } catch (error) {
    next(new AppError(500, error.message || "Failed to upload file"));
  }
};

export const downloadFile = async (req, res, next) => {
  try {
    const fileId = req.params.id;
    const userId = req.user.userId;
    const role = req.user.role;

    const fileDoc = await File.findById(fileId);
    if (!fileDoc) {
      return next(new AppError(404, "File not found"));
    }
    if (fileDoc.userId.toString() !== userId && role !== "Admin") {
      return next(new AppError(403, "Not authorized to access this file"));
    }

    const url = await getPresignedUrl(fileDoc.s3_key);

    res.status(200).json({ url });
  } catch (error) {
    next(new AppError(500, error.message || "Failed to generate download link"));
  }
};
