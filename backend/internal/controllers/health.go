package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Health ใช้ตรวจว่า backend ทำงานอยู่: GET /api/health
func Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}
