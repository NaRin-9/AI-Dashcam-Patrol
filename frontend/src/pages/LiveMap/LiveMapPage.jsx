import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { apiGet } from '@/services/api'
import './live-map.css'

const riskLabels = {
  near: 'ใกล้แนวสายไฟ',
  touching: 'สัมผัสแนวสายไฟ',
}

const captureTime = new Intl.DateTimeFormat('th-TH', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Bangkok',
})

// API ส่ง [lng, lat] ส่วน Leaflet รับ [lat, lng] สำหรับหมุดและเส้น
function toLatLng([longitude, latitude]) {
  return [latitude, longitude]
}

function addSurveyLayers(map, { tracks, cases = [], demo }) {
  const layers = L.featureGroup().addTo(map)

  for (const track of tracks) {
    if (track.points.length < 2) continue
    L.polyline(track.points.map(toLatLng), { className: 'live-map-track', weight: 5 })
      .addTo(layers)
  }

  for (const riskCase of cases) {
    const riskLabel = riskLabels[riskCase.riskLevel] ?? 'จุดเสี่ยง'
    const popup = document.createElement('div')
    const title = document.createElement('strong')
    const details = document.createElement('div')
    title.textContent = demo ? `${riskCase.id} (ข้อมูลจำลอง)` : riskCase.id
    details.textContent = `${riskLabel} · ${captureTime.format(new Date(riskCase.capturedAt))}`
    popup.append(title, details)

    L.marker(toLatLng(riskCase.confirmedLocation), {
      title: `${riskCase.id} · ${riskLabel}`,
      icon: L.divIcon({
        className: `live-map-marker${riskCase.riskLevel === 'touching' ? ' is-touching' : ''}`,
        iconSize: [20, 20],
        popupAnchor: [0, -10],
      }),
    }).bindPopup(popup).addTo(layers)
  }

  const bounds = layers.getBounds()
  if (bounds.isValid()) {
    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 15 })
    return true
  }
  return false
}

export default function LiveMapPage() {
  const mapContainer = useRef(null)
  const [tileLoadFailed, setTileLoadFailed] = useState(false)
  const [survey, setSurvey] = useState(null)

  useEffect(() => {
    const request = new AbortController()
    const map = L.map(mapContainer.current).setView([13.7563, 100.5018], 12)
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

    apiGet('/live-map', { signal: request.signal })
      .then((data) => {
        if (request.signal.aborted) return
        const hasData = addSurveyLayers(map, data)
        setSurvey({
          demo: data.demo,
          hasData,
          hasTracks: data.tracks.some((track) => track.points.length >= 2),
        })
      })
      .catch(() => {
        if (!request.signal.aborted) setSurvey({ error: true })
      })

    return () => {
      request.abort()
      map.remove()
    }
  }, [])

  return (
    <section className="live-map" aria-labelledby="live-map-title">
      <header className="live-map-heading">
        <h1 id="live-map-title">Live Map</h1>
        {survey?.demo && <span className="live-map-demo">ข้อมูลจำลอง</span>}
      </header>
      {survey?.hasData && (
        <ul className="live-map-legend" aria-label="คำอธิบายสัญลักษณ์แผนที่">
          {survey.hasTracks && (
            <li><span className="live-map-key-track" aria-hidden="true" />เส้นทางรถ</li>
          )}
          <li><span className="live-map-key-point" aria-hidden="true" />{riskLabels.near}</li>
          <li><span className="live-map-key-point is-touching" aria-hidden="true" />{riskLabels.touching}</li>
        </ul>
      )}
      <div
        ref={mapContainer}
        className="live-map-canvas"
        role="region"
        aria-label="แผนที่สำรวจ"
      />
      {survey?.error && (
        <p className="live-map-status" role="status">
          โหลดข้อมูลเส้นทางรถและจุดเสี่ยงไม่สำเร็จ
        </p>
      )}
      {tileLoadFailed && (
        <p className="live-map-status" role="status">
          โหลดภาพแผนที่ไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่
        </p>
      )}
    </section>
  )
}
