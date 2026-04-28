import { useState, useEffect } from "react";
import axios from "axios";

const LABEL_COLORS = {
  pothole: "#ef4444", flood: "#3b82f6", accident: "#f97316",
  traffic: "#eab308", road_damage: "#8b5cf6", animal: "#22c55e",
};

function HazardCard({ h }) {
  const color = h.color || LABEL_COLORS[h.label] || "#6b7280";
  const time = h.created_at
    ? new Date(h.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";
  return (
    <div
      className="rounded-2xl p-4 border transition hover:shadow-md"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="flex gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ backgroundColor: color }}
        >
          {h.label ? h.label[0].toUpperCase() : "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>@{h.username || "anonymous"}</span>
            <span className="text-xs" style={{ color: "var(--text2)" }}>{time}</span>
          </div>
          <p className="text-sm mt-1 leading-relaxed line-clamp-3" style={{ color: "var(--text)" }}>{h.text}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-semibold text-white rounded-full" style={{ backgroundColor: color }}>
              {h.label}
            </span>
            {h.location?.name && (
              <span className="text-xs" style={{ color: "var(--text2)" }}>📍 {h.location.name}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const LiveHazardsPanel = ({ onClose }) => {
  const [hazards, setHazards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:4000/api/v1/posts")
      .then((res) => setHazards(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));

    const eventSource = new EventSource("http://localhost:4000/api/v1/stream/live");
    eventSource.onmessage = (event) => {
      try {
        const newPost = JSON.parse(event.data);
        setHazards((prev) => [newPost, ...prev.slice(0, 49)]);
      } catch (e) {}
    };
    return () => eventSource.close();
  }, []);

  return (
    <div className="h-full flex flex-col" style={{ background: "var(--bg)" }}>
      <div
        className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0"
        style={{ background: "var(--topbar)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse inline-block" />
          <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>Live Hazards</h2>
          {!loading && (
            <span className="text-sm" style={{ color: "var(--text2)" }}>({hazards.length} reports)</span>
          )}
        </div>
        <button onClick={onClose} className="text-3xl leading-none" style={{ color: "var(--text2)" }}>×</button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading && (
          <div className="text-center py-16 text-sm" style={{ color: "var(--text2)" }}>Loading hazards...</div>
        )}
        {!loading && hazards.length === 0 && (
          <div className="text-center py-16" style={{ color: "var(--text2)" }}>
            <div className="text-5xl mb-4">📡</div>
            <p className="text-sm">Waiting for live hazards...</p>
          </div>
        )}
        {!loading && hazards.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 max-w-5xl mx-auto">
            {hazards.map((h, i) => <HazardCard key={h.id || h._id || i} h={h} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveHazardsPanel;