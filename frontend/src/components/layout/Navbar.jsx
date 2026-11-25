import { useState } from 'react'
import {
  Home,
  MapPin,
  AlertTriangle,
  HelpCircle,
  LayoutDashboard,
  Video,
  Shield,
  ShieldCheck,
  LogIn,
  LogOut,
  MoreHorizontal,
  X,
} from 'lucide-react'
import logo from '@/assets/pea-logo.png'
import { useAuth } from '@/contexts/AuthContext'
import { Link, usePath } from '@/routes/router'
import './navbar.css'

/**
 * Navbar / Navigation Component
 * - PC / Desktop: Side Bar (แถบเมนูด้านซ้ายแนวตั้ง)
 * - Mobile / Phone: Bottom Navigation Bar (แถบเมนูด้านล่างแนวนอน) + Slim Top Bar
 *
 * สามารถเรียกใช้งานตรงๆ บนแต่ละหน้าได้ เช่น:
 *   import Navbar from '@/components/layout/Navbar'
 *   <Navbar />
 * หรือเรียกใช้ผ่าน <Layout>{children}</Layout>
 */
export default function Navbar() {
  const path = usePath()
  const { user, isAuthenticated, isAdminOrAbove, isSuperadmin, logout } = useAuth()
  const [showMobileDrawer, setShowMobileDrawer] = useState(false)

  // เมนูหลักสำหรับ Sidebar (PC)
  const navItems = [
    { to: '/', label: 'หน้าแรก', icon: Home },
    { to: '/live-map', label: 'แผนที่สด', icon: MapPin },
    { to: '/risk-reports', label: 'รายงานจุดเสี่ยง', icon: AlertTriangle },
    { to: '/how-it-works', label: 'ขั้นตอนการทำงาน', icon: HelpCircle },
  ]

  // เมนูเพิ่มเติมตาม Role
  const authItems = []
  if (isAuthenticated) {
    authItems.push({ to: '/dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard })
    authItems.push({ to: '/my-videos', label: 'วิดีโอของฉัน', icon: Video })
  }
  if (isAdminOrAbove) {
    authItems.push({ to: '/admin', label: 'ผู้ดูแลระบบ (Admin)', icon: Shield })
  }
  if (isSuperadmin) {
    authItems.push({ to: '/superadmin', label: 'จัดการระบบ (Superadmin)', icon: ShieldCheck })
  }

  // เมนูสำหรับ Bottom Bar (Mobile) - สูงสุด 5 แท็บหลัก
  const bottomItems = [
    { to: '/', label: 'หน้าแรก', icon: Home },
    { to: '/live-map', label: 'แผนที่', icon: MapPin },
    { to: '/risk-reports', label: 'จุดเสี่ยง', icon: AlertTriangle },
  ]

  if (isAuthenticated) {
    bottomItems.push({ to: '/dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard })
  } else {
    bottomItems.push({ to: '/how-it-works', label: 'วิธีใช้', icon: HelpCircle })
    bottomItems.push({ to: '/login', label: 'เข้าสู่ระบบ', icon: LogIn })
  }

  return (
    <>
      {/* =========================================================
          1. DESKTOP SIDEBAR (แสดงเฉพาะบน PC / จอกว้าง > 768px)
         ========================================================= */}
      <aside className="app-nav-sidebar" aria-label="แถบเมนูหลัก">
        {/* Brand Header */}
        <Link to="/" className="app-nav-sidebar-brand" aria-label="กลับสู่หน้าแรก">
          <img src={logo} alt="PEA Logo" className="app-nav-sidebar-logo" />
          <div className="app-nav-sidebar-brand-text">
            <span className="app-nav-sidebar-title">PEA PATROL</span>
            <span className="app-nav-sidebar-subtitle">ระบบตรวจจับจุดเสี่ยง AI</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="app-nav-sidebar-links">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = path === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`app-nav-sidebar-link ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="app-nav-sidebar-icon">
                  <Icon size={19} />
                </span>
                <span>{item.label}</span>
              </Link>
            )
          })}

          {authItems.length > 0 && (
            <>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '8px 4px' }} />
              {authItems.map((item) => {
                const Icon = item.icon
                const isActive = path === item.to
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`app-nav-sidebar-link ${isActive ? 'active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="app-nav-sidebar-icon">
                      <Icon size={19} />
                    </span>
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </>
          )}
        </nav>

        {/* Footer / User Profile & Auth */}
        <div className="app-nav-sidebar-footer">
          {isAuthenticated && user ? (
            <>
              <div className="app-nav-user-card">
                <div className="app-nav-avatar">
                  {user.username ? user.username.slice(0, 1).toUpperCase() : 'U'}
                </div>
                <div className="app-nav-user-info">
                  <span className="app-nav-username">{user.username}</span>
                  <span className="app-nav-userrole">{user.role || 'Member'}</span>
                </div>
              </div>
              <button
                type="button"
                className="app-nav-auth-btn app-nav-logout-btn"
                onClick={logout}
              >
                <LogOut size={16} />
                <span>ออกจากระบบ</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="app-nav-auth-btn app-nav-login-btn">
              <LogIn size={16} />
              <span>เข้าสู่ระบบ</span>
            </Link>
          )}
        </div>
      </aside>

      {/* =========================================================
          2. MOBILE SLIM TOP BAR (แสดงเฉพาะบนมือถือ <= 768px)
         ========================================================= */}
      <header className="app-nav-mobile-top">
        <Link to="/" className="app-nav-mobile-brand">
          <img src={logo} alt="PEA Logo" className="app-nav-mobile-logo" />
          <span className="app-nav-mobile-title">PEA PATROL</span>
        </Link>
        {isAuthenticated && user ? (
          <div
            className="app-nav-avatar"
            style={{ width: '28px', height: '28px', fontSize: '0.75rem', cursor: 'pointer' }}
            onClick={() => setShowMobileDrawer(true)}
            title="ดูเมนูเพิ่มเติม"
          >
            {user.username ? user.username.slice(0, 1).toUpperCase() : 'U'}
          </div>
        ) : (
          <Link
            to="/login"
            style={{
              fontSize: '0.8rem',
              color: 'var(--gold, #e5a823)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <LogIn size={15} />
            <span>เข้าสู่ระบบ</span>
          </Link>
        )}
      </header>

      {/* =========================================================
          3. MOBILE BOTTOM BAR (แสดงเฉพาะบนมือถือ <= 768px)
         ========================================================= */}
      <nav className="app-nav-bottom-bar" aria-label="แถบเมนูด้านล่าง">
        {bottomItems.map((item) => {
          const Icon = item.icon
          const isActive = path === item.to
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`app-nav-bottom-item ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="app-nav-bottom-icon">
                <Icon size={20} />
              </span>
              <span>{item.label}</span>
            </Link>
          )
        })}

        {/* ปุ่มแท็บ "เพิ่มเติม" เมื่อเข้าสู่ระบบแล้ว */}
        {isAuthenticated && (
          <button
            type="button"
            className={`app-nav-bottom-item ${showMobileDrawer ? 'active' : ''}`}
            onClick={() => setShowMobileDrawer(true)}
          >
            <span className="app-nav-bottom-icon">
              <MoreHorizontal size={20} />
            </span>
            <span>เพิ่มเติม</span>
          </button>
        )}
      </nav>

      {/* =========================================================
          4. MOBILE SLIDE-UP DRAWER (เมนูเพิ่มเติมสำหรับมือถือ)
         ========================================================= */}
      {showMobileDrawer && (
        <>
          <div
            className="app-nav-drawer-overlay"
            onClick={() => setShowMobileDrawer(false)}
            aria-hidden="true"
          />
          <div className="app-nav-drawer" role="dialog" aria-modal="true" aria-label="เมนูเพิ่มเติม">
            <div className="app-nav-drawer-header">
              {isAuthenticated && user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="app-nav-avatar">
                    {user.username ? user.username.slice(0, 1).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{user.username}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gold, #e5a823)' }}>
                      {user.role}
                    </div>
                  </div>
                </div>
              ) : (
                <span className="app-nav-drawer-title">เมนูเพิ่มเติม</span>
              )}
              <button
                type="button"
                className="app-nav-drawer-close"
                onClick={() => setShowMobileDrawer(false)}
                aria-label="ปิดเมนู"
              >
                <X size={18} />
              </button>
            </div>

            <div className="app-nav-drawer-links">
              {/* รายการลิงก์เพิ่มเติมที่ไม่ได้อยู่ใน 4 แท็บแรก */}
              <Link
                to="/how-it-works"
                className="app-nav-drawer-link"
                onClick={() => setShowMobileDrawer(false)}
              >
                <HelpCircle size={18} />
                <span>ขั้นตอนการทำงาน</span>
              </Link>

              {authItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="app-nav-drawer-link"
                    onClick={() => setShowMobileDrawer(false)}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>

            <div className="app-nav-drawer-footer">
              {isAuthenticated ? (
                <button
                  type="button"
                  className="app-nav-auth-btn app-nav-logout-btn"
                  onClick={() => {
                    setShowMobileDrawer(false)
                    logout()
                  }}
                >
                  <LogOut size={16} />
                  <span>ออกจากระบบ</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="app-nav-auth-btn app-nav-login-btn"
                  onClick={() => setShowMobileDrawer(false)}
                >
                  <LogIn size={16} />
                  <span>เข้าสู่ระบบ</span>
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}

// Export เป็น Navigation ด้วยเพื่อความสะดวกในการเรียกใช้
export { Navbar as Navigation }
