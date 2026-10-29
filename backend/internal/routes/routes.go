// routes: รายการ API ทั้งหมดอยู่ที่ไฟล์นี้ที่เดียว (คู่กับ frontend/src/routes)
// จับคู่ "method + path" กับ controller ที่รับผิดชอบ
// เพิ่ม endpoint ใหม่: เขียนฟังก์ชันใน internal/controllers แล้วเพิ่ม 1 บรรทัดที่นี่
package routes

import (
	"net/http"

	"ai-dashcam-patrol/backend/internal/controllers"
)

func New(allowedOrigin string) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/health", controllers.Health)
	mux.HandleFunc("GET /api/risk-reports", controllers.ListRiskReports)
	mux.HandleFunc("GET /api/live-map", controllers.GetLiveMap)

	// ทุกคำขอผ่าน logger และ CORS ก่อนถึง controller (ดู middleware.go)
	return logger(cors(allowedOrigin)(mux))
}
