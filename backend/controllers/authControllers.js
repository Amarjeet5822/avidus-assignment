import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.models.js";
import TokenModel from "../models/token.models.js";
import AppError from "../utils/AppError.js";
dotenv.config();

const Login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const matchingUser = await User.findOne({ email }).select('+password');
    if (!matchingUser) {
      return next(new AppError(404, "User not Found! Please register First"));
    }
    const isMatch = await comparePass(matchingUser, password);
    if (!isMatch) {
      return next(new AppError(400, "Invalid credential!"));
    }
    const refreshToken = jwt.sign(
      { userId: matchingUser._id, user: matchingUser.username, role: matchingUser.role },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res
      .status(200)
      .json({ message: "Login Successfull!", refreshToken, matchingUser });
  } catch (error) {
    next(new AppError(500, error.message));
  }
};
const Signup = async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, Number(process.env.SALT_ROUNDS));
    const newUser = new User({ email, password: hash, username: email, first_name: name });
    await newUser.save();
    res.status(201).json({ message: "You have been successfully registered!" });
  } catch (error) {
    next(new AppError(500, error.message));
  }
};

const Logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return next(new AppError(400, "No token provided"));
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.SECRET_KEY);
    } catch (err) {
      return next(new AppError(401, "Invalid token"));
    }
    const tokenExp = new Date(decoded.exp * 1000);
    const blockedToken = new TokenModel({
      user_id: decoded.userId,
      token: refreshToken,
      expires_at: tokenExp,
    });
    await blockedToken.save();

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "Lax",
    });
    res.status(200).json({ message: "logout Successful!" });
  } catch (error) {
    next(new AppError(500, error.message));
  }
};

async function comparePass(user, password) {
  try {
    const isPasswordMatching = await bcrypt.compare(password, user.password)
    return isPasswordMatching
  } catch (error) {
    return false
  }
}

const loginMiddleware = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    next(new AppError(400, "Invalid credential!"));
  }
  let regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!regex.test(email)) {
    next(new AppError(400, "Invalid email! Please enter correct valid email"));
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    next(new AppError(404, "User not Found! Please register First"));
  }
  const isMatch = await comparePass(user, password);
  if (isMatch) {
    next();
  } else {
    next(new AppError(400, "Invalid credential!"));
  }

};
const registerMiddleware = async (req, res, next) => {
  const { email, name, password } = req.body;
  try {
    if (!email || !name || !password) {
      next(new AppError(406, "resource is unavailable!"));
    }
    const user = await User.findOne({ email });
    if (user) {
      next(new AppError(409, "User already exist! Please login"));
    }
    else {
      next();
    }
  } catch (error) {
    next(new AppError(500, "internal Server error"));
  }
};


export { Login, Signup, Logout, loginMiddleware, registerMiddleware };
