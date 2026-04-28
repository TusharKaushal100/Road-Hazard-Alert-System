import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { classifyPost } from "./mlService.js";
import { extractLocation } from "./locationService.js";
import { sendAlertToAuthority } from "./emailService.js";
import { PostModel } from "../config/db.js";
import mongoose from "mongoose";

const __dirname = dirname(fileURLToPath(import.meta.url));

const LABEL_COLORS = {
  pothole: "#ef4444", flood: "#3b82f6", accident: "#f97316",
  traffic: "#eab308", road_damage: "#8b5cf6", animal: "#22c55e",
};

const FAKE_USERS = [
  "assam_roads_watch", "guwahati_local", "northeast_news",
  "road_warrior_ne", "barak_updates", "jorhat_diaries",
  "silchar_speaks", "tezpur_today", "dibrugarh_daily",
  "india_roads_alert", "pothole_patrol", "road_hazard_india",
  "highway_watch", "traffic_india", "flood_alert_ne",
];

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function loadDataset() {
  const csvPath = join(__dirname, "../../ml/data/dataset_final.csv");
  const lines = readFileSync(csvPath, "utf-8").trim().split("\n");
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const lastComma = lines[i].lastIndexOf(",");
    if (lastComma === -1) continue;
    const text = lines[i].slice(0, lastComma).replace(/^"|"$/g, "").trim();
    const label = lines[i].slice(lastComma + 1).trim();
    if (text && label && label !== "none") rows.push({ text, label });
  }
  return rows;
}

let dataset = [];
let datasetIndex = 0;

try {
  dataset = loadDataset();
  dataset = dataset.sort(() => Math.random() - 0.5);
  console.log(`Mock ingestion: loaded ${dataset.length} posts (none-label excluded)`);
} catch (e) {
  console.error("Could not load dataset:", e.message);
}

const inMemoryPosts = [];
export function getInMemoryPosts() { return inMemoryPosts; }

const clients = new Set();
export function addSSEClient(emitter) { clients.add(emitter); }
export function removeSSEClient(emitter) { clients.delete(emitter); }

function broadcastToAll(post) {
  const data = `data: ${JSON.stringify(post)}\n\n`;
  for (const emit of clients) {
    try { emit(data); } catch (e) { clients.delete(emit); }
  }
  if (global.liveUpdateEmitter) {
    try { global.liveUpdateEmitter(post); } catch (e) {}
  }
}

async function ingestOne() {
  if (!dataset.length) return;

  const row = dataset[datasetIndex % dataset.length];
  datasetIndex++;
  if (datasetIndex >= dataset.length) {
    datasetIndex = 0;
    dataset = dataset.sort(() => Math.random() - 0.5);
  }

  let ml;
  try {
    ml = await classifyPost(row.text);
  } catch (e) {
    ml = { label: row.label, confidence: 0.8 };
  }

  if (!ml.label || ml.label === "none" || ml.label === "unknown") return;

  let location;
  try {
    location = await extractLocation(row.text);
  } catch (e) {
    location = { name: "India", lat: 20.5937, lng: 78.9629, city: "India", state: "Unknown" };
  }

  const postData = {
    text: row.text,
    label: ml.label,
    confidence: ml.confidence,
    location: { type: "Point", coordinates: [location.lng, location.lat] },
    locationName: location.name,
    city: location.city,
    state: location.state,
    source: "mock",
    username: randomItem(FAKE_USERS),
  };

  const broadcastPayload = {
    ...postData,
    createdAt: new Date(),
    location: { name: location.name, lat: location.lat, lon: location.lng },
    color: LABEL_COLORS[ml.label] || "#6b7280",
  };

  if (mongoose.connection.readyState === 1) {
    try {
      const saved = await PostModel.create(postData);
      sendAlertToAuthority(saved).catch(() => {});
      broadcastPayload.id = saved._id;
      broadcastPayload._id = saved._id;
      broadcastToAll(broadcastPayload);
    } catch (e) {
      console.error("DB save error:", e.message);
    }
  } else {
    broadcastPayload.id = `mem_${Date.now()}`;
    broadcastPayload._id = broadcastPayload.id;
    inMemoryPosts.unshift(broadcastPayload);
    if (inMemoryPosts.length > 200) inMemoryPosts.pop();
    broadcastToAll(broadcastPayload);
  }
}

export function startMockIngestion() {
  console.log("Mock ingestion started — first burst in 2s, then every 15s");
  setTimeout(async () => {
    for (let i = 0; i < 8; i++) {
      await new Promise(r => setTimeout(r, i * 1200));
      ingestOne().catch(e => console.error("Ingest error:", e.message));
    }
  }, 2000);

  setInterval(() => {
    ingestOne().catch(e => console.error("Ingest error:", e.message));
  }, 15000);
}