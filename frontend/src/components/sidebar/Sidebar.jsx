import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import logo from '@/assets/pea-logo.png'
import { useAuth } from '@/contexts/AuthContext'
import useMediaQuery from '@/hooks/useMediaQuery'
import { Link } from '@/routes/router'
import UserIcon from '@/components/ui/UserIcon'
import './sidebar.css'

const roleLabels = {
  user: 'ผู้ใช้งาน',
  admin: 'ผู้ดูแลระบบ',
  superadmin: 'ผู้ดูแลระบบสูงสุด',
}

const patrolGroupItems = [
  { page: 'map', path: '/live-map', icon: 'map', label: 'แผนที่จุดเสี่ยง' },
  { page: 'cases', path: '/risk-cases', icon: 'list', label: 'รายการจุดเสี่ยง' },
]

const myVideosItem = { page: 'videos', path: '/my-videos', icon: 'video', label: 'วิดีโอของฉัน' }
const notificationsItem = { page: 'notifications', path: '/notifications', icon: 'notifications', label: 'การแจ้งเตือน' }

const superadminGroupItems = [
  { page: 'superadmin-users', path: '/superadmin?view=users', icon: 'users', label: 'จัดการผู้ใช้' },
  { page: 'superadmin-departments', path: '/superadmin?view=departments', icon: 'departments', label: 'จัดการแผนก' },
]

// Share sidebar & group expansion state across routes within this app session.
let desktopRailExpanded = true
let navGroupExpanded = true

function getNavigationConfig(isSuperadmin, isAdminOrAbove) {
  if (isSuperadmin) {
    return {
      homePath: '/superadmin',
      primary: [
        { page: 'superadmin', path: '/superadmin', icon: 'overview', label: 'ภาพรวมระบบ' },
      ],
      group: {
        id: 'system-management',
        icon: 'admin',
        label: 'การจัดการระบบ',
        items: superadminGroupItems,
      },
      trailing: [notificationsItem],
    }
  }

  return {
    homePath: '/dashboard',
    primary: [
      { page: 'overview', path: '/dashboard', icon: 'overview', label: 'ภาพรวม' },
    ],
    group: {
      id: 'patrol-survey',
      icon: 'patrol',
      label: 'สำรวจจุดเสี่ยง',
      items: patrolGroupItems,
    },
    trailing: [
      myVideosItem,
      ...(isAdminOrAbove ? [{ page: 'admin', path: '/admin', icon: 'users', label: 'จัดการผู้ใช้' }] : []),
      notificationsItem,
    ],
  }
}

