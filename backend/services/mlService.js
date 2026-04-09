// backend/services/mlService.js
// Calls the Python Flask ML API on port 5001

import axios from "axios";

const ML_URL = process.env.ML_URL || "http://localhost:5001";

export async function classifyPost(text) {
  try {
    const res = await axios.post(`${ML_URL}/classify`, { text }, { timeout: 5000 });
    return {
      label:      res.data.label,
      confidence: res.data.confidence,
    };
  } catch (err) {
    console.error("ML service error:", err.message);
    return { label: "unknown", confidence: 0 };
  }
}
