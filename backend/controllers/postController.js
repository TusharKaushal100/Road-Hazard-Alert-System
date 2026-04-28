import { PostModel } from "../config/db.js";
import { classifyPost } from "../services/mlService.js";
import { extractLocation } from "../services/locationService.js";
import { sendAlertToAuthority } from "../services/emailService.js";
import { getInMemoryPosts } from "../services/mockIngestionService.js";
import mongoose from "mongoose";

const LABEL_COLORS = {
  pothole: "#ef4444",
  flood: "#3b82f6",
  accident: "#f97316",
  traffic: "#eab308",
  road_damage: "#8b5cf6",
  animal: "#22c55e",
};


const VALID_LABELS = [
  "pothole",
  "flood",
  "accident",
  "traffic",
  "road_damage",
  "animal",
];

function formatPost(p) {
  const coords = p.location?.coordinates || [91.7, 26.1];
  return {
    id: p._id || p.id,
    text: p.text,
    label: p.label,
    confidence: p.confidence,
    color: LABEL_COLORS[p.label] || "#6b7280",
    username: p.username || "anonymous",
    created_at: p.createdAt || new Date(),
    location: {
      name: p.locationName || "Assam",
      lat: p.location?.lat || coords[1],
      lon: p.location?.lon || coords[0],
    },
  };
}

export const createPost = async (req, res) => {
  console.log("Received createPost request with body:", req.body);

  try {
    const { text, source = "user" } = req.body;
    const username = req.user.username; 

    if (!text) {
      return res.status(400).json({ message: "text is required" });
    }

    
    const ml = await classifyPost(text);

    
    let label = ml?.label;

    if (!VALID_LABELS.includes(label)) {
      console.warn("Invalid ML label:", label, "→ using fallback");
      label = "road_damage"; 
    }

    
    const location = await extractLocation(text);

    const postData = {
      text,
      source,
      label: label,
      confidence: ml?.confidence || 0,
      location: {
        type: "Point",
        coordinates: [location.lng, location.lat],
      },
      locationName: location.name,
      city: location.city,
      state: location.state,
      username: username || "anonymous",
    };

    
    if (mongoose.connection.readyState === 1) {
      const saved = await PostModel.create(postData);

      // await sendAlertToAuthority(saved);

      return res.status(201).json({
        message: "Post created",
        post: formatPost(saved.toObject()),
      });
    }

    // fallback (if DB down)
    return res.status(503).json({
      message: "Database not connected",
    });

  } catch (err) {
    console.error("CreatePost Error:", err);
    return res.status(500).json({
      message: "Server error",
    });
  }
};


export const getPosts = async (req, res) => {
  console.log("Received getPosts request");

  try {
    if (mongoose.connection.readyState === 1) {
      const posts = await PostModel.find()
        .sort({ createdAt: -1 })
        .limit(50);

      return res.json(posts.map(p => formatPost(p.toObject())));
    }

    
    return res.json(getInMemoryPosts().map(formatPost));

  } catch (err) {
    console.error("GetPosts Error:", err);
    return res.status(500).json({
      message: "Server error",
    });
  }
};


export const getPostsByCityState = async (req, res) => {
  console.log("Received getPostsByCityState request with query:", req.query);

  try {
    const { city, state } = req.query;

    if (mongoose.connection.readyState === 1) {
      const posts = await PostModel.find({ city, state })
        .sort({ createdAt: -1 });

      return res.json(posts.map(p => formatPost(p.toObject())));
    }

    
    const filtered = getInMemoryPosts().filter(p => p.city === city);

    return res.json(filtered.map(formatPost));

  } catch (err) {
    console.error("GetPostsByCity Error:", err);
    return res.status(500).json({
      message: "Server error",
    });
  }
};