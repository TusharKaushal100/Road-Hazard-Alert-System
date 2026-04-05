import React, { useState, useCallback } from 'react';
import axios from 'axios';
import MapView   from './components/MapView';
import PostFeed  from './components/PostFeed';
import FilterBar from './components/FilterBar';
import StatsBar  from './components/StatsBar';

export const LABEL_CONFIG = {
  pothole:     { text: 'Pothole',     icon: '🕳️',  bg: 'bg-red-500',    hex: '#ef4444' },
  flood:       { text: 'Flood',       icon: '🌊',  bg: 'bg-blue-500',   hex: '#3b82f6' },
  accident:    { text: 'Accident',    icon: '💥',  bg: 'bg-orange-500', hex: '#f97316' },
  traffic:     { text: 'Traffic',     icon: '🚗',  bg: 'bg-yellow-500', hex: '#eab308' },
  road_damage: { text: 'Road Damage', icon: '🚧',  bg: 'bg-purple-500', hex: '#8b5cf6' },
  animal:      { text: 'Animal',      icon: '🐘',  bg: 'bg-green-500',  hex: '#22c55e' },
};

export default function App() {
  const [hazards,      setHazards]      = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [count,        setCount]        = useState(15);
  const [selected,     setSelected]     = useState(null);

  const fetchHazards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/hazards/analyze', { count });
      setHazards(res.data.hazards);
      setSelected(null);
    } catch (err) {
      setError('Cannot connect. Make sure the backend (port 4000) and ML API (port 5001) are both running.');
    } finally {
      setLoading(false);
    }
  }, [count]);

  const filtered = activeFilter === 'all'
    ? hazards
    : hazards.filter(h => h.label === activeFilter);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">🛣️ Road Hazard Detector — Assam</h1>
            <p className="text-xs text-gray-400">NLP + TF-IDF + Logistic Regression · Social Media Analysis</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={count}
              onChange={e => setCount(Number(e.target.value))}
              className="bg-gray-800 border border-gray-700 text-sm text-white rounded-lg px-3 py-1.5"
            >
              {[5, 10, 15, 20, 25, 30].map(n => (
                <option key={n} value={n}>{n} posts</option>
              ))}
            </select>
            <button
              onClick={fetchHazards}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50
                         disabled:cursor-not-allowed text-white text-sm font-semibold
                         px-5 py-1.5 rounded-lg transition-colors"
            >
              {loading ? '⏳ Analyzing…' : '▶ Fetch & Analyze'}
            </button>
          </div>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div className="bg-red-900/40 border-b border-red-800 text-red-300 text-sm px-6 py-2">
          ⚠️ {error}
        </div>
      )}

      {/* Stats */}
      {hazards.length > 0 && (
        <StatsBar hazards={hazards} labelConfig={LABEL_CONFIG} />
      )}

      {/* Filter */}
      {hazards.length > 0 && (
        <FilterBar
          hazards={hazards}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          labelConfig={LABEL_CONFIG}
        />
      )}

      {/* Main */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-3 min-h-0">
        {hazards.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-full py-24 text-gray-500">
            <div className="text-6xl mb-4">🗺️</div>
            <p className="text-lg font-medium">Click "Fetch & Analyze" to begin</p>
            <p className="text-sm mt-2 text-gray-600">
              Posts are fetched from the mock API, classified by the ML model, and plotted on the map
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-[calc(100vh-220px)]">
            <div className="rounded-xl overflow-hidden border border-gray-800">
              <MapView
                hazards={filtered}
                selected={selected}
                setSelected={setSelected}
                labelConfig={LABEL_CONFIG}
              />
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-800 flex flex-col bg-gray-900">
              <PostFeed
                hazards={filtered}
                selected={selected}
                setSelected={setSelected}
                labelConfig={LABEL_CONFIG}
                loading={loading}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
