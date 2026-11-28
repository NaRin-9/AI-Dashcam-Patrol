import Sidebar from '@/components/sidebar/Sidebar'
import DashboardTopBar from './DashboardTopBar'
import './dashboard-layout.css'

export default function DashboardLayout({ activePage, title, query, onQueryChange, searchAction, children }) {
  return (
    <div className="patrol-dashboard" data-page={activePage}>
      <Sidebar activePage={activePage} />
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
