import { useEffect } from "react"
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"

function FlyTo({ selected }) {
  const map = useMap()
  useEffect(() => {
    if (selected?.location) {
      map.flyTo([selected.location.lat, selected.location.lon ?? selected.location.lng], 12, { duration: 0.8 })
    }
  }, [selected, map])
  return null
}

export const MapView = ({ hazards = [], selected, setSelected, labelConfig = {} }) => {
  return (
    <MapContainer
      center={[22.9734, 78.6569]}
      zoom={5}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FlyTo selected={selected} />

      {hazards.map(h => {
        const isSelected = selected?.id === h.id
        const cfg = labelConfig[h.label]
        const lat = h.location?.lat
        const lon = h.location?.lon ?? h.location?.lng

        if (!lat || !lon) return null

        return (
          <CircleMarker
            key={h.id}
            center={[lat, lon]}
            radius={isSelected ? 14 : 8}
            pathOptions={{
              color:       h.color || "#6b7280",
              fillColor:   h.color || "#6b7280",
              fillOpacity: isSelected ? 1 : 0.75,
              weight:      isSelected ? 3 : 1.5,
            }}
            eventHandlers={{ click: () => setSelected(h) }}
          >
            <Popup maxWidth={260}>
              <div style={{ fontSize: 13 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  {cfg?.icon} {cfg?.text || h.label}
                  <span style={{ marginLeft: 8, fontSize: 11, color: "#9ca3af", fontWeight: 400 }}>
                    {Math.round(h.confidence * 100)}%
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "#4b5563", lineHeight: 1.5, margin: "4px 0" }}>
                  {h.text?.slice(0, 150)}…
                </p>
                <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                  📍 {h.location?.name} · @{h.username}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
