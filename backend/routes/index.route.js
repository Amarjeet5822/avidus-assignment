import express from "express";
import userRoutes from "./user.route.js";
import taskRoutes from "./task.route.js";
import historyRoutes from "./history.route.js";

const indexRoutes = express.Router();

indexRoutes.use("/api/users", userRoutes);
indexRoutes.use("/api/tasks", taskRoutes);
indexRoutes.use("/api/history", historyRoutes);

export default indexRoutes;