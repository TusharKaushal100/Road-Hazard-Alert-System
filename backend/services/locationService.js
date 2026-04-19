// backend/services/locationService.js
// Pipeline: lookup table → NER → regex fallback → Nominatim geocode
// Falls back to center-of-India coordinates if everything fails.

import { extractLocationNER } from "./nerService.js";
import { geocodeLocation } from "./geocodeService.js";

// ─────────────────────────────────────────────────────────────────────────────
// Step 1A: Fast hardcoded lookup table for common Indian cities & landmarks.
// This runs BEFORE NER — it is instant, free, and very reliable.
// The table covers the most frequent place names found in the dataset.
// Add more entries here any time you need to fix a specific city.
// Format: "lowercase text to search for" → { name, lat, lng, city, state }
// ─────────────────────────────────────────────────────────────────────────────
const INDIA_PLACES = [
  // ── Assam cities ─────────────────────────────────────────────────
  { name: "Guwahati",           lat: 26.1445, lng: 91.7362,  city: "Guwahati",           state: "Assam" },
  { name: "Dispur",             lat: 26.1433, lng: 91.7898,  city: "Dispur",              state: "Assam" },
  { name: "Jorhat",             lat: 26.7509, lng: 94.2037,  city: "Jorhat",              state: "Assam" },
  { name: "Silchar",            lat: 24.8333, lng: 92.7789,  city: "Silchar",             state: "Assam" },
  { name: "Dibrugarh",         lat: 27.4728, lng: 94.9120,  city: "Dibrugarh",           state: "Assam" },
  { name: "Tezpur",             lat: 26.6338, lng: 92.7926,  city: "Tezpur",              state: "Assam" },
  { name: "Tinsukia",           lat: 27.4887, lng: 95.3558,  city: "Tinsukia",            state: "Assam" },
  { name: "Nagaon",             lat: 26.3500, lng: 92.6833,  city: "Nagaon",              state: "Assam" },
  { name: "Sivasagar",          lat: 26.9853, lng: 94.6366,  city: "Sivasagar",           state: "Assam" },
  { name: "Sibsagar",           lat: 26.9853, lng: 94.6366,  city: "Sivasagar",           state: "Assam" },
  { name: "Bongaigaon",         lat: 26.4773, lng: 90.5582,  city: "Bongaigaon",          state: "Assam" },
  { name: "Goalpara",           lat: 26.1716, lng: 90.6148,  city: "Goalpara",            state: "Assam" },
  { name: "Barpeta",            lat: 26.3226, lng: 91.0037,  city: "Barpeta",             state: "Assam" },
  { name: "Morigaon",           lat: 26.2486, lng: 92.3384,  city: "Morigaon",            state: "Assam" },
  { name: "Kamrup",             lat: 26.1445, lng: 91.7362,  city: "Guwahati",            state: "Assam" },
  { name: "Haflong",            lat: 25.1613, lng: 93.0166,  city: "Haflong",             state: "Assam" },
  { name: "Hailakandi",         lat: 24.6833, lng: 92.5667,  city: "Hailakandi",          state: "Assam" },
  { name: "Karimganj",          lat: 24.8647, lng: 92.3560,  city: "Karimganj",           state: "Assam" },
  { name: "Dhubri",             lat: 26.0200, lng: 89.9800,  city: "Dhubri",              state: "Assam" },
  { name: "Kokrajhar",          lat: 26.4009, lng: 90.2712,  city: "Kokrajhar",           state: "Assam" },
  { name: "Majuli",             lat: 26.9500, lng: 94.1500,  city: "Majuli",              state: "Assam" },
  { name: "Lakhimpur",          lat: 27.2355, lng: 94.1012,  city: "North Lakhimpur",     state: "Assam" },
  { name: "North Lakhimpur",    lat: 27.2355, lng: 94.1012,  city: "North Lakhimpur",     state: "Assam" },
  { name: "Hojai",              lat: 26.0044, lng: 92.8523,  city: "Hojai",               state: "Assam" },
  { name: "Golaghat",           lat: 26.5186, lng: 93.9668,  city: "Golaghat",            state: "Assam" },
  { name: "Biswanath",          lat: 26.7500, lng: 93.1500,  city: "Biswanath Chariali",  state: "Assam" },
  { name: "Biswanath Chariali", lat: 26.7500, lng: 93.1500,  city: "Biswanath Chariali",  state: "Assam" },
  { name: "Silapathar",         lat: 27.5500, lng: 94.2167,  city: "Silapathar",          state: "Assam" },
  { name: "Diphu",              lat: 25.8442, lng: 93.4326,  city: "Diphu",               state: "Assam" },
  { name: "Nalbari",            lat: 26.4450, lng: 91.4376,  city: "Nalbari",             state: "Assam" },
  { name: "Rangapara",          lat: 26.8522, lng: 92.6559,  city: "Rangapara",           state: "Assam" },
  { name: "Udalguri",           lat: 26.7542, lng: 92.1044,  city: "Udalguri",            state: "Assam" },
  { name: "Digboi",             lat: 27.3869, lng: 95.6224,  city: "Digboi",              state: "Assam" },
  { name: "Numaligarh",         lat: 26.6670, lng: 93.6670,  city: "Numaligarh",          state: "Assam" },
  { name: "Lumding",            lat: 25.7500, lng: 93.1667,  city: "Lumding",             state: "Assam" },
  { name: "Dhemaji",            lat: 27.4805, lng: 94.5691,  city: "Dhemaji",             state: "Assam" },
  { name: "Pathsala",           lat: 26.5083, lng: 91.1692,  city: "Pathsala",            state: "Assam" },
  { name: "Gohpur",             lat: 26.8833, lng: 93.6000,  city: "Gohpur",              state: "Assam" },
  { name: "Baksa",              lat: 26.6667, lng: 91.2000,  city: "Baksa",               state: "Assam" },
  { name: "Dima Hasao",         lat: 25.1613, lng: 93.0166,  city: "Haflong",             state: "Assam" },
  { name: "Karbi Anglong",      lat: 25.8442, lng: 93.4326,  city: "Diphu",               state: "Assam" },
  { name: "Cachar",             lat: 24.8333, lng: 92.7789,  city: "Silchar",             state: "Assam" },
  { name: "Kaziranga",          lat: 26.5775, lng: 93.1711,  city: "Kaziranga",           state: "Assam" },
  { name: "Shillong",           lat: 25.5788, lng: 91.8933,  city: "Shillong",            state: "Meghalaya" },
  { name: "Khanapara",          lat: 26.1100, lng: 91.8000,  city: "Guwahati",            state: "Assam" },
  { name: "Beltola",            lat: 26.1200, lng: 91.7800,  city: "Guwahati",            state: "Assam" },
  { name: "Ganeshguri",         lat: 26.1600, lng: 91.7700,  city: "Guwahati",            state: "Assam" },
  { name: "Jalukbari",          lat: 26.1700, lng: 91.6900,  city: "Guwahati",            state: "Assam" },
  { name: "Noonmati",           lat: 26.1800, lng: 91.7600,  city: "Guwahati",            state: "Assam" },
  { name: "Maligaon",           lat: 26.1600, lng: 91.7000,  city: "Guwahati",            state: "Assam" },
  { name: "Narengi",            lat: 26.2000, lng: 91.8200,  city: "Guwahati",            state: "Assam" },
  { name: "Hajo",               lat: 26.2449, lng: 91.5211,  city: "Hajo",                state: "Assam" },

  // ── Major Indian cities ───────────────────────────────────────────
  { name: "Mumbai",             lat: 19.0760, lng: 72.8777,  city: "Mumbai",              state: "Maharashtra" },
  { name: "Delhi",              lat: 28.6139, lng: 77.2090,  city: "Delhi",               state: "Delhi" },
  { name: "New Delhi",          lat: 28.6139, lng: 77.2090,  city: "New Delhi",           state: "Delhi" },
  { name: "Bangalore",          lat: 12.9716, lng: 77.5946,  city: "Bangalore",           state: "Karnataka" },
  { name: "Bengaluru",          lat: 12.9716, lng: 77.5946,  city: "Bangalore",           state: "Karnataka" },
  { name: "Chennai",            lat: 13.0827, lng: 80.2707,  city: "Chennai",             state: "Tamil Nadu" },
  { name: "Kolkata",            lat: 22.5726, lng: 88.3639,  city: "Kolkata",             state: "West Bengal" },
  { name: "Hyderabad",          lat: 17.3850, lng: 78.4867,  city: "Hyderabad",           state: "Telangana" },
  { name: "Pune",               lat: 18.5204, lng: 73.8567,  city: "Pune",                state: "Maharashtra" },
  { name: "Ahmedabad",          lat: 23.0225, lng: 72.5714,  city: "Ahmedabad",           state: "Gujarat" },
  { name: "Jaipur",             lat: 26.9124, lng: 75.7873,  city: "Jaipur",              state: "Rajasthan" },
  { name: "Lucknow",            lat: 26.8467, lng: 80.9462,  city: "Lucknow",             state: "Uttar Pradesh" },
  { name: "Kanpur",             lat: 26.4499, lng: 80.3319,  city: "Kanpur",              state: "Uttar Pradesh" },
  { name: "Nagpur",             lat: 21.1458, lng: 79.0882,  city: "Nagpur",              state: "Maharashtra" },
  { name: "Indore",             lat: 22.7196, lng: 75.8577,  city: "Indore",              state: "Madhya Pradesh" },
  { name: "Bhopal",             lat: 23.2599, lng: 77.4126,  city: "Bhopal",              state: "Madhya Pradesh" },
  { name: "Visakhapatnam",      lat: 17.6868, lng: 83.2185,  city: "Visakhapatnam",       state: "Andhra Pradesh" },
  { name: "Patna",              lat: 25.5941, lng: 85.1376,  city: "Patna",               state: "Bihar" },
  { name: "Vadodara",           lat: 22.3072, lng: 73.1812,  city: "Vadodara",            state: "Gujarat" },
  { name: "Surat",              lat: 21.1702, lng: 72.8311,  city: "Surat",               state: "Gujarat" },
  { name: "Coimbatore",         lat: 11.0168, lng: 76.9558,  city: "Coimbatore",          state: "Tamil Nadu" },
  { name: "Bhubaneswar",        lat: 20.2961, lng: 85.8245,  city: "Bhubaneswar",         state: "Odisha" },
  { name: "Kochi",              lat: 9.9312,  lng: 76.2673,  city: "Kochi",               state: "Kerala" },
  { name: "Thiruvananthapuram", lat: 8.5241,  lng: 76.9366,  city: "Thiruvananthapuram",  state: "Kerala" },
  { name: "Chandigarh",         lat: 30.7333, lng: 76.7794,  city: "Chandigarh",          state: "Punjab" },
  { name: "Dehradun",           lat: 30.3165, lng: 78.0322,  city: "Dehradun",            state: "Uttarakhand" },
  { name: "Ranchi",             lat: 23.3441, lng: 85.3096,  city: "Ranchi",              state: "Jharkhand" },
  { name: "Raipur",             lat: 21.2514, lng: 81.6296,  city: "Raipur",              state: "Chhattisgarh" },
  { name: "Amritsar",           lat: 31.6340, lng: 74.8723,  city: "Amritsar",            state: "Punjab" },
  { name: "Jabalpur",           lat: 23.1815, lng: 79.9864,  city: "Jabalpur",            state: "Madhya Pradesh" },
  { name: "Agra",               lat: 27.1767, lng: 78.0081,  city: "Agra",                state: "Uttar Pradesh" },
  { name: "Varanasi",           lat: 25.3176, lng: 82.9739,  city: "Varanasi",            state: "Uttar Pradesh" },
  { name: "Meerut",             lat: 28.9845, lng: 77.7064,  city: "Meerut",              state: "Uttar Pradesh" },
  { name: "Ludhiana",           lat: 30.9010, lng: 75.8573,  city: "Ludhiana",            state: "Punjab" },
  { name: "Ghaziabad",          lat: 28.6692, lng: 77.4538,  city: "Ghaziabad",           state: "Uttar Pradesh" },
  { name: "Nashik",             lat: 19.9975, lng: 73.7898,  city: "Nashik",              state: "Maharashtra" },
  { name: "Faridabad",          lat: 28.4089, lng: 77.3178,  city: "Faridabad",           state: "Haryana" },
  { name: "Rajkot",             lat: 22.3039, lng: 70.8022,  city: "Rajkot",              state: "Gujarat" },
  { name: "Madurai",            lat: 9.9252,  lng: 78.1198,  city: "Madurai",             state: "Tamil Nadu" },
  { name: "Gwalior",            lat: 26.2183, lng: 78.1828,  city: "Gwalior",             state: "Madhya Pradesh" },
  { name: "Vijayawada",         lat: 16.5062, lng: 80.6480,  city: "Vijayawada",          state: "Andhra Pradesh" },
];


