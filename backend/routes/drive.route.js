import express from "express";
import isAuthenticated from "../middlewares/auth.js";
import {
  createFolder,
  initUpload,
  getContents,
  getDownloadUrl,
  rename,
  moveItem,
  softDelete,
} from "../controllers/driveControllers.js";

const driveRoutes = express.Router();

driveRoutes.post("/folder", isAuthenticated, createFolder);
driveRoutes.post("/upload", isAuthenticated, initUpload);
driveRoutes.get("/", isAuthenticated, getContents);
driveRoutes.get("/:id/download", isAuthenticated, getDownloadUrl);
driveRoutes.patch("/:id", isAuthenticated, rename);
driveRoutes.patch("/:id/move", isAuthenticated, moveItem);
driveRoutes.delete("/:id", isAuthenticated, softDelete);

export default driveRoutes;
