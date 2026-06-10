import bcypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import TokenModel from "../models/token.models.js";

dotenv.config();

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "Please login first!" });
    }
    const isTokenInDb = await TokenModel.findOne({token});
    if(isTokenInDb) {
      return res.status(440).json({ message: "Session is Expired! Login first" });
    }
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if(err) {
        return res.status(401).json({ message: "Please login first!", err });
      }
      req.user = decoded
      next();
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};

export default isAuthenticated;
