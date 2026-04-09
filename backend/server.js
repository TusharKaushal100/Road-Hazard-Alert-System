import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import postRouter from "./routes/posts.js";
import mapRouter from "./routes/map.js";
import streamRouter from "./routes/stream.js";
import { startMockIngestion } from "./services/mockIngestionService.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => res.send("Road Hazard Backend Running"));

app.use("/api/v1/posts",  postRouter);
app.use("/api/v1/map",    mapRouter);
app.use("/api/v1/stream", streamRouter);

const main = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    if (mongoUrl) {
      await mongoose.connect(mongoUrl, { dbName: "road_hazard" });
      console.log("MongoDB connected");
    } else {
      console.log("No MONGO_URL — running without database (mock mode)");
    }
  } catch (err) {
    console.log("MongoDB connection failed — running in mock mode");
  }

  // Start pulling from mock API every 30 seconds
  startMockIngestion();

  app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
};

main();
