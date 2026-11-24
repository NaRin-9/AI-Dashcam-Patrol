import { useEffect, useRef, useState } from 'react'
import SurveyMap, { captureTime, riskLabels, useSurvey } from '@/pages/LiveMap/SurveyMap'
import { Link, useLocation } from '@/routes/router'
import DashboardLayout, { Icon } from './DashboardLayout'
import RiskCaseList from './RiskCaseList'

const formatCount = new Intl.NumberFormat('th-TH')

export default function DashboardPage() {
  const { data, error } = useSurvey()
  const [query, setQuery] = useState('')
  const [selection, setSelection] = useState(null)
  const mapPanel = useRef(null)
  const allCases = new URLSearchParams(useLocation().search).get('view') === 'cases'
  const cases = data?.cases ?? []
  const term = query.trim().toLowerCase()
  const matching = cases.filter((item) => item.id.toLowerCase().includes(term))
    .sort((a, b) => Date.parse(b.capturedAt) - Date.parse(a.capturedAt))
  const visible = term ? matching : matching.slice(0, 5)

  useEffect(() => {
    if (allCases) {
      setSelection(null)
      return
    }
    if (selection) mapPanel.current?.scrollIntoView({ block: 'nearest' })
  }, [allCases, selection])

  if (allCases) {
    return (
      <DashboardLayout activePage="cases" title="รายการจุดเสี่ยง" query={query} onQueryChange={setQuery}>
        <RiskCaseList data={data} error={error} term={term} />
      </DashboardLayout>
    )
  }

  const caseCount = formatCount.format(cases.length)
  const shownCount = formatCount.format(visible.length)
  let listCount = ''
  if (data) {
    if (term) listCount = `พบ ${shownCount} จุด`
    else if (cases.length > visible.length) listCount = `${shownCount} จาก ${caseCount} จุด`
    else listCount = `${caseCount} จุด`
  }

  const map = (
    <section className="dash-panel dash-map" key="map" ref={mapPanel} aria-labelledby="overview-map-title">
      <header>
        <h2 id="overview-map-title">แผนที่จุดเสี่ยง</h2>
        <Link className="dash-text-link overview-map-link" to="/live-map">ขยายแผนที่ <Icon name="expand" /></Link>
      </header>
      <SurveyMap data={data} selection={selection} />
      <div className="dash-legend">
        <span><i className="live-map-key-point" aria-hidden="true" />{riskLabels.near}</span>
        <span><i className="live-map-key-point is-touching" aria-hidden="true" />{riskLabels.touching}</span>
      </div>
    </section>
  )

  const caseList = (
    <section className="dash-panel dash-cases" key="cases" aria-labelledby="overview-cases-title">
      <header>
        <h2 id="overview-cases-title">{term ? 'ผลการค้นหา' : 'จุดเสี่ยงล่าสุด'}</h2>
        <small className="overview-case-count" role="status">{listCount}</small>
      </header>
      {visible.length > 0 ? (
        <ul className="overview-case-list">
          {visible.map((item) => (
            <li key={item.id}>
              <button type="button" className="dash-case" aria-haspopup="dialog" onClick={() => setSelection({ id: item.id })}>
                <i className={`live-map-key-point${item.riskLevel === 'touching' ? ' is-touching' : ''}`} aria-hidden="true" />
                <span className="overview-case-detail">
                  <strong>{item.id}</strong>
                  <span>{riskLabels[item.riskLevel] ?? 'จุดเสี่ยง'}</span>
                  <time dateTime={item.capturedAt}>{captureTime.format(new Date(item.capturedAt))}</time>
                </span>
                <Icon name="arrow" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="dash-empty overview-empty" role="status">
          {error ? 'ข้อมูลไม่พร้อมใช้งาน' : !data ? 'กำลังโหลดจุดเสี่ยง…' : term ? 'ไม่พบจุดเสี่ยงที่ตรงกับรหัสนี้' : 'ยังไม่มีจุดเสี่ยงที่ยืนยันแล้ว'}
        </p>
      )}
      <Link className="dash-text-link dash-all" to="/dashboard?view=cases">ดูรายการทั้งหมด <Icon name="arrow" /></Link>
    </section>
  )

  return (
    <DashboardLayout
      activePage="overview"
      title="ภาพรวม"
      query={query}
      onQueryChange={setQuery}
    >
      {error && (
        <div className="overview-error" role="alert">
          <span>โหลดข้อมูลจุดเสี่ยงไม่สำเร็จ</span>
          <button type="button" onClick={() => window.location.reload()}>ลองอีกครั้ง</button>
        </div>
      )}
      <dl className="dash-stats" aria-label="ยอดสรุปจุดเสี่ยง">
        <div className="dash-stat dash-stat-total">
          <dt>จุดเสี่ยงที่ยืนยันแล้ว</dt>
          <dd><strong>{data ? caseCount : '—'}</strong>{data && <small>จุด</small>}</dd>
        </div>
        {Object.entries(riskLabels).map(([level, label]) => (
          <div className="dash-stat dash-stat-level" data-risk-level={level} key={level}>
            <dt>{label}</dt>
            <dd>
              <strong>{data ? formatCount.format(cases.filter((item) => item.riskLevel === level).length) : '—'}</strong>
              {data && <small>จุด</small>}
            </dd>
          </div>
        ))}
      </dl>
      <div className="dash-grid overview-grid" data-searching={Boolean(term)}>
        {term ? [caseList, map] : [map, caseList]}
      </div>
    </DashboardLayout>
  )
}
