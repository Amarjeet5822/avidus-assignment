// Example in your route file:
import multer from "multer";
import AppError from "../utils/AppError.js";
import { uploadTaskImage } from "../services/multer.service.js";

export const taskFileMiddleware = (req, res, next) => {
    const upload = uploadTaskImage.single("image");

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return next(new AppError(400, "File size cannot exceed 500KB"));
            }
            return next(new AppError(400, err.message));
        } else if (err) {
            return next(new AppError(500, "Unknown upload error"));
        }
        next();
    });
};



