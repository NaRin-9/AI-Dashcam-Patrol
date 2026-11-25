import { useId } from 'react'
import logo from '@/assets/pea-logo.png'
import useMediaQuery from '@/hooks/useMediaQuery'
import { Link } from '@/routes/router'
import UserIcon from '@/components/ui/UserIcon'

const navigationItems = [
  { page: 'overview', path: '/dashboard', icon: 'overview', label: 'ภาพรวม' },
  { page: 'map', path: '/live-map', icon: 'map', label: 'แผนที่จุดเสี่ยง' },
  { page: 'cases', path: '/risk-cases', icon: 'list', label: 'รายการจุดเสี่ยง' },
  { page: 'videos', path: '/my-videos', icon: 'video', label: 'วิดีโอของฉัน' },
]

export default function UserSidebar({ activePage, expanded, onToggle }) {
  const hasSideRail = useMediaQuery('(width > 760px)')
  const railId = useId()
  const railLabel = expanded ? 'ซ่อนเมนูด้านซ้าย' : 'เปิดเมนูด้านซ้าย'

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
          <img src={logo} alt="" width="48" height="48" />
        </button>
      )}
      <aside className="dash-rail" id={railId} inert={hasSideRail && !expanded}>
        <Link to="/" className="dash-brand" aria-label="หน้าแรก การไฟฟ้าส่วนภูมิภาค">
          <img src={logo} alt="" />
          <span>การไฟฟ้าส่วนภูมิภาค</span>
        </Link>
        <nav aria-label="เมนูผู้ใช้งาน">
          {navigationItems.map(({ page, path, icon, label }) => (
            <Link key={page} to={path} aria-current={activePage === page ? 'page' : undefined}>
              <UserIcon name={icon} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
}
