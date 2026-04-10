import { useState, useEffect } from "react";

const LiveHazardsPanel = ({ isOpen, onClose }) => {
  const [hazards, setHazards] = useState([]);

  useEffect(() => {
    if (!isOpen) return;

    // Connect to backend SSE (Server-Sent Events) - already implemented in your backend
    const eventSource = new EventSource("http://localhost:4000/api/v1/stream/live");

    eventSource.onmessage = (event) => {
      const newPost = JSON.parse(event.data);
      setHazards((prev) => [newPost, ...prev.slice(0, 19)]); // keep latest 20
    };

    eventSource.onerror = () => {
      console.log("Live stream disconnected");
    };

    return () => eventSource.close();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed left-64 top-0 bottom-0 w-96 bg-white shadow-2xl border-l z-50 flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center justify-between bg-gray-50">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
          Live Hazards
        </h3>
        <button
          onClick={onClose}
          className="text-3xl leading-none text-gray-400 hover:text-gray-600"
        >
          &times;
        </button>
      </div>

      {/* Live feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {hazards.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            Waiting for live hazards...
          </div>
        ) : (
          hazards.map((hazard) => (
            <div
              key={hazard.id}
              className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: hazard.color }}
                >
                  {hazard.label[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium text-sm">{hazard.username}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(hazard.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm mt-1 line-clamp-2">{hazard.text}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="px-3 py-1 text-xs font-medium rounded-full text-white"
                      style={{ backgroundColor: hazard.color }}>
                      {hazard.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {hazard.location.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer hint */}
      <div className="px-5 py-3 text-xs text-gray-400 border-t text-center">
        Live from Assam • Updates every few seconds
      </div>
    </div>
  );
};

export default LiveHazardsPanel;