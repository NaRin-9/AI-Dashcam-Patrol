import { useAuth } from '@/contexts/AuthContext'

const bkkHourFormat = new Intl.DateTimeFormat('en-GB', {
  hour: 'numeric',
  hour12: false,
  timeZone: 'Asia/Bangkok',
})

const thaiDateFormat = new Intl.DateTimeFormat('th-TH', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Bangkok',
})

function getGreetingPrefix(date) {
  const hour = Number.parseInt(bkkHourFormat.format(date), 10)
  if (hour >= 5 && hour < 12) return 'สวัสดีตอนเช้า'
  if (hour >= 12 && hour < 17) return 'สวัสดีตอนบ่าย'
  if (hour >= 17 && hour < 21) return 'สวัสดีตอนเย็น'
  return 'สวัสดี'
}

export default function DashboardGreeting({ action = null, searching = false }) {
  const { user } = useAuth()
  const now = new Date()
  const firstName = user?.firstName?.trim() || user?.username || 'ผู้ใช้งาน'
  const department = user?.department?.trim()
  const greeting = getGreetingPrefix(now)
  const todayLabel = thaiDateFormat.format(now)

  return (
    <section className="dash-greeting" aria-label="ข้อความทักทาย" data-searching={searching || undefined}>
      <div className="dash-greeting-copy">
        <h2>{greeting} คุณ{firstName}</h2>
        <p>
          <span>{todayLabel}</span>
          {department && (
            <>
              <span aria-hidden="true">·</span>
              <span>{department}</span>
            </>
          )}
        </p>
      </div>
      {action && <div className="dash-greeting-action">{action}</div>}
    </section>
  )
}
