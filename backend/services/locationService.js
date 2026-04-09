import { extractLocationNER } from "./nerService.js";
import { geocodeLocation } from "./geocodeService.js";

// fallback extraction for difficult cases
function extractFallback(text) {
  const patterns = [
    /near ([A-Za-z0-9\s,]+)/i,
    /in ([A-Za-z0-9\s,]+)/i,
    /at ([A-Za-z0-9\s,]+)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }

  return null;
}

export async function extractLocation(text) {
  try {
    // Step 1: NER
    let locationName = await extractLocationNER(text);

    // Step 2: fallback if NER fails
    if (!locationName) {
      console.log("NER failed → using fallback");
      locationName = extractFallback(text);
    }

    if (!locationName) {
      throw new Error("No location found");
    }

    // Step 3: Geocode
    const geo = await geocodeLocation(locationName);

    if (!geo) {
      throw new Error("Geocoding failed");
    }

    return {
      name: locationName,
      lat: geo.lat,
      lng: geo.lng,
      city: geo.displayName,
      state: "Unknown"
    };

  } catch (err) {
    console.error("Location pipeline error:", err.message);

    return {
      name: "Unknown",
      lat: 20.5937,
      lng: 78.9629,
      city: "India",
      state: "Unknown"
    };
  }
}