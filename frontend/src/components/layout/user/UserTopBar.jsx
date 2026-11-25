import { useAuth } from '@/contexts/AuthContext'
import { Link } from '@/routes/router'
import UserIcon from '@/components/ui/UserIcon'

const searchLabels = {
  cases: 'ค้นหารหัสเคสหรือรหัสเสาไฟ',
  videos: 'ค้นหาชื่อไฟล์วิดีโอ',
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
        <strong>{user.username}</strong>
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

export default function UserTopBar({ activePage, title, query, onQueryChange }) {
  const searchLabel = searchLabels[activePage] ?? 'ค้นหารหัสจุดเสี่ยง'

  return (
    <header className="dash-top">
      <h1>{title}</h1>
      <label className="dash-search">
        <UserIcon name="search" />
        <input
          type="search"
          aria-label={searchLabel}
          placeholder={searchLabel}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </label>
      <AccountMenu />
    </header>
  )
}
