import { useEffect, useId, useRef, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Link } from '@/routes/router'
import UserIcon from '@/components/ui/UserIcon'

const searchLabels = {
  cases: 'ค้นหารหัสเคสหรือรหัสเสาไฟ',
  videos: 'ค้นหาชื่อไฟล์วิดีโอ',
}

function AccountMenu() {
  const { user, isAdminOrAbove, isSuperadmin, logout, logoutAll } = useAuth()
  const displayName = [user.firstName?.trim(), user.lastName?.trim()].filter(Boolean).join(' ') || user.username
  const department = user.department?.trim() || 'ยังไม่ระบุแผนก'

  return (
    <details className="dash-account">
      <summary>
        <b aria-hidden="true">{displayName.slice(0, 1).toUpperCase()}</b>
        <span className="dash-account-identity">
          <span className="dash-account-name" title={displayName}>{displayName}</span>
          <small className="dash-account-department" title={department}>{department}</small>
        </span>
      </summary>
      <div className="dash-account-menu">
        <strong>{displayName}</strong>
        <small>{department}</small>
        {displayName !== user.username && <small>ชื่อผู้ใช้ {user.username}</small>}
        <small>{user.email}</small>
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

export default function UserTopBar({ activePage, title, query, onQueryChange, searchAction }) {
  const searchLabel = searchLabels[activePage] ?? 'ค้นหารหัสจุดเสี่ยง'
  const isMap = activePage === 'map'
  const [searchExpanded, setSearchExpanded] = useState(false)
  const searchId = useId()
  const inputRef = useRef(null)
  const searchToggle = useRef(null)

  useEffect(() => {
    if (searchExpanded) inputRef.current?.focus()
  }, [searchExpanded])

  return (
    <header className="dash-top">
      {activePage !== 'overview' && (
        <Link className="dash-map-back" to="/dashboard" aria-label="กลับหน้าภาพรวม">
          <UserIcon name="back" size={22} />
        </Link>
      )}
      <h1>{title}</h1>
      <div className="dash-search" id={searchId} data-expanded={searchExpanded}>
        <label>
          <UserIcon name="search" />
          <input
            ref={inputRef}
            type="search"
            aria-label={searchLabel}
            placeholder={searchLabel}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape' && searchExpanded && searchToggle.current?.getClientRects().length) {
                setSearchExpanded(false)
                searchToggle.current.focus()
              }
            }}
          />
        </label>
        {searchAction}
      </div>
      <div className="dash-top-actions">
        {isMap && (
          <button
            ref={searchToggle}
            className="dash-map-search-toggle"
            type="button"
            aria-label={searchExpanded ? 'ซ่อนช่องค้นหา' : searchLabel}
            aria-expanded={searchExpanded}
            aria-controls={searchId}
            onClick={() => setSearchExpanded((expanded) => !expanded)}
          >
            <UserIcon name="search" />
          </button>
        )}
        <AccountMenu />
      </div>
    </header>
  )
}
