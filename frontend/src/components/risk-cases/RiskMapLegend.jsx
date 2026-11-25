import { riskLabels } from '@/utils/risk-case-format'

export default function RiskMapLegend({ showTracks = false }) {
  return (
    <div className="dash-legend">
      {showTracks && <span><i className="live-map-key-track" aria-hidden="true" />เส้นทางรถ</span>}
      <span><i className="live-map-key-point" aria-hidden="true" />{riskLabels.near}</span>
      <span><i className="live-map-key-point is-touching" aria-hidden="true" />{riskLabels.touching}</span>
    </div>
  )
}
