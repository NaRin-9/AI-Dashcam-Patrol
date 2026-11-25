import { riskLabels } from '@/utils/risk-case-format'

export default function OverviewSummary({ cases }) {
  const metrics = [
    { label: 'จุดเสี่ยงที่ยืนยันแล้ว', count: cases?.length },
    ...Object.entries(riskLabels).map(([level, label]) => ({
      level,
      label,
      count: cases?.filter((item) => item.riskLevel === level).length,
    })),
  ]

  return (
    <dl className="dash-stats" aria-label="ยอดสรุปจุดเสี่ยง">
      {metrics.map(({ level, label, count }) => (
        <div
          className={level ? 'dash-stat dash-stat-level' : 'dash-stat dash-stat-total'}
          data-risk-level={level}
          key={level ?? 'total'}
        >
          <dt>{label}</dt>
          <dd>
            <strong>{count === undefined ? '—' : count.toLocaleString('th-TH')}</strong>
            {count !== undefined && <small>จุด</small>}
          </dd>
        </div>
      ))}
    </dl>
  )
}
