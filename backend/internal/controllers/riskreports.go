package controllers

import (
	"net/http"

	"ai-dashcam-patrol/backend/internal/services"
)

// ListRiskReports คืนรายการ span ที่มีความเสี่ยง: GET /api/risk-reports
// ใช้กับหน้า frontend/src/pages/RiskReports
func ListRiskReports(w http.ResponseWriter, r *http.Request) {
	spans, err := services.ListRiskSpans(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "cannot load risk reports")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": spans})
}
