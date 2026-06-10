import express from "express";
import { Login, loginMiddleware, Logout, registerMiddleware, Signup } from "../controllers/authControllers.js";
import isAuthenticated from "../middlewares/auth.js";
import { deleteUser, getUserDetails, getUserList, updateUser } from "../controllers/usersControllers.js";

const userRoutes = express.Router();

// User Registration
userRoutes.post("/signup", registerMiddleware, Signup);
userRoutes.post("/login", loginMiddleware, Login);
userRoutes.post("/logout", isAuthenticated, Logout);
userRoutes.get("/", isAuthenticated, getUserList);
userRoutes.get("/:id", isAuthenticated, getUserDetails);
userRoutes.patch("/:id", isAuthenticated, updateUser);
userRoutes.delete("/:id", isAuthenticated, deleteUser);

export default userRoutes;