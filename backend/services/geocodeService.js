// backend/services/geocodeService.js
// Calls Nominatim (OpenStreetMap) to turn a place name into coordinates.
// Results are cached so the same name is never looked up twice.

import axios from "axios";

const cache = new Map();

export async function geocodeLocation(locationName) {
  try {
    // Return cached result if we've seen this name before
    if (cache.has(locationName)) {
      return cache.get(locationName);
    }

    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q:            locationName,
          format:       "json",
          limit:        1,
          countrycodes: "in",   // India only — stops "Haflong" matching somewhere in Europe
          addressdetails: 1,
        },
        headers: {
          // Nominatim requires a real User-Agent string
          "User-Agent": "RoadHazardAlertSystem/1.0 (road-hazard-project)",
        },
        timeout: 5000,
      }
    );

    if (!response.data || response.data.length === 0) {
      console.log(`Nominatim: no result for "${locationName}"`);
      cache.set(locationName, null);
      return null;
    }

    const place = response.data[0];

    const result = {
      lat:         parseFloat(place.lat),
      lng:         parseFloat(place.lon),
      displayName: place.display_name,
    };

    // Cache so we don't hit Nominatim again for the same name
    cache.set(locationName, result);

    return result;

  } catch (err) {
    console.error("Geocode error:", err.message);
    return null;
  }
}