const PLACE_INDEX = INDIA_PLACES.map(p => ({
  ...p,
  key: p.name.toLowerCase(),
}));

// Scan text for any known place name. Returns the best match or null.
// "Best" = the longest matching name found (so "North Lakhimpur" beats "Lakhimpur")
function lookupTable(text) {
  const lower = text.toLowerCase();
  let best = null;

  for (const place of PLACE_INDEX) {
    if (lower.includes(place.key)) {
      // Prefer longer matches (more specific)
      if (!best || place.key.length > best.key.length) {
        best = place;
      }
    }
  }

  return best || null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1B: Regex fallback — extracts text after "near/in/at" as a last resort
// ─────────────────────────────────────────────────────────────────────────────
function regexFallback(text) {
  const patterns = [
    /near\s+([A-Za-z][A-Za-z0-9\s,]{2,40})/i,
    /\bin\s+([A-Z][A-Za-z\s]{2,30})/,   // capital letter after "in" (more precise)
    /at\s+([A-Za-z][A-Za-z0-9\s,]{2,30})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      // Clean up trailing noise (hashtags, punctuation, common words)
      const raw = match[1]
        .replace(/#\S+/g, "")
        .replace(/\s+(mein|pe|ka|ki|ke|aur|se|ko)\b.*/i, "")
        .trim();
      if (raw.length > 2) return raw;
    }
  }
  return null;
}


export async function extractLocation(text) {
  try {
    // ── Step 1: Try the lookup table first (fastest, most reliable) ──
    const tableMatch = lookupTable(text);
    if (tableMatch) {
      console.log(`Location (table): ${tableMatch.name}`);
      return {
        name:  tableMatch.name,
        lat:   tableMatch.lat,
        lng:   tableMatch.lng,
        city:  tableMatch.city,
        state: tableMatch.state,
      };
    }

    // ── Step 2: Try NER (spaCy Python service) ───────────────────────
    let locationName = await extractLocationNER(text);

    // ── Step 3: Regex fallback if NER returned nothing ───────────────
    if (!locationName) {
      console.log("NER found nothing → trying regex fallback");
      locationName = regexFallback(text);
    }

    if (!locationName) {
      throw new Error("No location found in text");
    }

    // ── Step 4: Geocode the extracted name via Nominatim ─────────────
    const geo = await geocodeLocation(locationName);

    if (!geo) {
      throw new Error(`Geocoding failed for: ${locationName}`);
    }

    // Parse state from Nominatim display_name (it's usually in the address string)
    const stateName = parseStateFromDisplayName(geo.displayName);

    console.log(`Location (NER+geocode): ${locationName} → ${geo.lat}, ${geo.lng}`);
    return {
      name:  locationName,
      lat:   geo.lat,
      lng:   geo.lng,
      city:  geo.displayName?.split(",")[0]?.trim() || locationName,
      state: stateName,
    };

  } catch (err) {
    console.error("Location pipeline failed:", err.message);
    // Hard fallback: center of India
    return {
      name:  "India",
      lat:   20.5937,
      lng:   78.9629,
      city:  "India",
      state: "Unknown",
    };
  }
}

// Pull state name out of Nominatim's display_name string
// e.g. "Connaught Place, New Delhi, Delhi, 110001, India" → "Delhi"
function parseStateFromDisplayName(displayName) {
  if (!displayName) return "Unknown";
  const parts = displayName.split(",").map(p => p.trim());
  // Nominatim puts state near the end, before the country
  if (parts.length >= 3) {
    return parts[parts.length - 2] || "Unknown";
  }
  return "Unknown";
}