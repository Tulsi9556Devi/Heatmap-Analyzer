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

const getMarkerColor = (status) => {

  if (status === 'Resolved') {
    return '#22c55e'
  }

  if (
    status === 'In Progress' ||
    status === 'Reached to Department'
  ) {
    return '#facc15'
  }

  return '#ef4444'
}

const getStatusIcon = (status) =>
  L.divIcon({
    className: 'complaint-status-marker',
    html: `
      <span
        class="pin-head"
        style="background:${getMarkerColor(status)};"
      ></span>
      <span
        class="pin-tip"
        style="background:${getMarkerColor(status)};"
      ></span>
    `,
    iconSize: [34, 42],
    iconAnchor: [17, 40],
    popupAnchor: [0, -36]
  })

const MapShell = ({
  complaints = null
}) => {

  const [fetchedComplaints, setFetchedComplaints] =
    useState([])

  useEffect(() => {

    if (Array.isArray(complaints)) {
      return
    }

    const fetchComplaints = async () => {

      const { data, error } =
        await supabase
          .from('complaints')
          .select('*')

      if (error) {

        console.log(error)
        return
      }

      setFetchedComplaints(data)
    }

    fetchComplaints()

  }, [complaints])

  const visibleComplaints =
    Array.isArray(complaints)
      ? complaints
      : fetchedComplaints

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
          visibleComplaints.map((item) => {

            if (
              !Number.isFinite(Number(item.latitude)) ||
              !Number.isFinite(Number(item.longitude))
            ) {
              return null
            }

            return (

              <Marker
                key={item.id}
                icon={getStatusIcon(item.status)}
                position={[
                  Number(item.latitude),
                  Number(item.longitude)
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
