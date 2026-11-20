package controllers

import (
	"net/http"

	"ai-dashcam-patrol/backend/internal/services"
)

// GetLiveMap คืนข้อมูลสำหรับแผนที่: GET /api/live-map
func GetLiveMap(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, services.DemoLiveMap())
}
