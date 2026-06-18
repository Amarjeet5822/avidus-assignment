import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import TokenModel from "../models/token.models.js";

dotenv.config();

const isAuthenticated = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, process.env.SECRET_KEY);
        req.user = decoded;
        return next();
      } catch (err) {
      }
    }
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Please login first!" });
    }
    const isTokenInDb = await TokenModel.findOne({ token: refreshToken });
    if (isTokenInDb) {
      return res.status(440).json({ message: "Session is Expired! Login first" });
    }
    jwt.verify(refreshToken, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Please login first!", err });
      }
      const newAccessToken = jwt.sign(
        { userId: decoded.userId, user: decoded.user, role: decoded.role },
        process.env.SECRET_KEY,
        { expiresIn: "15m" }
      );

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "Lax",
        maxAge: 15 * 60 * 1000,
      });

      req.user = decoded;
      next();
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default isAuthenticated;
