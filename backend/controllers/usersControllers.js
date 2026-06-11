import User from "../models/user.models.js";
import AppError from "../utils/AppError.js";
import bcrypt from "bcrypt";


const deleteUser = async (req, res, next) => {
  try {
    const { userId: reqUserId } = req.user;
    const userId = req.params.id;
    const loginUser = await User.findOne({ _id: reqUserId });

    if (loginUser.role !== "Admin" && loginUser._id.toString() !== userId) {
      return next(new AppError(403, "You are not authorized to delete this user!"));
    }
    
    await User.findByIdAndDelete(userId);

    // If deleting self, clear cookies
    if (loginUser._id.toString() === userId) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "Lax",
      });
    }
    
    res.status(200).json({ message: "user deleted Successfully" });
  } catch (error) {
    next(new AppError(400, error?.message || "Internal Server Error"));
  }
}

const updateUser = async (req, res, next) => {
  const { name, password, email, role, is_active } = req.body;
  try {
    const userId = req.params.id;
    const { userId: reqUserId } = req.user;
    const currentLoginUser = await User.findOne({ _id: reqUserId });
    
    if (currentLoginUser.role !== "Admin" && currentLoginUser._id.toString() !== userId) {
      return next(new AppError(403, "You are not authorized to update this user!"));
    }
    
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return next(new AppError(404, "User not Found!"));
    }

    const updates = { first_name: name, email };
    
    if (currentLoginUser.role === "Admin") {
      if (role) updates.role = role;
      if (is_active !== undefined) updates.is_active = is_active;
    }

    if (password && password.trim() !== "") {
      updates.password = await bcrypt.hash(password, Number(process.env.SALT_ROUNDS));
    }
    
    const updatedUser = await User.findByIdAndUpdate({ _id: targetUser._id }, updates, { new: true });
    res.status(200).json({ message: "Updated successfully", user: updatedUser });
  } catch (error) {
    next(new AppError(400, error?.message || "Internal Server Error"));
  }
}

const getUserDetails = async (req, res, next) => {
  try {
    const user = req.user;
    const user_id = req.params.id;
    if (user.role !== "Admin" && user.userId !== user_id) {
      return next(new AppError(403, "You are not authorized to view this user!"));
    }
    const userDetail = await User.findOne({ _id: user_id });
    res.status(200).json(userDetail);
  } catch (error) {
    next(new AppError(400, error?.message || "Internal Server Error"));
  }
}

const getUserList = async (req, res, next) => {
  try {
    const { role } = req.user;
    if (role !== "Admin") {
      return next(new AppError(403, "You are not authorized to get user list!"));
    }
    const users = await User.find({}).sort({ updatedAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    next(new AppError(400, error?.message || "Internal Server Error"));
  }
}

export { deleteUser, updateUser, getUserDetails, getUserList };
