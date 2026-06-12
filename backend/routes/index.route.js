import express from "express";
import userRoutes from "./user.route.js";
import taskRoutes from "./task.route.js";
import historyRoutes from "./history.route.js";

const indexRoutes = express.Router();

indexRoutes.use("/users", userRoutes);
indexRoutes.use("/tasks", taskRoutes);
indexRoutes.use("/history", historyRoutes);

export default indexRoutes;