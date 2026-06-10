import express from "express"
import dotenv from 'dotenv'
import cors from "cors"
import cookieParser from "cookie-parser"
import indexRoutes from "./routes/index.route.js"
import dbConnect from "./config/dbConnection.js"
const app = express();
dotenv.config();

app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));

const cookieParserSecret = process.env.SECRET_KEY;
app.use(cookieParser(cookieParserSecret));

const whitelist = [process.env.FE_URL, process.env.DEPLOY_FE_URL];

const corsOptionsDelegate = (req, callback) => {
  if (whitelist.indexOf(req.header("Origin")) !== -1) {
    callback(null, {
      origin: req.header("Origin"), 
      credentials: true,
      methods: "GET,HEAD,PATCH,POST,PUT,DELETE",
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    }); 
  } else {
    callback(null, {origin: false});
  }
};
app.use(cors(corsOptionsDelegate));

app.use(indexRoutes);


const PORT = process.env.PORT;
app.listen(PORT, () => {
  dbConnect();
  console.log(`Server is running at http://localhost:${PORT}`);
});