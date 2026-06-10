import express from "express";
import { getHistory } from "../controllers/historyControllers.js";
import isAuthenticated from "../middlewares/auth.js";

const historyRoutes = express.Router();
historyRoutes.get("/", isAuthenticated, getHistory);

export default historyRoutes;