export default function Sidebar({ activePage, className = '' }) {
  const { user, isSuperadmin, isAdminOrAbove, logout, logoutAll } = useAuth()
  const hasSideRail = useMediaQuery('(width > 760px)')
  const [expanded, setExpanded] = useState(() => desktopRailExpanded)
  const [groupOpen, setGroupOpen] = useState(() => navGroupExpanded)
  const [accountOpen, setAccountOpen] = useState(false)
  const rootRef = useRef(null)
  const accountRef = useRef(null)
  const railMotion = useRef(null)
  const railId = useId()
  const groupPanelId = useId()
  const accountMenuId = useId()

  useLayoutEffect(() => {
    const root = rootRef.current
    const media = gsap.matchMedia()
    media.add('(width > 760px) and (prefers-reduced-motion: no-preference)', () => {
      const motion = gsap.fromTo(root, { '--sidebar-progress': 0 }, {
        '--sidebar-progress': 1,
        duration: 0.28,
        ease: 'power2.inOut',
        paused: true,
      })
      motion.progress(root.dataset.expanded === 'true' ? 0 : 1)
      railMotion.current = motion
      return () => { railMotion.current = null }
    })
    return () => media.revert()
  }, [])

  useLayoutEffect(() => {
    if (expanded) railMotion.current?.reverse()
    else railMotion.current?.play()
  }, [expanded])

  useEffect(() => {
    if (!accountOpen) return undefined
    function handlePointerDown(event) {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false)
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setAccountOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [accountOpen])

  function toggleExpanded() {
    desktopRailExpanded = !expanded
    setExpanded(desktopRailExpanded)
  }

  function toggleGroup() {
    navGroupExpanded = !groupOpen
    setGroupOpen(navGroupExpanded)
  }

  const isCollapsed = hasSideRail && !expanded
  const railLabel = expanded ? 'ย่อเมนูด้านซ้าย' : 'ขยายเมนูด้านซ้าย'
  const navConfig = getNavigationConfig(isSuperadmin, isAdminOrAbove)
  const flatMobileItems = [
    ...navConfig.primary,
    ...navConfig.group.items,
    ...navConfig.trailing,
  ]

  const displayName = [user?.firstName?.trim(), user?.lastName?.trim()].filter(Boolean).join(' ') || user?.username || 'ผู้ใช้งาน'
  const subtitle = user?.email?.trim() || user?.department?.trim() || roleLabels[user?.role] || ''
  const department = user?.department?.trim() || 'ยังไม่ระบุแผนก'
  const roleLabel = roleLabels[user?.role] || 'ผู้ใช้งาน'
  const initial = displayName.slice(0, 1).toUpperCase()
  const groupHasActive = navConfig.group.items.some((item) => item.page === activePage)

  function renderNavLink({ page, path, icon, label }) {
    return (
      <Link
        key={page}
        to={path}
        className="sidebar-link"
        aria-current={activePage === page ? 'page' : undefined}
        title={isCollapsed ? label : undefined}
      >
        <UserIcon name={icon} size={18} />
        <span className="sidebar-link-label">{label}</span>
      </Link>
    )
  }

  return (
    <div
      ref={rootRef}
      className={className ? `app-sidebar ${className}` : 'app-sidebar'}
      data-expanded={expanded}
    >
      <aside className="sidebar-rail" id={railId}>
        {hasSideRail && (
          <header className="sidebar-header">
            <Link
              to={navConfig.homePath}
              className="sidebar-brand"
              aria-label="หน้าแรก การไฟฟ้าส่วนภูมิภาค"
              title={isCollapsed ? 'การไฟฟ้าส่วนภูมิภาค' : undefined}
            >
              <span className="sidebar-brand-mark">
                <img src={logo} alt="" />
              </span>
              <span className="sidebar-brand-text">
                <strong>การไฟฟ้าส่วนภูมิภาค</strong>
                <small>AI Dashcam Patrol</small>
              </span>
            </Link>
            <button
              type="button"
              className="sidebar-toggle"
              aria-controls={railId}
              aria-expanded={expanded}
              aria-label={railLabel}
              title={railLabel}
              onClick={toggleExpanded}
            >
              <UserIcon name={expanded ? 'sidebarCollapse' : 'sidebarExpand'} size={18} />
            </button>
          </header>
        )}

        <nav className="sidebar-nav" aria-label="เมนูผู้ใช้งาน">
          {!hasSideRail || isCollapsed ? (
            flatMobileItems.map(renderNavLink)
          ) : (
            <>
              {navConfig.primary.map(renderNavLink)}

              <div className="sidebar-group" data-open={groupOpen} data-active={groupHasActive}>
                <button
                  type="button"
                  className="sidebar-group-trigger"
                  aria-expanded={groupOpen}
                  aria-controls={groupPanelId}
                  onClick={toggleGroup}
                >
                  <UserIcon name={navConfig.group.icon} size={18} />
                  <span className="sidebar-link-label">{navConfig.group.label}</span>
                  <UserIcon name="chevronDown" size={16} className="sidebar-group-chevron" />
                </button>
                {groupOpen && (
                  <div className="sidebar-group-items" id={groupPanelId}>
                    {navConfig.group.items.map((item) => (
                      <Link
                        key={item.page}
                        to={item.path}
                        className="sidebar-sublink"
                        aria-current={activePage === item.page ? 'page' : undefined}
                      >
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {navConfig.trailing.map(renderNavLink)}
            </>
          )}
        </nav>

        {hasSideRail && user && (
          <footer className="sidebar-footer" ref={accountRef}>
            {accountOpen && (
              <div className="sidebar-account-menu" id={accountMenuId} role="region" aria-label="ข้อมูลบัญชีผู้ใช้">
                <div className="sidebar-account-meta">
                  <strong>{displayName}</strong>
                  <small>{roleLabel} · {department}</small>
                  {user.email && <small>{user.email}</small>}
                </div>
                <div className="sidebar-account-actions">
                  <button type="button" onClick={() => { setAccountOpen(false); logout() }}>
                    <UserIcon name="logout" size={16} />
                    <span>ออกจากระบบ</span>
                  </button>
                  <button type="button" onClick={() => { setAccountOpen(false); logoutAll() }}>
                    ออกจากระบบทุกอุปกรณ์
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              className="sidebar-user-trigger"
              aria-expanded={accountOpen}
              aria-controls={accountMenuId}
              title={isCollapsed ? `${displayName} (${department})` : undefined}
              onClick={() => setAccountOpen((open) => !open)}
            >
              <span className="sidebar-user-avatar" aria-hidden="true">
                {initial}
                <i className={user.isActive ? 'is-active' : ''} />
              </span>
              <span className="sidebar-user-info">
                <span className="sidebar-user-name">{displayName}</span>
                <small className="sidebar-user-sub">{subtitle}</small>
              </span>
              <UserIcon name="arrow" size={16} className="sidebar-user-chevron" />
            </button>
          </footer>
        )}
      </aside>
    </div>
  )
}
