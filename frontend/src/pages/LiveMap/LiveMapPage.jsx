import { useMemo, useState } from 'react'
import DashboardLayout from '@/pages/Dashboard/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import SurveyMap, { riskLabels, useSurvey } from './SurveyMap'

export default function LiveMapPage() {
  const { data, error } = useSurvey()
  const { isAdminOrAbove } = useAuth()
  const [query, setQuery] = useState('')
  const term = query.trim().toLowerCase()
  const visibleData = useMemo(() => {
    if (!data || !term) return data
    return { ...data, cases: data.cases.filter((item) => item.id.toLowerCase().includes(term)) }
  }, [data, term])
  const hasTracks = isAdminOrAbove && data?.tracks?.some((track) => track.points.length >= 2)

  return (
    <DashboardLayout activePage="map" title="แผนที่จุดเสี่ยง" query={query} onQueryChange={setQuery}>
      <section className="dash-panel dash-map dash-expanded-map" aria-label="แผนที่จุดเสี่ยง">
        <SurveyMap data={visibleData} showTracks={isAdminOrAbove} />
        <div className="dash-legend">
          {hasTracks && <span><i className="live-map-key-track" />เส้นทางรถ</span>}
          <span><i className="live-map-key-point" />{riskLabels.near}</span>
          <span><i className="live-map-key-point is-touching" />{riskLabels.touching}</span>
        </div>
        {term && visibleData && <p role="status" className="live-map-status">
          {visibleData.cases.length ? `พบ ${visibleData.cases.length} จุด` : 'ไม่พบจุดเสี่ยงที่ตรงกับรหัสนี้'}
        </p>}
        {error && <p className="live-map-status" role="alert">โหลดข้อมูลแผนที่ไม่สำเร็จ <button onClick={() => window.location.reload()}>ลองอีกครั้ง</button></p>}
      </section>
    </DashboardLayout>
  )
}
