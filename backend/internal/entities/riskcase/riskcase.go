package riskcase

import "time"

// RiskCase เก็บจุดเสี่ยงและพิกัดที่ยืนยันแล้วในตาราง risk_cases
type RiskCase struct {
	ID         int        `json:"id"`
	CaseCode   string     `json:"caseCode"`
	PoleCode   *string    `json:"poleCode"`
	Latitude   float64    `json:"latitude"`
	Longitude  float64    `json:"longitude"`
	RiskLevel  string     `json:"riskLevel"`
	Status     string     `json:"status"`
	CreatedAt  time.Time  `json:"createdAt"`
	ResolvedAt *time.Time `json:"resolvedAt"`
}
