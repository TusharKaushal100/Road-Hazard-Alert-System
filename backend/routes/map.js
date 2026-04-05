// backend/routes/map.js
import express from "express";
import { getHazardsForMap } from "../controllers/mapController.js";

const router = express.Router();

router.get("/hazards", getHazardsForMap);

export default router;