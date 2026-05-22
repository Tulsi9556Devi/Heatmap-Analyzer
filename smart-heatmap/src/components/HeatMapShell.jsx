import { useEffect, useState } from 'react'

import {
  MapContainer,
  TileLayer
} from 'react-leaflet'

import 'leaflet/dist/leaflet.css'
import 'leaflet.heat/dist/leaflet-heat.js'

import L from 'leaflet'

import { supabase } from '../services/supabase'
// console.log(L.heatLayer)

const HeatMapShell = () => {

  const [points, setPoints] = useState([])

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

    const heatPoints =
      data
        .filter(
          item =>
            item.latitude &&
            item.longitude
        )
        .map(item => ([
          item.latitude,
          item.longitude,
          1
        ]))

    setPoints(heatPoints)
  }
useEffect(() => {

  if (!points.length) return

  const timer = setTimeout(() => {

    try {

      const container =
        document.querySelector(
          '.leaflet-container'
        )

      if (
        !container ||
        !container._leaflet_map
      ) {
        return
      }

      const map =
        container._leaflet_map

      if (!L.heatLayer) {
        console.log(
          'HeatLayer not loaded'
        )
        return
      }

      L.heatLayer(points, {
        radius: 35,
        blur: 25,
        maxZoom: 17,
        gradient: {
          0.2: '#2b83ff',
          0.4: '#00d4ff',
          0.6: '#00ff95',
          0.8: '#ffe600',
          1.0: '#ff2b2b'
        }
      }).addTo(map)

    } catch (err) {

      console.log(
        'Heatmap Error:',
        err
      )
    }

  }, 1000)

  return () => clearTimeout(timer)

}, [points])

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

    </MapContainer>
  )
}

export default HeatMapShell