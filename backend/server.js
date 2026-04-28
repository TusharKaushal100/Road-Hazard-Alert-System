import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { userRouter } from "./routes/userRoute.js";


import postRouter from "./routes/posts.js";
import mapRouter from "./routes/map.js";
import streamRouter from "./routes/stream.js";
import { startMockIngestion } from "./services/mockIngestionService.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const DEFAULT_DB_NAME = "road_hazard";

function normalizeMongoUrl(mongoUrl) {
  return mongoUrl.replace(/(mongodb(?:\+srv)?:\/\/[^/]+)\/+/, "$1/");
}

app.get("/", (req, res) => res.send("Road Hazard Backend Running"));

app.use("/api/v1/posts",  postRouter);
app.use("/api/v1/map",    mapRouter);
app.use("/api/v1/stream", streamRouter);
app.use("/api/v1/user", userRouter);

const main = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    if (mongoUrl) {
      const dbName = process.env.MONGO_DB_NAME || DEFAULT_DB_NAME;
      await mongoose.connect(normalizeMongoUrl(mongoUrl), { dbName });
      console.log(`MongoDB connected to database: ${mongoose.connection.name}`);
    } else {
      console.log("No MONGO_URL — running without database (mock mode)");
    }
  } catch (err) {
    console.error("MongoDB connection failed - running in mock mode:", err.message);
  }

  // Start pulling from mock API every 30 seconds
  startMockIngestion();

  app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
};

main();
