// backend/services/mockIngestionService.js
// Reads dataset rows and processes them as if they came from Twitter/Reddit.
// This replaces the real twitterService.js / redditService.js since those APIs are paid.
// Runs every 30 seconds to simulate live ingestion.

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { classifyPost } from "./mlService.js";
import { extractLocation } from "./locationService.js";
import { sendAlertToAuthority } from "./emailService.js";
import { PostModel } from "../config/db.js";
import mongoose from "mongoose";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load dataset once ──────────────────────────────────────────────
function loadDataset() {
  const csvPath = join(__dirname, "../../ml/data/dataset_final.csv");
  const lines   = readFileSync(csvPath, "utf-8").trim().split("\n");
  const rows    = [];
  for (let i = 1; i < lines.length; i++) {
    const lastComma = lines[i].lastIndexOf(",");
    if (lastComma === -1) continue;
    rows.push({
      text:  lines[i].slice(0, lastComma).replace(/^"|"$/g, "").trim(),
      label: lines[i].slice(lastComma + 1).trim(),
    });
  }
  return rows;
}

let dataset = [];
try {
  dataset = loadDataset();
  console.log(`Mock ingestion: loaded ${dataset.length} posts`);
} catch (e) {
  console.error("Could not load dataset:", e.message);
}

const FAKE_USERS = [
  "assam_roads_watch", "guwahati_local", "northeast_news",
  "road_warrior_ne",   "barak_updates",  "jorhat_diaries",
  "silchar_speaks",    "tezpur_today",   "dibrugarh_daily",
];

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// In-memory store when MongoDB is not connected
const inMemoryPosts = [];

export function getInMemoryPosts() { return inMemoryPosts; }

async function ingestOne() {
  if (!dataset.length) return;

  const row      = randomItem(dataset);
  const ml       = await classifyPost(row.text);
  const location = extractLocation(row.text);

  if (ml.label === "none" || ml.label === "unknown") return;

  const postData = {
    text:         row.text,
    label:        ml.label,
    confidence:   ml.confidence,
    location: {
      type:        "Point",
      coordinates: [location.lng, location.lat],
    },
    locationName: location.name,
    city:         location.city,
    state:        location.state,
    source:       "mock",
    username:     randomItem(FAKE_USERS),
  };

  // Save to MongoDB if connected, otherwise keep in memory
  if (mongoose.connection.readyState === 1) {
    try {
      const saved = await PostModel.create(postData);
      await sendAlertToAuthority(saved);

      // Broadcast via SSE if a client is connected
      if (global.liveUpdateEmitter) {
        const doc = saved.toObject();
        global.liveUpdateEmitter({
          ...doc,
          id:       doc._id,
          location: { name: location.name, lat: location.lat, lon: location.lng },
          color:    LABEL_COLORS[ml.label] || "#6b7280",
        });
      }
    } catch (e) {
      console.error("DB save error:", e.message);
    }
  } else {
    // No DB — store in memory (last 100)
    const entry = {
      ...postData,
      _id:        `mem_${Date.now()}_${Math.random()}`,
      id:         `mem_${Date.now()}_${Math.random()}`,
      createdAt:  new Date(),
      location:   { name: location.name, lat: location.lat, lon: location.lng },
      color:      LABEL_COLORS[ml.label] || "#6b7280",
    };
    inMemoryPosts.unshift(entry);
    if (inMemoryPosts.length > 100) inMemoryPosts.pop();

    if (global.liveUpdateEmitter) global.liveUpdateEmitter(entry);
  }
}

const LABEL_COLORS = {
  pothole:     "#ef4444",
  flood:       "#3b82f6",
  accident:    "#f97316",
  traffic:     "#eab308",
  road_damage: "#8b5cf6",
  animal:      "#22c55e",
};

export function startMockIngestion() {
  console.log("Starting mock ingestion (every 30s)...");
  // Ingest a few immediately on startup
  setTimeout(() => { for (let i = 0; i < 10; i++) setTimeout(ingestOne, i * 800); }, 1000);
  // Then every 30 seconds
  setInterval(ingestOne, 30000);
}
