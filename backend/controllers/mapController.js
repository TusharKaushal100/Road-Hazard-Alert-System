// backend/controllers/mapController.js
import { PostModel } from "../models/Post.js";

export const getHazardsForMap = async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query; // radius in km

    const hazards = await PostModel.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: radius * 1000
        }
      },
      createdAt: { $gte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } // last 2 days
    });

    res.json(hazards);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};