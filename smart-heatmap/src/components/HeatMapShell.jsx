import { useEffect, useMemo } from 'react'

import {
  MapContainer,
  TileLayer,
  useMap
} from 'react-leaflet'

import 'leaflet/dist/leaflet.css'
import 'leaflet.heat/dist/leaflet-heat.js'

import L from 'leaflet'

const HeatLayer = ({ points }) => {

  const map = useMap()

  useEffect(() => {

    map.invalidateSize()

    if (!points.length || !L.heatLayer) {
      return
    }

    const heatLayer =
      L.heatLayer(points, {
        radius: 38,
        blur: 28,
        maxZoom: 17,
        minOpacity: 0.35,
        gradient: {
          0.2: '#2b83ff',
          0.4: '#00d4ff',
          0.6: '#00ff95',
          0.8: '#ffe600',
          1.0: '#ff2b2b'
        }
      }).addTo(map)

    const bounds =
      L.latLngBounds(
        points.map(point => [
          point[0],
          point[1]
        ])
      )

    if (bounds.isValid()) {

      if (points.length === 1) {
        map.setView(
          [points[0][0], points[0][1]],
          14
        )
      } else {
        map.fitBounds(bounds, {
          padding: [70, 70],
          maxZoom: 14
        })
      }
    }

    return () => {
      map.removeLayer(heatLayer)
    }

  }, [map, points])

  return null
}

const HeatMapShell = ({ complaints = [] }) => {

  const points =
    useMemo(() => {

      return complaints
        .filter(
          item =>
            Number.isFinite(Number(item.latitude)) &&
            Number.isFinite(Number(item.longitude))
        )
        .map(item => ([
          Number(item.latitude),
          Number(item.longitude),
          1
        ]))

    }, [complaints])

  return (

    <MapContainer
      center={[19.0330, 73.0297]}
      zoom={11}
      scrollWheelZoom={true}
      style={{
        height: '100%',
        width: '100%',
        borderRadius: '24px'
      }}
    >

      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <HeatLayer points={points} />

    </MapContainer>
  )
}

export default HeatMapShell
