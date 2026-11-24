// controllers/user: จัดการ endpoint เกี่ยวกับข้อมูลผู้ใช้
package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"ai-dashcam-patrol/backend/internal/entities/user"
	"ai-dashcam-patrol/backend/internal/middleware"
	"ai-dashcam-patrol/backend/internal/services"
)

// UserController จัดการ endpoint สำหรับ user management
type UserController struct {
	userService *services.UserService
}

// NewUserController สร้าง UserController ใหม่
func NewUserController(userService *services.UserService) *UserController {
	return &UserController{userService: userService}
}

// GetProfile ดึงโปรไฟล์ตัวเอง: GET /api/users/me
func (ctrl *UserController) GetProfile(c *gin.Context) {
	currentUser := middleware.GetCurrentUser(c)
	user, err := ctrl.userService.GetByID(c.Request.Context(), currentUser.ID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"user": user})
}

// UpdateProfile อัปเดตโปรไฟล์ตัวเอง: PUT /api/users/me
func (ctrl *UserController) UpdateProfile(c *gin.Context) {
	currentUser := middleware.GetCurrentUser(c)

	var req user.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := ctrl.userService.UpdateProfile(c.Request.Context(), currentUser.ID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"user": user})
}

// ChangePassword เปลี่ยนรหัสผ่าน: PUT /api/users/me/password
func (ctrl *UserController) ChangePassword(c *gin.Context) {
	currentUser := middleware.GetCurrentUser(c)

	var req user.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := ctrl.userService.ChangePassword(c.Request.Context(), currentUser.ID, req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "password changed"})
}

// ListUsers ดึงข้อมูล user ทั้งหมด (admin+): GET /api/users
func (ctrl *UserController) ListUsers(c *gin.Context) {
	users, err := ctrl.userService.GetAll(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot list users"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"users": users})
}

// AdminCreateUser admin/superadmin สร้างผู้ใช้ใหม่: POST /api/users
func (ctrl *UserController) AdminCreateUser(c *gin.Context) {
	currentUser := middleware.GetCurrentUser(c)

	var req user.AdminCreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	newUser, err := ctrl.userService.AdminCreateUser(c.Request.Context(), currentUser, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"user": newUser})
}

// GetUser ดึงข้อมูล user ตาม id (admin+): GET /api/users/:id
func (ctrl *UserController) GetUser(c *gin.Context) {
	id := c.Param("id")
	user, err := ctrl.userService.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"user": user})
}

// AdminUpdateUser admin อัปเดตข้อมูล user: PUT /api/users/:id
func (ctrl *UserController) AdminUpdateUser(c *gin.Context) {
	currentUser := middleware.GetCurrentUser(c)
	targetID := c.Param("id")

	var req user.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := ctrl.userService.AdminUpdateUser(c.Request.Context(), currentUser, targetID, req)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"user": user})
}

// AdminChangeRole เปลี่ยน role ของ user: PUT /api/users/:id/role
func (ctrl *UserController) AdminChangeRole(c *gin.Context) {
	currentUser := middleware.GetCurrentUser(c)
	targetID := c.Param("id")

	var req user.AdminChangeRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := ctrl.userService.AdminChangeRole(c.Request.Context(), currentUser, targetID, req)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"user": user})
}

// AdminDeleteUser soft-delete user: DELETE /api/users/:id
func (ctrl *UserController) AdminDeleteUser(c *gin.Context) {
	currentUser := middleware.GetCurrentUser(c)
	targetID := c.Param("id")

	if err := ctrl.userService.AdminDeleteUser(c.Request.Context(), currentUser, targetID); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "user deactivated"})
}

// ListRoles ดึงรายการ role ทั้งหมด (admin+): GET /api/roles
func (ctrl *UserController) ListRoles(c *gin.Context) {
	roles, err := ctrl.userService.GetRoles(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot list roles"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"roles": roles})
}
