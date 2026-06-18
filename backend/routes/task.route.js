import express from "express";
import {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    getTaskImage,
} from "../controllers/taskControllers.js";
import isAuthenticated from "../middlewares/auth.js";
import { taskFileMiddleware } from "../middlewares/taskUploadMiddlware.js";

const taskRoutes = express.Router();

taskRoutes.post("/", isAuthenticated, taskFileMiddleware, createTask);
taskRoutes.get("/", isAuthenticated, getTasks);
taskRoutes.get("/:id", isAuthenticated, getTaskById);
taskRoutes.get("/:id/image", isAuthenticated, getTaskImage);
taskRoutes.patch("/:id", isAuthenticated, taskFileMiddleware, updateTask);
taskRoutes.delete("/:id", isAuthenticated, deleteTask);

export default taskRoutes;