package controllers

import (
	"net/http"

	"ai-dashcam-patrol/backend/internal/entities"
)

// GetLiveMap คืนข้อมูลสำหรับแผนที่: GET /api/live-map
// ใช้กับหน้า frontend/src/pages/LiveMap (ยังเป็นข้อมูลว่าง)
func GetLiveMap(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, entities.LiveMap{
		Tracks: []entities.Track{},
		Spans:  []entities.RiskSpan{},
	})
}
