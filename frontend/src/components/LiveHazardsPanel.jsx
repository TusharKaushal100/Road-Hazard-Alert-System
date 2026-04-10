import { useState, useEffect } from "react";

const LiveHazardsPanel = ({ isOpen, onClose }) => {
  const [hazards, setHazards] = useState([]);

  useEffect(() => {
    if (!isOpen) return;

    const eventSource = new EventSource("http://localhost:4000/api/v1/stream/live");

    eventSource.onmessage = (event) => {
      try {
        const newPost = JSON.parse(event.data);
        setHazards((prev) => [newPost, ...prev.slice(0, 19)]);
      } catch (e) {}
    };

    return () => eventSource.close();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed left-[256px] top-0 bottom-0 w-96 bg-white shadow-2xl border-l z-40 flex flex-col">
      <div className="px-5 py-4 border-b bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
          Live Hazards
        </div>
        <button onClick={onClose} className="text-3xl text-gray-400 hover:text-black">×</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {hazards.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            Waiting for live hazards from Assam...
          </div>
        ) : (
          hazards.map((h) => (
            <div key={h.id} className="bg-white border rounded-2xl p-4 shadow-sm">
              <div className="flex gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: h.color }}
                >
                  {h.label[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{h.username}</span>
                    <span className="text-gray-400 text-xs">
                      {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm mt-1 line-clamp-3">{h.text}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className="px-3 py-1 text-xs font-medium text-white rounded-full"
                      style={{ backgroundColor: h.color }}
                    >
                      {h.label}
                    </span>
                    <span className="text-xs text-gray-500 truncate">{h.location?.name}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LiveHazardsPanel;