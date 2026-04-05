// backend/routes/stream.js
import express from "express";
import { streamLiveUpdates } from "../controllers/streamController.js";

const router = express.Router();

router.get("/live", streamLiveUpdates);

export default router;