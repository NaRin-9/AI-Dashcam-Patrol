import UserIcon from '@/components/ui/UserIcon'
import { Link } from '@/routes/router'
import { riskLabels } from '@/utils/risk-case-format'

const bkkDateKey = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Bangkok',
})

export default function OverviewSummary({ cases, videos = null }) {
  const todayKey = bkkDateKey.format(new Date())
  const todayCount = cases
    ? cases.filter((item) => item.capturedAt && bkkDateKey.format(new Date(item.capturedAt)) === todayKey).length
    : 0

  const touchingCount = cases?.filter((item) => item.riskLevel === 'touching').length
  const nearCount = cases?.filter((item) => item.riskLevel === 'near').length

  const pendingVideos = videos
    ? videos.filter((video) => video.status === 'queued' || video.status === 'processing').length
    : 0
  const videoNote = videos === null
    ? 'ดูสถานะการประมวลผล'
    : pendingVideos > 0
      ? `รอ/กำลังประมวลผล ${pendingVideos} ไฟล์`
      : videos.length > 0
        ? 'ประมวลผลครบแล้ว'
        : 'ยังไม่มีวิดีโอที่อัปโหลด'

  const metrics = [
    {
      key: 'total',
      kind: 'total',
      icon: 'pin',
      label: 'จุดเสี่ยงที่ยืนยันแล้ว',
      count: cases?.length,
      unit: 'จุด',
      note: todayCount > 0 ? `วันนี้เพิ่ม ${todayCount.toLocaleString('th-TH')} จุด` : 'รายการจากการสำรวจทั้งหมด',
      to: '/risk-cases',
    },
    {
      key: 'touching',
      kind: 'level',
      level: 'touching',
      icon: 'alert',
      label: riskLabels.touching,
      count: touchingCount,
      unit: 'จุด',
      note: 'เร่งด่วน · ต้องตรวจสอบทันที',
      to: '/risk-cases',
    },
    {
      key: 'near',
      kind: 'level',
      level: 'near',
      icon: 'near',
      label: riskLabels.near,
      count: nearCount,
      unit: 'จุด',
      note: 'เฝ้าระวัง · วางแผนตัดแต่ง',
      to: '/risk-cases',
    },
    {
      key: 'videos',
      kind: 'videos',
      icon: 'video',
      label: 'วิดีโอของฉัน',
      count: videos?.length,
      unit: 'ไฟล์',
      note: videoNote,
      to: '/my-videos',
    },
  ]

  return (
    <dl className="dash-stats" aria-label="ยอดสรุปภาพรวม">
      {metrics.map(({ key, kind, level, icon, label, count, unit, note, to }) => (
        <div
          className={`dash-stat dash-stat-${kind}`}
          data-risk-level={level}
          key={key}
        >
          <dt>
            <Link to={to} className="dash-stat-link">
              {label}
            </Link>
            <span className="dash-stat-icon" aria-hidden="true">
              <UserIcon name={icon} size={18} />
            </span>
          </dt>
          <dd>
            <strong>{count === undefined ? '—' : count.toLocaleString('th-TH')}</strong>
            {count !== undefined && <small>{unit}</small>}
          </dd>
          <p className="dash-stat-note">{note}</p>
        </div>
      ))}
    </dl>
  )
}
