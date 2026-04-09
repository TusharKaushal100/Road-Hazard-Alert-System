import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"

export const MapView = () => {

  const locations = [
    { id: 1, lat: 19.1495, lng: 72.8683, text: "Flood in Mumbai" },
    { id: 2, lat: 26.1445, lng: 91.7362, text: "Pothole in Guwahati" }
  ]

  return (
    <div className="h-full w-full">
      <MapContainer
        center={[22.9734, 78.6569]}
        zoom={5}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {locations.map((loc) => (
          <Marker key={loc.id} position={[loc.lat, loc.lng]}>
            <Popup>{loc.text}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}