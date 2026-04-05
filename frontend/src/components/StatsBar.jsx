import React from 'react';

export default function StatsBar({ hazards, labelConfig }) {
  const counts  = hazards.reduce((acc, h) => { acc[h.label] = (acc[h.label]||0)+1; return acc; }, {});
  const topEntry = Object.entries(counts).sort((a,b) => b[1]-a[1])[0];
  const avgConf  = hazards.length
    ? Math.round(hazards.reduce((s,h) => s+h.confidence, 0) / hazards.length * 100)
    : 0;
  const locations = new Set(hazards.map(h => h.location.name)).size;

  return (
    <div className="border-b border-gray-800 px-4 py-3 flex-shrink-0">
      <div className="max-w-7xl mx-auto grid grid-cols-4 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5">
          <div className="text-xl font-bold">{hazards.length}</div>
          <div className="text-xs text-gray-400">Hazards detected</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5">
          <div className="text-xl font-bold">{avgConf}%</div>
          <div className="text-xs text-gray-400">Avg confidence</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5">
          <div className="text-xl font-bold">
            {topEntry ? labelConfig[topEntry[0]]?.icon : '—'}
          </div>
          <div className="text-xs text-gray-400">
            Top: {topEntry ? labelConfig[topEntry[0]]?.text : '—'} ({topEntry?.[1] || 0})
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5">
          <div className="text-xl font-bold">{locations}</div>
          <div className="text-xs text-gray-400">Locations covered</div>
        </div>
      </div>
    </div>
  );
}
