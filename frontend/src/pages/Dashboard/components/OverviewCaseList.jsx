import Icon from '@/components/ui/UserIcon'
import { Link } from '@/routes/router'
import { captureTime, riskLabels } from '@/utils/risk-case-format'

const formatCount = new Intl.NumberFormat('th-TH')

function getCaseCountLabel(total, shown, isSearching) {
  if (total === null) return ''
  if (isSearching) return `พบ ${formatCount.format(shown)} จุด`
  if (shown < total) return `${formatCount.format(shown)} จาก ${formatCount.format(total)} จุด`
  return `${formatCount.format(total)} จุด`
}

function getEmptyCaseMessage(error, total, isSearching) {
  if (error) return 'ข้อมูลไม่พร้อมใช้งาน'
  if (total === null) return 'กำลังโหลดจุดเสี่ยง…'
  if (isSearching) return 'ไม่พบจุดเสี่ยงที่ตรงกับรหัสนี้'
  return 'ยังไม่มีจุดเสี่ยงที่ยืนยันแล้ว'
}

export default function OverviewCaseList({ cases, total, error, isSearching, onSelect }) {
  return (
    <section className="dash-panel dash-cases" aria-labelledby="overview-cases-title">
      <header>
        <h2 id="overview-cases-title">{isSearching ? 'ผลการค้นหา' : 'จุดเสี่ยงล่าสุด'}</h2>
        <small className="overview-case-count" role="status">{getCaseCountLabel(total, cases.length, isSearching)}</small>
      </header>
      {cases.length > 0 ? (
        <ul className="overview-case-list">
          {cases.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="dash-case"
                data-risk-level={item.riskLevel}
                aria-haspopup="dialog"
                onClick={() => onSelect(item.id)}
              >
                <span className="overview-case-detail">
                  <strong>{item.id}</strong>
                  <time dateTime={item.capturedAt}>{captureTime.format(new Date(item.capturedAt))}</time>
                </span>
                <span className="overview-case-level">{riskLabels[item.riskLevel] ?? 'จุดเสี่ยง'}</span>
                <Icon name="arrow" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="dash-empty overview-empty" role="status">{getEmptyCaseMessage(error, total, isSearching)}</p>
      )}
      <Link className="dash-text-link dash-all" to="/risk-cases">ดูรายการทั้งหมด <Icon name="arrow" /></Link>
    </section>
  )
}
