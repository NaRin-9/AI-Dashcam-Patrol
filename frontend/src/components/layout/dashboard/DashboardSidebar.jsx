import { useId } from 'react'
import { DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons'
import logo from '@/assets/pea-logo.png'
import { useAuth } from '@/contexts/AuthContext'
import useMediaQuery from '@/hooks/useMediaQuery'
import { Link } from '@/routes/router'
import UserIcon from '@/components/ui/UserIcon'

const userNavigation = [
  { page: 'overview', path: '/dashboard', icon: 'overview', label: 'ภาพรวม' },
  { page: 'map', path: '/live-map', icon: 'map', label: 'แผนที่จุดเสี่ยง' },
  { page: 'cases', path: '/risk-cases', icon: 'list', label: 'รายการจุดเสี่ยง' },
  { page: 'videos', path: '/my-videos', icon: 'video', label: 'วิดีโอของฉัน' },
]

const adminNavigation = [
  ...userNavigation,
  { page: 'admin', path: '/admin', icon: 'users', label: 'จัดการผู้ใช้' },
]

const superadminNavigation = [
  { page: 'superadmin', path: '/superadmin', icon: 'overview', label: 'ภาพรวมระบบ' },
  { page: 'superadmin-users', path: '/superadmin?view=users', icon: 'users', label: 'จัดการผู้ใช้' },
  { page: 'superadmin-departments', path: '/superadmin?view=departments', icon: 'departments', label: 'จัดการแผนก' },
]

export default function DashboardSidebar({ activePage, expanded, onToggle }) {
  const { isSuperadmin, isAdminOrAbove } = useAuth()
  const hasSideRail = useMediaQuery('(width > 760px)')
  const isCollapsed = hasSideRail && !expanded
  const railId = useId()
  const railLabel = expanded ? 'ย่อเมนูด้านซ้าย' : 'ขยายเมนูด้านซ้าย'
  const navigationItems = isSuperadmin
    ? superadminNavigation
    : isAdminOrAbove ? adminNavigation : userNavigation

  return (
    <>
      {hasSideRail && (
        <button
          type="button"
          className="dash-rail-toggle"
          aria-controls={railId}
          aria-expanded={expanded}
          aria-label={railLabel}
          title={railLabel}
          onClick={onToggle}
        >
          <span className="dash-rail-toggle-icon" aria-hidden="true">
            {expanded ? <DoubleLeftOutlined /> : <DoubleRightOutlined />}
          </span>
        </button>
      )}
      <aside className="dash-rail" id={railId}>
        <Link to="/" className="dash-brand" aria-label="หน้าแรก การไฟฟ้าส่วนภูมิภาค" inert={isCollapsed}>
          <img src={logo} alt="" />
          <span>การไฟฟ้าส่วนภูมิภาค</span>
        </Link>
        <nav aria-label="เมนูผู้ใช้งาน">
          {navigationItems.map(({ page, path, icon, label }) => (
            <Link
              key={page}
              to={path}
              aria-current={activePage === page ? 'page' : undefined}
              title={isCollapsed ? label : undefined}
            >
              <UserIcon name={icon} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
}
