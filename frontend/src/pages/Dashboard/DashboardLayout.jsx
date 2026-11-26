import { useId, useState } from 'react'
import logo from '@/assets/pea-logo.png'
import { useAuth } from '@/contexts/AuthContext'
import useMediaQuery from '@/hooks/useMediaQuery'
import { Link } from '@/routes/router'
import VideoUpload from './VideoUpload'
import './dashboard.css'

const icons = {
  overview: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  map: 'm3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z M9 3v15 M15 6v15',
  list: 'M8 6h13 M8 12h13 M8 18h13 M3 6h.5 M3 12h.5 M3 18h.5',
  video: 'M3 5h13v14H3z M16 10l5-3v10l-5-3',
  search: 'M16.5 10a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z M15 15l6 6',
  arrow: 'm9 5 7 7-7 7',
  expand: 'M14 3h7v7 M21 3l-8 8 M10 5H4v15h15v-6',
}

export function Icon({ name }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icons[name]} /></svg>
}

function AccountMenu() {
  const { user, isAdminOrAbove, isSuperadmin, logout, logoutAll } = useAuth()
  return (
    <details className="dash-account">
      <summary>
        <b aria-hidden="true">{user.username.slice(0, 1).toUpperCase()}</b>
        <span className="dash-account-name">{user.username}</span>
      </summary>
      <div className="dash-account-menu">
        <strong>{user.username}</strong><small>{user.email}</small>
        <small>{user.role} · {user.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</small>
        {user.createdAt && <small>สมัครเมื่อ {new Date(user.createdAt).toLocaleDateString('th-TH')}</small>}
        <Link to="/risk-reports">รายงานจุดเสี่ยง</Link>
        {isAdminOrAbove && <Link to="/admin">หน้าผู้ดูแลระบบ</Link>}
        {isSuperadmin && <Link to="/superadmin">หน้าผู้ดูแลระบบสูงสุด</Link>}
        <button onClick={logout}>ออกจากระบบ</button>
        <button onClick={logoutAll}>ออกจากระบบทุกอุปกรณ์</button>
      </div>
    </details>
  )
}

export default function DashboardLayout({ activePage, title, query, onQueryChange, onVideoUploaded, children }) {
  const [railExpanded, setRailExpanded] = useState(true)
  const hasSideRail = useMediaQuery('(width > 760px)')
  const railId = useId()
  const railLabel = railExpanded ? 'ซ่อนเมนูด้านซ้าย' : 'เปิดเมนูด้านซ้าย'
  const searchLabels = { cases: 'ค้นหารหัสเคสหรือรหัสเสาไฟ', videos: 'ค้นหาชื่อไฟล์วิดีโอ' }
  const searchLabel = searchLabels[activePage] ?? 'ค้นหารหัสจุดเสี่ยง'
  return (
    <div className="patrol-dashboard" data-page={activePage} data-rail-expanded={railExpanded}>
      {hasSideRail && (
        <button
          type="button"
          className="dash-rail-toggle"
          aria-controls={railId}
          aria-expanded={railExpanded}
          aria-label={railLabel}
          title={railLabel}
          onClick={() => setRailExpanded((expanded) => !expanded)}
        >
          <img src={logo} alt="" width="48" height="48" />
        </button>
      )}
      <aside className="dash-rail" id={railId} inert={hasSideRail && !railExpanded}>
        <Link to="/dashboard" className="dash-brand" aria-label="หน้าหลัก การไฟฟ้าส่วนภูมิภาค">
          <img src={logo} alt="" /><span>การไฟฟ้าส่วนภูมิภาค</span>
        </Link>
        <nav aria-label="เมนูผู้ใช้งาน">
          <Link to="/dashboard" aria-current={activePage === 'overview' ? 'page' : undefined}><Icon name="overview" />ภาพรวม</Link>
          <Link to="/live-map" aria-current={activePage === 'map' ? 'page' : undefined}><Icon name="map" />แผนที่จุดเสี่ยง</Link>
          <Link to="/dashboard?view=cases" aria-current={activePage === 'cases' ? 'page' : undefined}><Icon name="list" />รายการจุดเสี่ยง</Link>
          <Link to="/my-videos" aria-current={activePage === 'videos' ? 'page' : undefined}><Icon name="video" />วิดีโอของฉัน</Link>
        </nav>
      </aside>
      <main className="dash-main">
        <header className="dash-top">
          <h1>{title}</h1>
          <label className="dash-search">
            <Icon name="search" /><input type="search" aria-label={searchLabel} placeholder={searchLabel} value={query} onChange={(e) => onQueryChange(e.target.value)} />
          </label>
          <VideoUpload onUploaded={onVideoUploaded} />
          <AccountMenu />
        </header>
        <div className="dash-content">{children}</div>
      </main>
    </div>
  )
}
