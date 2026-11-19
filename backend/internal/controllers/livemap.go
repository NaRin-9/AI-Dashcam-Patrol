package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"ai-dashcam-patrol/backend/internal/entities"
)

// GetLiveMap คืนข้อมูลสำหรับแผนที่: GET /api/live-map
// ใช้กับหน้า frontend/src/pages/LiveMap (ยังเป็นข้อมูลว่าง)
func GetLiveMap(c *gin.Context) {
	c.JSON(http.StatusOK, entities.LiveMap{
		Tracks: []entities.Track{},
		Spans:  []entities.RiskSpan{},
	})
}
