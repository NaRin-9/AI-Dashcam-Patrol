import { useMemo, useState } from 'react'
import { ListFilter } from 'lucide-react'
import RiskDetails from '@/components/risk-cases/RiskDetails'
import RiskMapPanel from '@/components/risk-cases/RiskMapPanel'
import DashboardLayout from '@/components/layout/dashboard/DashboardLayout'
import useMediaQuery from '@/hooks/useMediaQuery'
import useSurvey from '@/hooks/useSurvey'
import { captureTime, riskLabels } from '@/utils/risk-case-format'
import './risk-case-list.css'

function RiskLevelSelect({ value, onChange }) {
  return (
    <select aria-label="ระดับความเสี่ยง" value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">ทั้งหมด</option>
      {Object.entries(riskLabels).map(([level, label]) => <option key={level} value={level}>{label}</option>)}
    </select>
  )
}

export default function RiskCasesPage() {
  const { data, error } = useSurvey()
  const [query, setQuery] = useState('')
  const term = query.trim().toLowerCase()
  const [risk, setRisk] = useState('')
  const [selectedCase, setSelectedCase] = useState(null)
  const showMap = useMediaQuery('(width > 760px)')
  const mapData = useMemo(() => {
    if (!data) return null
    const cases = (data.cases ?? []).filter((item) => {
      const matchesSearch = item.id.toLowerCase().includes(term) ||
        item.poleId?.toLowerCase().includes(term)
      return matchesSearch && (!risk || item.riskLevel === risk)
    }).sort((a, b) => Date.parse(b.capturedAt) - Date.parse(a.capturedAt))
    return { cases }
  }, [data, term, risk])
  const cases = mapData?.cases ?? []

  return (
    <DashboardLayout
      activePage="cases"
      title="รายการจุดเสี่ยง"
      query={query}
      onQueryChange={setQuery}
      searchAction={
        !showMap && (
          <span className="risk-list-filter" data-active={Boolean(risk)}>
            <ListFilter aria-hidden="true" size={23} />
            <RiskLevelSelect value={risk} onChange={setRisk} />
          </span>
        )
      }
    >
      <div className="dash-grid risk-list-grid">
        <section className="dash-panel risk-list" aria-label="รายการจุดเสี่ยง">
          <div className="risk-list-tools">
            <span role="status">{data && `${cases.length} จุด`}</span>
            {showMap && <label>
              ระดับความเสี่ยง
              <RiskLevelSelect value={risk} onChange={setRisk} />
            </label>}
          </div>
          <div className="risk-list-columns" aria-hidden="true">
            <span>รหัสเคส</span><span>รายละเอียด</span><span>สถานะ</span>
          </div>
          {cases.length > 0 && <ul className="risk-list-items">
            {cases.map((item) => {
              const [longitude, latitude] = item.confirmedLocation
              return (
                <li key={item.id}>
                  <button type="button" className="risk-list-row" aria-haspopup="dialog" onClick={() => setSelectedCase(item)}>
                    <strong>{item.id}</strong>
                    <span className="risk-list-detail">
                      <span>{item.poleId || riskLabels[item.riskLevel] || 'จุดเสี่ยง'}</span>
                      <span>พิกัด {latitude.toFixed(5)}, {longitude.toFixed(5)}</span>
                      <time dateTime={item.capturedAt}>{captureTime.format(new Date(item.capturedAt))}</time>
                    </span>
                    <span className={item.statusLabel ? 'risk-list-status' : 'risk-list-status is-missing'}>
                      {item.statusLabel || 'ยังไม่มีข้อมูล'}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>}
          {error && <p className="dash-empty" role="alert">โหลดรายการจุดเสี่ยงไม่สำเร็จ <button onClick={() => window.location.reload()}>ลองอีกครั้ง</button></p>}
          {!error && !data && <p className="dash-empty" role="status">กำลังโหลดจุดเสี่ยง…</p>}
          {data && !cases.length && <p className="dash-empty" role="status">{term || risk ? 'ไม่พบจุดเสี่ยงที่ตรงกับการค้นหา' : 'ยังไม่มีจุดเสี่ยงที่ยืนยันแล้ว'}</p>}
          {selectedCase && <RiskDetails riskCase={selectedCase} onClose={() => setSelectedCase(null)} />}
        </section>
        {showMap && <RiskMapPanel data={mapData} />}
      </div>
    </DashboardLayout>
  )
}
