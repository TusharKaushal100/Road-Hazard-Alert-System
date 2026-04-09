// backend/controllers/mapController.js
import { PostModel } from "../config/db.js";
import { getInMemoryPosts } from "../services/mockIngestionService.js";
import mongoose from "mongoose";

const LABEL_COLORS = {
  pothole:"#ef4444", flood:"#3b82f6", accident:"#f97316",
  traffic:"#eab308", road_damage:"#8b5cf6", animal:"#22c55e",
};

function formatPost(p) {
  const coords = p.location?.coordinates || [91.7, 26.1];
  return {
    id:         p._id || p.id,
    text:       p.text,
    label:      p.label,
    confidence: p.confidence,
    color:      LABEL_COLORS[p.label] || "#6b7280",
    username:   p.username || "anonymous",
    created_at: p.createdAt || new Date(),
    location: {
      name: p.locationName || "Assam",
      lat:  p.location?.lat  || coords[1],
      lon:  p.location?.lon  || coords[0],
    },
  };
}

// GET /api/v1/map/hazards
export const getHazardsForMap = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const hazards    = await PostModel.find({
        label:     { $nin: ["none", "unknown"] },
        createdAt: { $gte: twoDaysAgo },
      }).sort({ createdAt: -1 }).limit(100);

      return res.json(hazards.map(p => formatPost(p.toObject())));
    }

    // No DB: return in-memory posts
    const hazards = getInMemoryPosts().filter(p => !["none","unknown"].includes(p.label));
    res.json(hazards.map(formatPost));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
