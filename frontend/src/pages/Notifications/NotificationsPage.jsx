import { useCallback, useEffect, useMemo, useState } from 'react'
import DashboardLayout from '@/components/layout/dashboard/DashboardLayout'
import Icon from '@/components/ui/UserIcon'
import { useAuth } from '@/contexts/AuthContext'
import useSurvey from '@/hooks/useSurvey'
import { Link } from '@/routes/router'
import { apiGet } from '@/services/api'
import { captureTime, riskLabels } from '@/utils/risk-case-format'
import './notifications.css'

const videoStatusText = {
  queued: { label: 'รอประมวลผล', detail: 'วิดีโออยู่ในคิวรอตรวจจับจุดเสี่ยงด้วย AI' },
  processing: { label: 'กำลังประมวลผล', detail: 'ระบบกำลังวิเคราะห์วิดีโอเพื่อค้นหาจุดเสี่ยง' },
  processed: { label: 'ประมวลผลแล้ว', detail: 'วิเคราะห์วิดีโอเสร็จสิ้น พร้อมตรวจสอบผลลัพธ์' },
  failed: { label: 'ประมวลผลไม่สำเร็จ', detail: 'ไม่สามารถวิเคราะห์ไฟล์วิดีโอนี้ได้ กรุณาตรวจสอบไฟล์' },
}

const filters = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'risk', label: 'จุดเสี่ยง' },
  { key: 'video', label: 'วิดีโอ' },
  { key: 'unread', label: 'ยังไม่อ่าน' },
]

function readStorageKey(userId) {
  return `pea-patrol:read-notifications:${userId || 'guest'}`
}

