import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import { postRouter } from "./routes/posts.js";
import { mapRouter } from "./routes/map.js";

import { fetchRedditPosts } from "./services/redditService.js";
import { processPost } from "./services/postProcessor.js"; 

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;


app.get("/", (req, res) => {
  res.send("Road Hazard Backend Running");
});




app.use("/api/v1/posts", postRouter);
app.use("/api/v1/map", mapRouter);




const main = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    console.log("✅ MongoDB connected");

    setInterval(async () => {
      console.log("Fetching Reddit posts...");

      const posts = await fetchRedditPosts();

      for (let i = 0; i < posts.length; i++) {
        await processPost(posts[i], "reddit");
      }

    }, 30000);

  } catch (err) {
    console.log(" MongoDB connection failed");
  }

  try {
    app.listen(PORT, () => {
      console.log("Server running on " + PORT);
    });
  } catch (err) {
    console.log("Server failed");
  }
};

main();