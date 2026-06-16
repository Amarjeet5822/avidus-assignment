import express from "express";
import userRoutes from "./user.route.js";
import taskRoutes from "./task.route.js";
import historyRoutes from "./history.route.js";
import fileRoutes from "./file.route.js";

const indexRoutes = express.Router();

indexRoutes.use("/users", userRoutes);
indexRoutes.use("/tasks", taskRoutes);
indexRoutes.use("/history", historyRoutes);
indexRoutes.use("/files", fileRoutes);

export default indexRoutes;