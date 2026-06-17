import express from "express"
import dotenv from 'dotenv'
import cors from "cors"
import cookieParser from "cookie-parser"
import indexRoutes from "./routes/index.route.js"
import dbConnect from "./config/dbConnection.js"
import AppError from "./utils/AppError.js"
const app = express();
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const cookieParserSecret = process.env.SECRET_KEY;
app.use(cookieParser(cookieParserSecret));

const whitelist = [process.env.FE_URL, process.env.DEPLOYED_FE_URL];

const corsOptionsDelegate = (req, callback) => {
  if (whitelist.indexOf(req.header("Origin")) !== -1) {
    callback(null, {
      origin: req.header("Origin"),
      credentials: true,
      methods: "GET,HEAD,PATCH,POST,PUT,DELETE",
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    });
  } else {
    callback(null, { origin: false });
  }
};
app.use(cors(corsOptionsDelegate));

app.use("/api", indexRoutes);

// Error handling for undefined routes
app.all("/api/*splat", (req, res, next) => {
  console.log("this line is done")
  next(new AppError(404, `Can't find ${req.originalUrl} on this server!`));
});
// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: err.status || "error",
    message: err.message || "Internal Server Error",
    ...err.data,
  });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  dbConnect();
  console.log(`Server is running at http://localhost:${PORT}`);
});