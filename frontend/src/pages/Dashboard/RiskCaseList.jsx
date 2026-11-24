import { useMemo, useState } from 'react'
import SurveyMap, { captureTime, RiskDetails, riskLabels } from '@/pages/LiveMap/SurveyMap'
import { Link } from '@/routes/router'
import { Icon } from './DashboardLayout'

export default function RiskCaseList({ data, error, term }) {
  const [risk, setRisk] = useState('')
  const [selectedCase, setSelectedCase] = useState(null)
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
    <div className="dash-grid risk-list-grid">
      <section className="dash-panel risk-list" aria-label="รายการจุดเสี่ยง">
        <div className="risk-list-tools">
          <span role="status">{data && `${cases.length} จุด`}</span>
          <label>
            ระดับความเสี่ยง
            <select value={risk} onChange={(event) => setRisk(event.target.value)}>
              <option value="">ทั้งหมด</option>
              {Object.entries(riskLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </div>
        <div className="risk-list-columns" aria-hidden="true">
          <span>รหัสเคส</span><span>รายละเอียด</span><span>สถานะ</span>
        </div>
        {cases.length > 0 && <ul className="risk-list-items">
          {cases.map((item) => {
            const [longitude, latitude] = item.confirmedLocation
            return (
              <li key={item.id}>
                <button type="button" className="risk-list-row" onClick={() => setSelectedCase(item)}>
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
      <section className="dash-panel dash-map" aria-labelledby="risk-list-map-title">
        <header>
          <h2 id="risk-list-map-title">แผนที่จุดเสี่ยง</h2>
          <Link className="dash-text-link" to="/live-map">ขยายแผนที่ <Icon name="expand" /></Link>
        </header>
        <SurveyMap data={mapData} />
        <div className="dash-legend">
          <span><i className="live-map-key-point" />{riskLabels.near}</span>
          <span><i className="live-map-key-point is-touching" />{riskLabels.touching}</span>
        </div>
      </section>
    </div>
  )
}
