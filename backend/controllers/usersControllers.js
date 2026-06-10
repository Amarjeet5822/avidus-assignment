import User from "../models/user.models.js";
import AppError from "../utils/AppError.js";
import bcrypt from "bcrypt";


const deleteUser = async (req, res, next) => {
  try {
    const { userId: reqUserId } = req.user;
    const userId = req.params.id;
    const loginUser = await User.findOne({ _id: reqUserId });

    if (loginUser.role !== "Admin" || loginUser._id.toString() !== userId) {
      return next(new AppError(403, "You are not authorized to delete this user!"));
    }
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // `false`
      sameSite: process.env.NODE_ENV === "production" ? "none" : "Lax", // `Strict` can block requests in some cases, `Lax` is better for authentication
    });
    res.status(200).json({ message: "user deleted Successfully" });
  } catch (error) {
    next(new AppError(400, error?.message || "Internal Server Error"));
  }
}
const updateUser = async (req, res) => {
  const { name, password, email } = req.body;
  try {
    const userId = req.params.id;
    const { userId: reqUserId } = req.user;
    const currentLoginUser = await User.findOne({ _id: reqUserId });
    if (currentLoginUser.role !== "Admin" || currentLoginUser._id.toString() !== userId) {
      return next(new AppError(403, "You are not authorized to update this user!"));
    }
    const oldUserDetail = await User.findOne({ email })

    if (!oldUserDetail) {
      return next(new AppError(404, "User not Found!"));
    }
    const hashedPassword = await bcrypt.hash(password, Number(process.env.SALT_ROUNDS));
    await User.findByIdAndUpdate({ _id: oldUserDetail._id }, { first_name: name, email, password: hashedPassword });
    res.status(200).json({ message: "Updated successfully" });
  } catch (error) {
    next(new AppError(400, error?.message || "Internal Server Error"));
  }
}
const getUserDetails = async (req, res) => {
  try {
    const user = req.user;
    const user_id = req.params.id;
    if (user.role !== "Admin" || user.userId !== user_id) {
      return next(new AppError(403, "You are not authorized to update this user!"));
    }
    const userDetail = await User.findOne({ _id: user.userId });
    res.status(200).json(userDetail);
  } catch (error) {
    next(new AppError(400, error?.message || "Internal Server Error"));
  }
}

const getUserList = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== "Admin") {
      return next(new AppError(403, "You are not authorized to get user list!"));
    }
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    next(new AppError(400, error?.message || "Internal Server Error"));
  }
}


export { deleteUser, updateUser, getUserDetails, getUserList };
