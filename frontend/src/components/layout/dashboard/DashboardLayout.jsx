import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import DashboardSidebar from './DashboardSidebar'
import DashboardTopBar from './DashboardTopBar'
import './dashboard-layout.css'

// Share the current rail state across user routes within this app session.
let desktopRailExpanded = true

export default function DashboardLayout({ activePage, title, query, onQueryChange, searchAction, children }) {
  const [railExpanded, setRailExpanded] = useState(() => desktopRailExpanded)
  const layoutRef = useRef(null)
  const railMotion = useRef(null)

  useLayoutEffect(() => {
    const layout = layoutRef.current
    const media = gsap.matchMedia()
    media.add('(width > 760px) and (prefers-reduced-motion: no-preference)', () => {
      const motion = gsap.fromTo(layout, { '--dash-rail-progress': 0 }, {
        '--dash-rail-progress': 1,
        duration: 0.32,
        ease: 'power2.inOut',
        paused: true,
      })
      motion.progress(layout.dataset.railExpanded === 'true' ? 0 : 1)
      railMotion.current = motion
      return () => { railMotion.current = null }
    })
    return () => media.revert()
  }, [])

  useLayoutEffect(() => {
    if (railExpanded) railMotion.current?.reverse()
    else railMotion.current?.play()
  }, [railExpanded])

  function toggleRail() {
    desktopRailExpanded = !railExpanded
    setRailExpanded(desktopRailExpanded)
  }

  return (
    <div ref={layoutRef} className="patrol-dashboard" data-page={activePage} data-rail-expanded={railExpanded}>
      <DashboardSidebar
        activePage={activePage}
        expanded={railExpanded}
        onToggle={toggleRail}
      />
      <main className="dash-main">
        <DashboardTopBar
          activePage={activePage}
          title={title}
          query={query}
          onQueryChange={onQueryChange}
          searchAction={searchAction}
        />
        <div className="dash-scroll" key={activePage}>
          <div className="dash-content">{children}</div>
        </div>
      </main>
    </div>
  )
}
