import axios from "axios";

export async function extractLocationNER(text) {
  try {
    const response = await axios.get("http://127.0.0.1:8000/extract-location", {
      params: { text },
      timeout: 3000
    });

    return response.data.location;

  } catch (err) {
    console.error("NER service error:", err.message);
    return null;
  }
}