import { useState } from 'react'
import UserSidebar from './UserSidebar'
import UserTopBar from './UserTopBar'
import './user-layout.css'

export default function UserLayout({ activePage, title, query, onQueryChange, children }) {
  const [railExpanded, setRailExpanded] = useState(true)

  return (
    <div className="patrol-dashboard" data-page={activePage} data-rail-expanded={railExpanded}>
      <UserSidebar
        activePage={activePage}
        expanded={railExpanded}
        onToggle={() => setRailExpanded((expanded) => !expanded)}
      />
      <main className="dash-main">
        <UserTopBar
          activePage={activePage}
          title={title}
          query={query}
          onQueryChange={onQueryChange}
        />
        <div className="dash-content">{children}</div>
      </main>
    </div>
  )
}
