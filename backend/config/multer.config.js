import multer from "multer";
import AppError from "../utils/AppError.js";

// Use memory storage to pipe directly to S3 without saving to local disk
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(400, "Invalid file type. Only JPEG, PNG, WEBP, and PDF are allowed."));
    }
  },
});

export default upload;
