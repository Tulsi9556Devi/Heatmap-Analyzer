import {
  MapContainer,
  TileLayer,
  Marker,
  Popup
} from 'react-leaflet'

import {
  useEffect,
  useState
} from 'react'

import 'leaflet/dist/leaflet.css'

import L from 'leaflet'

import { supabase } from '../services/supabase'

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

  const [complaints, setComplaints] =
    useState([])

  useEffect(() => {

    fetchComplaints()

  }, [])

  const fetchComplaints = async () => {

    const { data, error } =
      await supabase
        .from('complaints')
        .select('*')

    if (error) {

      console.log(error)
      return
    }

    setComplaints(data)
  }

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
          complaints.map((item) => {

            if (
              !item.latitude ||
              !item.longitude
            ) {
              return null
            }

            return (

              <Marker
                key={item.id}
                position={[
                  item.latitude,
                  item.longitude
                ]}
              >

                <Popup>

                  <div>

                    <h3>
                      {item.complaint_type}
                    </h3>

                    <p>
                      {item.description}
                    </p>

                    <p>
                      Status:
                      {' '}
                      {item.status}
                    </p>

                  </div>

                </Popup>

              </Marker>
            )
          })
        }

      </MapContainer>

    </div>
  )
}

export default MapShell