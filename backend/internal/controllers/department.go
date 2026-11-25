package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"ai-dashcam-patrol/backend/internal/entities/department"
	"ai-dashcam-patrol/backend/internal/services"
)

// DepartmentController จัดการ endpoint สำหรับจัดการแผนก
type DepartmentController struct {
	deptService *services.DepartmentService
}

// NewDepartmentController สร้าง DepartmentController ใหม่
func NewDepartmentController(deptService *services.DepartmentService) *DepartmentController {
	return &DepartmentController{deptService: deptService}
}

// List ดึงรายการแผนกทั้งหมด: GET /api/departments
func (ctrl *DepartmentController) List(c *gin.Context) {
	departments, err := ctrl.deptService.List(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"departments": departments})
}

// Get ดึงข้อมูลแผนกตาม ID: GET /api/departments/:id
func (ctrl *DepartmentController) Get(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid department id"})
		return
	}

	dept, err := ctrl.deptService.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"department": dept})
}

// Create สร้างแผนกใหม่: POST /api/departments
func (ctrl *DepartmentController) Create(c *gin.Context) {
	var req department.CreateDepartmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	dept, err := ctrl.deptService.Create(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"department": dept})
}

// Update แก้ไขแผนก: PUT /api/departments/:id
func (ctrl *DepartmentController) Update(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid department id"})
		return
	}

	var req department.UpdateDepartmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	dept, err := ctrl.deptService.Update(c.Request.Context(), id, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"department": dept})
}

// Delete ลบแผนก: DELETE /api/departments/:id
func (ctrl *DepartmentController) Delete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid department id"})
		return
	}

	if err := ctrl.deptService.Delete(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "department deleted"})
}
