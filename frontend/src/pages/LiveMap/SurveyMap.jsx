import { useEffect, useId, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { apiGet } from '@/services/api'
import './live-map.css'

export const riskLabels = {
  near: 'ใกล้แนวสายไฟ',
  touching: 'สัมผัสแนวสายไฟ',
}

export const captureTime = new Intl.DateTimeFormat('th-TH', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Bangkok',
})

// API ส่ง [lng, lat] ส่วน Leaflet รับ [lat, lng] สำหรับหมุดและเส้น
function toLatLng([longitude, latitude]) {
  return [latitude, longitude]
}

export function useSurvey() {
  const [result, setResult] = useState({ data: null, error: false })
  useEffect(() => {
    const request = new AbortController()
    apiGet('/live-map', { signal: request.signal })
      .then((data) => {
        if (!request.signal.aborted) setResult({ data, error: false })
      })
      .catch(() => {
        if (!request.signal.aborted) setResult({ data: null, error: true })
      })
    return () => request.abort()
  }, [])
  return result
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

export function RiskDetails({ riskCase, onClose }) {
  const dialog = useRef(null)
  const titleId = useId()
  const [latitude, longitude] = toLatLng(riskCase.confirmedLocation)
  const mapsUrl = new URL('https://www.google.com/maps/dir/')
  mapsUrl.searchParams.set('api', '1')
  mapsUrl.searchParams.set('destination', `${latitude},${longitude}`)

  useEffect(() => {
    dialog.current.showModal()
  }, [])

  return (
    <dialog
      ref={dialog}
      className="risk-details"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close()
      }}
    >
      <article className="risk-details-card">
        <header className="risk-details-header">
          <h2 id={titleId}>รายละเอียดจุดเสี่ยง</h2>
          <form method="dialog">
            <button type="submit" aria-label="ปิดรายละเอียด">×</button>
          </form>
        </header>
        {riskCase.imageUrl ? (
          <img className="risk-details-image" src={riskCase.imageUrl} alt={`ภาพจุดเสี่ยง ${riskCase.id}`} />
        ) : (
          <p className="risk-details-no-image">ไม่มีภาพของเคสนี้</p>
        )}
        <p className="risk-details-date">
          วันที่ตรวจพบ <time dateTime={riskCase.capturedAt}>{captureTime.format(new Date(riskCase.capturedAt))}</time>
        </p>
        <dl className="risk-details-fields">
          <div><dt>รหัสเคส</dt><dd><strong>{riskCase.id}</strong></dd></div>
          <div><dt>รหัสเสาไฟ</dt><dd>{riskCase.poleId || 'ยังไม่มีข้อมูล'}</dd></div>
          <div><dt>ความเสี่ยง</dt><dd>{riskLabels[riskCase.riskLevel] ?? 'จุดเสี่ยง'}</dd></div>
          <div><dt>สถานะงาน</dt><dd>{riskCase.statusLabel || 'ยังไม่มีข้อมูล'}</dd></div>
          <div><dt>พิกัด</dt><dd>{latitude.toFixed(6)}, {longitude.toFixed(6)}</dd></div>
        </dl>
        <a className="risk-details-directions" href={mapsUrl.href} target="_blank" rel="noopener noreferrer">
          นำทางด้วย Google Maps ↗
        </a>
      </article>
    </dialog>
  )
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
