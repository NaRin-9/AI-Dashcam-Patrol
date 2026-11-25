import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import RiskDetails from './RiskDetails'
import { riskLabels } from '@/utils/risk-case-format'
import './risk-map.css'

// API ส่ง [lng, lat] ส่วน Leaflet รับ [lat, lng] สำหรับหมุดและเส้น
function toLatLng([longitude, latitude]) {
  return [latitude, longitude]
}

function addSurveyLayers(map, { tracks = [], cases = [] }, showTracks, onSelect) {
  const layers = L.featureGroup().addTo(map)

  const markers = new Map()
  for (const track of showTracks ? tracks : []) {
    if (track.points.length < 2) continue
    L.polyline(track.points.map(toLatLng), { className: 'live-map-track', weight: 5 })
      .addTo(layers)
  }

  for (const riskCase of cases) {
    const riskLabel = riskLabels[riskCase.riskLevel] ?? 'จุดเสี่ยง'
    const marker = L.marker(toLatLng(riskCase.confirmedLocation), {
      title: `${riskCase.id} · ${riskLabel}`,
      icon: L.divIcon({
        className: `live-map-marker${riskCase.riskLevel === 'touching' ? ' is-touching' : ''}`,
        iconSize: [20, 20],
      }),
    }).on('click', () => onSelect(riskCase)).addTo(layers)
    markers.set(riskCase.id, marker)
  }

  return { layers, markers }
}

export default function SurveyMap({ data, showTracks = false, selection }) {
  const container = useRef(null)
  const mapRef = useRef(null)
  const markerRefs = useRef(null)
  const [tileLoadFailed, setTileLoadFailed] = useState(false)
  const [selectedCase, setSelectedCase] = useState(null)

  useEffect(() => {
    const map = L.map(container.current).setView([13.7563, 100.5018], 12)
    mapRef.current = map
    const basemap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    })

    let loadedTile = false
    basemap.on({
      loading: () => {
        loadedTile = false
      },
      tileload: () => {
        loadedTile = true
        setTileLoadFailed(false)
      },
      load: () => setTileLoadFailed(!loadedTile),
    })
    basemap.addTo(map)

    const resize = new ResizeObserver(() => map.invalidateSize())
    resize.observe(container.current)
    return () => {
      resize.disconnect()
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!data) return
    const map = mapRef.current
    const { layers, markers } = addSurveyLayers(map, data, showTracks, setSelectedCase)
    markerRefs.current = markers
    const bounds = layers.getBounds()
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [28, 28], maxZoom: 15 })
    return () => {
      layers.remove()
      markerRefs.current = null
    }
  }, [data, showTracks])

  useEffect(() => {
    const marker = markerRefs.current?.get(selection?.id)
    if (marker) {
      mapRef.current.setView(marker.getLatLng(), 16)
      setSelectedCase(data.cases.find((riskCase) => riskCase.id === selection.id))
    }
  }, [selection, data])

  return (
    <>
      <div ref={container} className="live-map-canvas" role="region" aria-label="แผนที่สำรวจ" />
      {selectedCase && <RiskDetails riskCase={selectedCase} onClose={() => setSelectedCase(null)} />}
      {tileLoadFailed && (
        <p className="live-map-status" role="status">
          โหลดภาพแผนที่ไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่
        </p>
      )}
    </>
  )
}
