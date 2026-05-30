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
        radius: 50,
        blur: 30,
        maxZoom: 17,
        max: 1,
        minOpacity: 0.36,
        gradient: {
          0.2: '#22c55e',
          0.5: '#facc15',
          0.85: '#ef4444'
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

      const locationGroups =
        complaints
        .filter(
          item =>
            Number.isFinite(Number(item.latitude)) &&
            Number.isFinite(Number(item.longitude))
        )
        .reduce((acc, item) => {

          const latitude =
            Number(item.latitude)

          const longitude =
            Number(item.longitude)

          const key =
            `${latitude.toFixed(3)}:${longitude.toFixed(3)}`

          if (!acc[key]) {
            acc[key] = {
              latitude,
              longitude,
              weight: 0
            }
          }

          acc[key].weight += 1

          return acc

        }, {})

      const groupedZones =
        Object.values(locationGroups)

      const maxWeight =
        Math.max(
          1,
          ...groupedZones.map(zone => zone.weight)
        )

      const heatPoints =
        groupedZones.map((zone) => {

          const intensity =
            maxWeight <= 1
              ? 0.55
              : Math.max(
                  0.28,
                  zone.weight / maxWeight
                )

          return [
            zone.latitude,
            zone.longitude,
            intensity
          ]
        })

      return heatPoints

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
