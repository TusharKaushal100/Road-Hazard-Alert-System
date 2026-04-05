import React from 'react';

export default function FilterBar({ hazards, activeFilter, setActiveFilter, labelConfig }) {
  const counts = hazards.reduce((acc, h) => {
    acc[h.label] = (acc[h.label] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="border-b border-gray-800 px-4 py-2 flex-shrink-0">
      <div className="max-w-7xl mx-auto flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setActiveFilter('all')}
          className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-colors
            ${activeFilter === 'all'
              ? 'bg-white text-gray-900'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}
        >
          All ({hazards.length})
        </button>

        {Object.entries(labelConfig).map(([key, cfg]) =>
          counts[key] ? (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-colors
                ${activeFilter === key
                  ? `${cfg.bg} text-white`
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}
            >
              {cfg.icon} {cfg.text} ({counts[key]})
            </button>
          ) : null
        )}
      </div>
    </div>
  );
}
