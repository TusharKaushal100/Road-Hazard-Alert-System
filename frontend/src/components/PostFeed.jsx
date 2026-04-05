import React, { useRef, useEffect } from 'react';

export default function PostFeed({ hazards, selected, setSelected, labelConfig, loading }) {
  const selectedRef = useRef(null);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selected]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-3xl mb-2 animate-spin">⚙️</div>
          <p className="text-sm">Classifying posts via ML model…</p>
        </div>
      </div>
    );
  }

  if (hazards.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
        No hazards match this filter.
      </div>
    );
  }

  return (
    <>
      <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-800 flex-shrink-0">
        {hazards.length} hazard{hazards.length !== 1 ? 's' : ''} · click a card to fly to it on the map
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-gray-800">
        {hazards.map(h => {
          const isSelected = selected?.id === h.id;
          const cfg = labelConfig[h.label] || { text: h.label, icon: '📍', bg: 'bg-gray-500' };
          return (
            <div
              key={h.id}
              ref={isSelected ? selectedRef : null}
              onClick={() => setSelected(h)}
              className={`px-4 py-3 cursor-pointer transition-colors
                ${isSelected ? 'bg-gray-800' : 'hover:bg-gray-800/50'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${cfg.bg}`}>
                  {cfg.icon} {cfg.text}
                </span>
                <span className="text-xs text-gray-400">@{h.username}</span>
                <span className="ml-auto text-xs text-gray-500">
                  {Math.round(h.confidence * 100)}%
                </span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed line-clamp-2">{h.text}</p>
              <div className="flex gap-3 mt-1 text-xs text-gray-500">
                <span>📍 {h.location.name}</span>
                <span>{new Date(h.created_at).toLocaleTimeString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
