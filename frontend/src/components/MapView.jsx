import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';

function FlyTo({ selected }) {
  const map = useMap();
  useEffect(() => {
    if (selected?.location) {
      map.flyTo([selected.location.lat, selected.location.lon], 12, { duration: 0.8 });
    }
  }, [selected, map]);
  return null;
}

export default function MapView({ hazards, selected, setSelected, labelConfig }) {
  return (
    <MapContainer
      center={[26.2006, 92.9376]}
      zoom={7}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyTo selected={selected} />
      {hazards.map(h => {
        const isSelected = selected?.id === h.id;
        const cfg = labelConfig[h.label];
        return (
          <CircleMarker
            key={h.id}
            center={[h.location.lat, h.location.lon]}
            radius={isSelected ? 14 : 8}
            pathOptions={{
              color:       h.color,
              fillColor:   h.color,
              fillOpacity: isSelected ? 1 : 0.7,
              weight:      isSelected ? 3 : 1,
            }}
            eventHandlers={{ click: () => setSelected(h) }}
          >
            <Popup maxWidth={260}>
              <div className="text-sm">
                <div className="font-semibold">
                  {cfg?.icon} {cfg?.text}
                  <span className="ml-2 text-xs text-gray-400 font-normal">
                    {Math.round(h.confidence * 100)}% confidence
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {h.text.slice(0, 150)}…
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  📍 {h.location.name} · @{h.username}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
