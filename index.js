import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import subRoutes from "./routes/subRoutes.js";
import User from "./models/userModel.js";
const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
//these variables come from dotenv file but for now we are hardcoding it
//const CONNECTION_URL = process.env.CONNECTION_URL;
const PORT = process.env.port || 5000;
const MONGO_URI = process.env.MONGO_URI || 5000;

//connecting to the database
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("database connected");

    app.use(authRoutes);
    app.use(subRoutes);

    app.listen(PORT, () => {
      console.log(`app listening on ${PORT}`);
    });
  })
  .catch((err) => console.log(err.message));
