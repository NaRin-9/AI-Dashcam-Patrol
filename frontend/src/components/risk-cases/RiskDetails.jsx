import { useEffect, useId, useRef } from 'react'
import { captureTime, riskLabels } from '@/utils/risk-case-format'
import './risk-details.css'

export default function RiskDetails({ riskCase, onClose }) {
  const dialog = useRef(null)
  const titleId = useId()
  const [longitude, latitude] = riskCase.confirmedLocation
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
