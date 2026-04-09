import axios from "axios";

const cache = new Map();

export async function geocodeLocation(locationName) {
  try {
    if (cache.has(locationName)) {
      return cache.get(locationName);
    }

    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: locationName,
          format: "json",
          limit: 1
        },
        headers: {
          "User-Agent": "road-hazard-system"
        }
      }
    );

    if (!response.data.length) return null;

    const place = response.data[0];

    const result = {
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
      displayName: place.display_name
    };

    cache.set(locationName, result);

    return result;

  } catch (err) {
    console.error("Geocode error:", err.message);
    return null;
  }
}