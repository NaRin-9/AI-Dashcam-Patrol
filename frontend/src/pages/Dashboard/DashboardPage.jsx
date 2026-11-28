import { useEffect, useRef, useState } from 'react'
import RiskMapPanel from '@/components/risk-cases/RiskMapPanel'
import DashboardGreeting from '@/components/layout/dashboard/DashboardGreeting'
import DashboardLayout from '@/components/layout/dashboard/DashboardLayout'
import useSurvey from '@/hooks/useSurvey'
import { apiGet } from '@/services/api'
import OverviewCaseList from './components/OverviewCaseList'
import OverviewSummary from './components/OverviewSummary'
import './dashboard-overview.css'

const recentCaseLimit = 5

export default function DashboardPage() {
  const { data, error } = useSurvey()
  const [videos, setVideos] = useState(null)
  const [query, setQuery] = useState('')
  const term = query.trim().toLowerCase()
  const [selection, setSelection] = useState(null)
  const mapPanel = useRef(null)
  const isSearching = Boolean(term)
  const cases = data?.cases ?? []
  const matches = cases
    .filter((item) => item.id.toLowerCase().includes(term))
    .sort((a, b) => Date.parse(b.capturedAt) - Date.parse(a.capturedAt))
  const visibleCases = isSearching ? matches : matches.slice(0, recentCaseLimit)

  useEffect(() => {
    const request = new AbortController()
    apiGet('/videos', { signal: request.signal })
      .then((res) => {
        if (!request.signal.aborted) setVideos(res.videos ?? [])
      })
      .catch(() => {
        if (!request.signal.aborted) setVideos(null)
      })
    return () => request.abort()
  }, [])

  useEffect(() => {
    if (selection) mapPanel.current?.scrollIntoView({ block: 'nearest' })
  }, [selection])

  // Keep the map mounted when search puts the case list first in reading order.
  const map = <RiskMapPanel key="map" data={data} selection={selection} panelRef={mapPanel} />
  const caseList = (
    <OverviewCaseList
      key="cases"
      cases={visibleCases}
      total={data ? cases.length : null}
      error={error}
      isSearching={isSearching}
      onSelect={(id) => setSelection({ id })}
    />
  )

  return (
    <DashboardLayout activePage="overview" title="ภาพรวม" query={query} onQueryChange={setQuery}>
      {error && (
        <div className="overview-error" role="alert">
          <span>โหลดข้อมูลจุดเสี่ยงไม่สำเร็จ</span>
          <button type="button" onClick={() => window.location.reload()}>ลองอีกครั้ง</button>
        </div>
      )}
      <DashboardGreeting searching={isSearching} />
      <OverviewSummary cases={data ? cases : null} videos={videos} />
      <div className="dash-grid overview-grid" data-searching={isSearching}>
        {isSearching ? [caseList, map] : [map, caseList]}
      </div>
    </DashboardLayout>
  )
}
