import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',

  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',

  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

const MapShell = () => {

  const complaints = [
    {
      id: 1,
      title: 'Pothole Issue',
      position: [19.0330, 73.0297]
    },

    {
      id: 2,
      title: 'Garbage Dump',
      position: [19.0600, 73.0000]
    },

    {
      id: 3,
      title: 'Drainage Overflow',
      position: [19.0178, 73.0165]
    }
  ]

  return (

    <div className="map-wrapper">

      <MapContainer
        center={[19.0330, 73.0297]}
        zoom={12}
        scrollWheelZoom={true}
        className="leaflet-map"
      >

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {
          complaints.map((item) => (

            <Marker
              key={item.id}
              position={item.position}
            >

              <Popup>
                {item.title}
              </Popup>

            </Marker>

          ))
        }

      </MapContainer>

    </div>
  )
}

export default MapShell