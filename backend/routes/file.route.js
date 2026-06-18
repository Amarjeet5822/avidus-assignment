import express from "express";
import isAuthenticated from "../middlewares/auth.js";
import upload from "../config/multer.config.js";
import { uploadFile, downloadFile } from "../controllers/fileControllers.js";

const fileRoutes = express.Router();

// Upload a single file with key "file"
fileRoutes.post("/upload", isAuthenticated, upload.single("file"), uploadFile);
fileRoutes.get("/download/:id", isAuthenticated, downloadFile);

export default fileRoutes;