function loadReadIds(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? new Set(parsed) : new Set()
  } catch {
    return new Set()
  }
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const storageKey = readStorageKey(user?.id)
  const { data: surveyData, error: surveyError } = useSurvey()

  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [videoState, setVideoState] = useState({ videos: [], loaded: false, error: false })
  const [readIds, setReadIds] = useState(() => loadReadIds(storageKey))

  useEffect(() => {
    setReadIds(loadReadIds(storageKey))
  }, [storageKey])

  useEffect(() => {
    const request = new AbortController()
    apiGet('/videos', { signal: request.signal })
      .then(({ videos }) => {
        if (!request.signal.aborted) {
          setVideoState({ videos: videos ?? [], loaded: true, error: false })
        }
      })
      .catch(() => {
        if (!request.signal.aborted) {
          setVideoState({ videos: [], loaded: true, error: true })
        }
      })
    return () => request.abort()
  }, [])

  const persistReadIds = useCallback((nextSet) => {
    setReadIds(nextSet)
    try {
      localStorage.setItem(storageKey, JSON.stringify([...nextSet]))
    } catch {
      // Ignore storage quota or private browsing restrictions.
    }
  }, [storageKey])

  const notifications = useMemo(() => {
    const riskItems = (surveyData?.cases ?? []).map((item) => {
      const level = item.riskLevel === 'touching' ? 'touching' : 'near'
      const [longitude, latitude] = item.confirmedLocation ?? []
      const hasCoords = Number.isFinite(latitude) && Number.isFinite(longitude)
      return {
        id: `risk:${item.id}`,
        category: 'risk',
        severity: level,
        icon: 'alert',
        title: `ตรวจพบจุดเสี่ยง ${item.id}`,
        subtitle: item.poleId ? `เสาไฟ ${item.poleId}` : riskLabels[level] || 'จุดเสี่ยงแนวสายไฟ',
        description: hasCoords
          ? `ระดับ${riskLabels[level] || 'จุดเสี่ยง'} · พิกัด ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
          : `ระดับ${riskLabels[level] || 'จุดเสี่ยง'}`,
        badge: riskLabels[level] || 'จุดเสี่ยง',
        timestamp: item.capturedAt,
        timeMs: Date.parse(item.capturedAt) || 0,
        actionTo: '/risk-cases',
        actionLabel: 'ดูจุดเสี่ยง',
      }
    })

    const videoItems = videoState.videos.map((video) => {
      const statusMeta = videoStatusText[video.status] ?? {
        label: 'อัปเดตวิดีโอ',
        detail: 'มีการอัปเดตสถานะวิดีโอ',
      }
      const sizeMb = (video.sizeBytes / (1024 * 1024)).toLocaleString('th-TH', { maximumFractionDigits: 1 })
      return {
        id: `video:${video.id}:${video.status}`,
        category: 'video',
        severity: video.status,
        icon: 'video',
        title: video.name,
        subtitle: `${sizeMb} MB`,
        description: statusMeta.detail,
        badge: statusMeta.label,
        timestamp: video.createdAt,
        timeMs: Date.parse(video.createdAt) || 0,
        actionTo: '/my-videos',
        actionLabel: 'ดูวิดีโอ',
      }
    })

    return [...riskItems, ...videoItems].sort((a, b) => b.timeMs - a.timeMs)
  }, [surveyData, videoState.videos])

  const loading = (!surveyData && !surveyError) || !videoState.loaded
  const allFailed = Boolean(surveyError && videoState.error)

  const counts = useMemo(() => {
    let risk = 0
    let video = 0
    let unread = 0
    for (const item of notifications) {
      if (item.category === 'risk') risk += 1
      if (item.category === 'video') video += 1
      if (!readIds.has(item.id)) unread += 1
    }
    return { all: notifications.length, risk, video, unread }
  }, [notifications, readIds])

  const term = query.trim().toLowerCase()
  const visible = useMemo(() => {
    return notifications.filter((item) => {
      if (activeFilter === 'risk' && item.category !== 'risk') return false
      if (activeFilter === 'video' && item.category !== 'video') return false
      if (activeFilter === 'unread' && readIds.has(item.id)) return false
      if (!term) return true
      return (
        item.title.toLowerCase().includes(term) ||
        item.subtitle.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.badge.toLowerCase().includes(term)
      )
    })
  }, [notifications, activeFilter, readIds, term])

  function markAsRead(id) {
    if (readIds.has(id)) return
    const next = new Set(readIds)
    next.add(id)
    persistReadIds(next)
  }

  function markAllAsRead() {
    if (!notifications.length) return
    const next = new Set(readIds)
    for (const item of notifications) next.add(item.id)
    persistReadIds(next)
  }

  return (
    <DashboardLayout
      activePage="notifications"
      title="การแจ้งเตือน"
      query={query}
      onQueryChange={setQuery}
    >
      <section className="dash-panel notifications-panel" aria-label="รายการแจ้งเตือน" aria-busy={loading}>
        <header className="notifications-header">
          <div className="notifications-summary">
            <h2>รายการแจ้งเตือนล่าสุด</h2>
            <small>
              {counts.unread > 0
                ? `ยังไม่อ่าน ${counts.unread} รายการ`
                : 'อ่านครบทั้งหมดแล้ว'}
            </small>
          </div>
          <button
            type="button"
            className="notifications-mark-all"
            onClick={markAllAsRead}
            disabled={counts.unread === 0}
          >
            <Icon name="checkAll" size={16} />
            <span>ทำเครื่องหมายอ่านทั้งหมด</span>
          </button>
        </header>

        <div className="notifications-filters" role="tablist" aria-label="กรองการแจ้งเตือน">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={activeFilter === key}
              className="notifications-tab"
              onClick={() => setActiveFilter(key)}
            >
              <span>{label}</span>
              <b>{counts[key]}</b>
            </button>
          ))}
        </div>

        {loading && notifications.length === 0 && (
          <p className="dash-empty notifications-empty" role="status">กำลังโหลดการแจ้งเตือน…</p>
        )}

        {!loading && allFailed && (
          <p className="dash-empty notifications-empty" role="alert">
            โหลดข้อมูลแจ้งเตือนไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
          </p>
        )}

        {!loading && !allFailed && visible.length === 0 && (
          <p className="dash-empty notifications-empty">
            {term
              ? 'ไม่พบการแจ้งเตือนที่ตรงกับคำค้นหา'
              : activeFilter === 'unread'
                ? 'ไม่มีการแจ้งเตือนที่ยังไม่อ่าน'
                : 'ยังไม่มีการแจ้งเตือนในขณะนี้'}
          </p>
        )}

        {visible.length > 0 && (
          <ul className="notifications-list">
            {visible.map((item) => {
              const isUnread = !readIds.has(item.id)
              return (
                <li
                  key={item.id}
                  className="notifications-item"
                  data-unread={isUnread}
                  data-category={item.category}
                  data-severity={item.severity}
                >
                  <span className="notifications-item-icon" aria-hidden="true">
                    <Icon name={item.icon} size={19} />
                  </span>
                  <div className="notifications-item-body">
                    <div className="notifications-item-top">
                      <strong>
                        {isUnread && <span className="notifications-unread-dot" aria-label="ยังไม่อ่าน" />}
                        {item.title}
                      </strong>
                      <span className="notifications-badge" data-severity={item.severity}>
                        {item.badge}
                      </span>
                    </div>
                    <p className="notifications-item-desc">{item.description}</p>
                    <div className="notifications-item-meta">
                      <span>{item.subtitle}</span>
                      {item.timestamp && (
                        <>
                          <span aria-hidden="true">·</span>
                          <time dateTime={item.timestamp}>
                            {captureTime.format(new Date(item.timestamp))}
                          </time>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="notifications-item-actions">
                    <Link
                      to={item.actionTo}
                      className="notifications-item-link"
                      onClick={() => markAsRead(item.id)}
                    >
                      {item.actionLabel}
                    </Link>
                    {isUnread && (
                      <button
                        type="button"
                        className="notifications-read-btn"
                        onClick={() => markAsRead(item.id)}
                      >
                        อ่านแล้ว
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </DashboardLayout>
  )
}
