package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"ai-dashcam-patrol/backend/internal/entities"
	"ai-dashcam-patrol/backend/internal/services"
)

// GetLiveMap คืนข้อมูลสำหรับแผนที่: GET /api/live-map
func GetLiveMap(c *gin.Context) {
	liveMap := services.DemoLiveMap()
	switch c.GetString("roleName") {
	case "admin", "superadmin":
	default:
		liveMap.Tracks = []entities.Track{}
	}
	c.JSON(http.StatusOK, liveMap)
}
