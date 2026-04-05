// backend/controllers/postController.js
import { PostModel } from "../models/Post.js";
import { processPostWithML } from "../services/mlService.js";
import { extractLocation } from "../services/locationService.js";
import { sendAlertToAuthority } from "../services/emailService.js";

export const createPost = async (req, res) => {
  try {
    const { text, source = "user" } = req.body;

    // Step 1: Get label & confidence from ML
    const mlResult = await processPostWithML(text);

    // Step 2: Extract location (lat, lng)
    const locationData = await extractLocation(text);

    if (!locationData) {
      return res.status(400).json({ message: "No location found in post" });
    }

    const newPost = await PostModel.create({
      text,
      label: mlResult.label,
      confidence: mlResult.confidence,
      location: {
        type: "Point",
        coordinates: [locationData.lng, locationData.lat]
      },
      locationName: locationData.name,
      city: locationData.city,
      state: locationData.state,
      source
    });

    // Step 3: Send email to authority
    await sendAlertToAuthority(newPost);

    res.status(201).json({ message: "Post created successfully", post: newPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPosts = async (req, res) => {
  try {
    const posts = await PostModel.find()
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getPostsByCityState = async (req, res) => {
  try {
    const { city, state } = req.query;
    const posts = await PostModel.find({ city, state })
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};