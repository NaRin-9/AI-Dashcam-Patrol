package controllers

import "net/http"

// Health ใช้ตรวจว่า backend ทำงานอยู่: GET /api/health
func Health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
