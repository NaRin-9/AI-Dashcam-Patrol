import { useEffect, useState } from 'react'
import { apiGet } from '@/services/api'
import DashboardLayout, { Icon } from './DashboardLayout'

const statusLabels = {
  queued: 'รอประมวลผล',
  processing: 'กำลังประมวลผล',
  processed: 'ประมวลผลแล้ว',
  failed: 'ประมวลผลไม่สำเร็จ',
}

const uploadTime = new Intl.DateTimeFormat('th-TH', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Bangkok',
})

export default function MyVideosPage() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState({ videos: [], error: false, version: -1 })
  const [requestVersion, setRequestVersion] = useState(0)
  const loading = requestVersion !== result.version
  const refresh = () => setRequestVersion((version) => version + 1)

  useEffect(() => {
    const request = new AbortController()
    apiGet('/videos', { signal: request.signal })
      .then(({ videos }) => {
        if (!request.signal.aborted) setResult({ videos, error: false, version: requestVersion })
      })
      .catch(() => {
        if (!request.signal.aborted) setResult((current) => ({ ...current, error: true, version: requestVersion }))
      })
    return () => request.abort()
  }, [requestVersion])

  const term = query.trim().toLowerCase()
  const visible = result.videos.filter((video) => video.name.toLowerCase().includes(term))

  return (
    <DashboardLayout
      activePage="videos"
      title="วิดีโอของฉัน"
      query={query}
      onQueryChange={setQuery}
      onVideoUploaded={refresh}
    >
      <section className="dash-panel my-videos" aria-label="สถานะวิดีโอ" aria-busy={loading}>
        <header>
          <h2>สถานะการประมวลผล</h2>
          <button className="my-videos-refresh" type="button" onClick={refresh} disabled={loading}>อัปเดตสถานะ</button>
        </header>
        {loading && <p className="dash-empty" role="status">กำลังโหลดสถานะวิดีโอ…</p>}
        {!loading && result.error && <p className="dash-empty" role="alert">โหลดรายการวิดีโอไม่สำเร็จ กรุณาลองอัปเดตสถานะอีกครั้ง</p>}
        {!loading && !result.error && !visible.length && (
          <p className="dash-empty">{term ? 'ไม่พบวิดีโอที่ตรงกับชื่อไฟล์นี้' : 'ยังไม่มีวิดีโอที่อัปโหลด'}</p>
        )}
        {visible.length > 0 && <ul className="my-videos-list">
          {visible.map((video) => (
            <li key={video.id}>
              <span className="my-videos-icon"><Icon name="video" /></span>
              <div className="my-videos-file">
                <strong>{video.name}</strong>
                <small>
                  <time dateTime={video.createdAt}>{uploadTime.format(new Date(video.createdAt))}</time>
                  {' · '}{(video.sizeBytes / (1024 * 1024)).toLocaleString('th-TH', { maximumFractionDigits: 1 })} MB
                </small>
              </div>
              <span className="my-videos-status" data-status={video.status}>
                {statusLabels[video.status] ?? 'ไม่ทราบสถานะ'}
              </span>
            </li>
          ))}
        </ul>}
      </section>
    </DashboardLayout>
  )
}
