package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"ai-dashcam-patrol/backend/internal/services"
)

// RiskReportsController จัดการ endpoint ของ risk reports
type RiskReportsController struct {
	// ต่อไปสามารถ inject service ได้ ตอนนี้ใช้ package-level function
}

// NewRiskReportsController สร้าง controller ใหม่
func NewRiskReportsController() *RiskReportsController {
	return &RiskReportsController{}
}

// ListRiskReports คืนรายการ span ที่มีความเสี่ยง: GET /api/risk-reports
func (ctrl *RiskReportsController) ListRiskReports(c *gin.Context) {
	spans, err := services.ListRiskSpans(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot load risk reports"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"items": spans})
}
