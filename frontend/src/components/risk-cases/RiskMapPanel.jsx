import { useId } from 'react'
import UserIcon from '@/components/ui/UserIcon'
import { Link } from '@/routes/router'
import RiskMapLegend from './RiskMapLegend'
import SurveyMap from './SurveyMap'

export default function RiskMapPanel({ data, selection, panelRef }) {
  const titleId = useId()

  return (
    <section className="dash-panel dash-map" ref={panelRef} aria-labelledby={titleId}>
      <header>
        <h2 id={titleId}>แผนที่จุดเสี่ยง</h2>
        <Link className="dash-text-link" to="/live-map">ขยายแผนที่ <UserIcon name="expand" /></Link>
      </header>
      <SurveyMap data={data} selection={selection} />
      <RiskMapLegend />
    </section>
  )
}
