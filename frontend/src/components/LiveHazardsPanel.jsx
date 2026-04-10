import { useState, useEffect } from "react";
import axios from "axios";

const LABEL_COLORS = {
  pothole:     "#ef4444",
  flood:       "#3b82f6",
  accident:    "#f97316",
  traffic:     "#eab308",
  road_damage: "#8b5cf6",
  animal:      "#22c55e",
};

// One hazard card - looks like a tweet/comment
function HazardCard({ h }) {
  const color = h.color || LABEL_COLORS[h.label] || "#6b7280";
  const letter = h.label ? h.label[0].toUpperCase() : "?";
  const time = h.created_at
    ? new Date(h.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition">
      <div className="flex gap-3">

        {/* Avatar circle */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ backgroundColor: color }}
        >
          {letter}
        </div>

        <div className="flex-1 min-w-0">
          {/* Username + time */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-800">@{h.username || "anonymous"}</span>
            <span className="text-xs text-gray-400">{time}</span>
          </div>

          {/* Hazard text */}
          <p className="text-sm text-gray-700 mt-1 leading-relaxed line-clamp-3">{h.text}</p>

          {/* Badge + location */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span
              className="px-3 py-1 text-xs font-semibold text-white rounded-full"
              style={{ backgroundColor: color }}
            >
              {h.label}
            </span>
            {h.location?.name && (
              <span className="text-xs text-gray-500">📍 {h.location.name}</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// The full live hazards panel - takes over the main content area
const LiveHazardsPanel = ({ onClose }) => {
  const [hazards, setHazards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Step 1: Load existing posts from DB first
    axios.get("http://localhost:4000/api/v1/posts")
      .then((res) => {
        setHazards(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Failed to load posts:", err);
      })
      .finally(() => {
        setLoading(false);
      });

    // Step 2: Also listen for brand new ones via SSE
    const eventSource = new EventSource("http://localhost:4000/api/v1/stream/live");

    eventSource.onmessage = (event) => {
      try {
        const newPost = JSON.parse(event.data);
        // Prepend new posts to top, keep max 50
        setHazards((prev) => [newPost, ...prev.slice(0, 49)]);
      } catch (e) {
        // ignore malformed data
      }
    };

    // Cleanup SSE when panel closes
    return () => eventSource.close();
  }, []);

  return (
    // Takes the full main content area — no fixed, no overlay
    <div className="h-full flex flex-col bg-white">

      {/* Header */}
      <div className="px-6 py-4 border-b bg-white flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Pulsing green dot */}
          <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse inline-block"></span>
          <h2 className="text-lg font-semibold text-gray-800">Live Hazards</h2>
          {!loading && (
            <span className="text-sm text-gray-400">({hazards.length} reports)</span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 text-3xl leading-none"
        >
          ×
        </button>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto p-6">

        {/* Loading state */}
        {loading && (
          <div className="text-center text-gray-400 py-16 text-sm">
            Loading hazards...
          </div>
        )}

        {/* Empty state */}
        {!loading && hazards.length === 0 && (
          <div className="text-center text-gray-400 py-16">
            <div className="text-5xl mb-4">📡</div>
            <p className="text-sm">No hazards yet. Waiting for live updates...</p>
          </div>
        )}

        {/* Cards grid - 2 columns on wide screens, 1 on narrow */}
        {!loading && hazards.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 max-w-5xl mx-auto">
            {hazards.map((h, i) => (
              <HazardCard key={h.id || h._id || i} h={h} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default LiveHazardsPanel;