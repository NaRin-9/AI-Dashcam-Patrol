import { useState } from 'react'
import logo from '@/assets/pea-logo.png'
import { routes } from '@/routes'
import { Link, usePath } from '@/routes/router'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const path = usePath()
  const { user, isAuthenticated, isAdminOrAbove, isSuperadmin, logout } = useAuth()
  const links = routes.filter((r) => r.showInNav)

  return (
    <header className="nav">
      <Link className="brand" to={isAuthenticated ? '/dashboard' : '/'}>
        <img className="logo" src={logo} alt="การไฟฟ้าส่วนภูมิภาค" />
        <span className="brand-name">ตรวจจับความเสี่ยง ก่อนเกิดปัญหา</span>
      </Link>

      <button
        className="nav-toggle"
        aria-expanded={open}
        aria-controls="nav-menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="sr-only">{open ? 'ปิดเมนู' : 'เปิดเมนู'}</span>
        <span className="bars" aria-hidden="true" />
      </button>

      <nav id="nav-menu" className={`nav-menu ${open ? 'is-open' : ''}`}>
        <ul>
          {links.map((l) => (
            <li key={l.path}>
              <Link
                to={l.path}
                aria-current={path === l.path ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            </li>
          ))}

          {/* Role-based navigation links */}
          {isAuthenticated && (
            <li>
              <Link
                to="/dashboard"
                aria-current={path === '/dashboard' ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                Dashboard
              </Link>
            </li>
          )}
          {isAdminOrAbove && (
            <li>
              <Link
                to="/admin"
                aria-current={path === '/admin' ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                Admin
              </Link>
            </li>
          )}
          {isSuperadmin && (
            <li>
              <Link
                to="/superadmin"
                aria-current={path === '/superadmin' ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                Super Admin
              </Link>
            </li>
          )}
        </ul>
        <span className="nav-divider" aria-hidden="true" />
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.9rem', color: '#fff', opacity: 0.9 }}>
              {user?.username} ({user?.role})
            </span>
            <button
              className="btn btn-gold btn-sm"
              onClick={() => {
                setOpen(false)
                logout()
              }}
              style={{ border: 'none', cursor: 'pointer' }}
            >
              Log Out
            </button>
          </div>
        ) : (
          <Link className="btn btn-gold btn-sm" to="/login" onClick={() => setOpen(false)}>
            Log In
          </Link>
        )}
      </nav>
    </header>
  )
}
