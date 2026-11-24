// controllers/auth: จัดการ endpoint เกี่ยวกับ authentication
package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"ai-dashcam-patrol/backend/internal/entities/auth"
	"ai-dashcam-patrol/backend/internal/middleware"
	"ai-dashcam-patrol/backend/internal/services"
)

// AuthController จัดการ endpoint สำหรับ authentication
type AuthController struct {
	authService *services.AuthService
	userService *services.UserService
}

// NewAuthController สร้าง AuthController ใหม่
func NewAuthController(authService *services.AuthService, userService *services.UserService) *AuthController {
	return &AuthController{authService: authService, userService: userService}
}

// refreshTokenMaxAge อายุ cookie ของ refresh token (7 วัน)
const refreshTokenMaxAge = 7 * 24 * 60 * 60

// Register ลงทะเบียนผู้ใช้ใหม่: POST /api/auth/register
func (ctrl *AuthController) Register(c *gin.Context) {
	var req auth.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := ctrl.authService.Register(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		return
	}

	// Login อัตโนมัติหลังลงทะเบียน
	loginReq := auth.LoginRequest{Username: req.Username, Password: req.Password}
	resp, refreshToken, err := ctrl.authService.Login(c.Request.Context(), loginReq)
	if err != nil {
		// ลงทะเบียนสำเร็จแต่ login ไม่ได้ — ส่ง user กลับไปโดยไม่มี token
		c.JSON(http.StatusCreated, gin.H{"user": user})
		return
	}

	setRefreshTokenCookie(c, refreshToken)
	c.JSON(http.StatusCreated, resp)
}

// Login เข้าสู่ระบบ: POST /api/auth/login
func (ctrl *AuthController) Login(c *gin.Context) {
	var req auth.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, refreshToken, err := ctrl.authService.Login(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	setRefreshTokenCookie(c, refreshToken)
	c.JSON(http.StatusOK, resp)
}

// RefreshToken ต่ออายุ token: POST /api/auth/refresh
func (ctrl *AuthController) RefreshToken(c *gin.Context) {
	rawToken, err := c.Cookie("refresh_token")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "refresh token not found"})
		return
	}

	resp, newRefreshToken, err := ctrl.authService.RefreshToken(c.Request.Context(), rawToken)
	if err != nil {
		clearRefreshTokenCookie(c)
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	setRefreshTokenCookie(c, newRefreshToken)
	c.JSON(http.StatusOK, resp)
}

// Logout ออกจากระบบ: POST /api/auth/logout
func (ctrl *AuthController) Logout(c *gin.Context) {
	rawToken, err := c.Cookie("refresh_token")
	if err == nil {
		_ = ctrl.authService.Logout(c.Request.Context(), rawToken)
	}

	clearRefreshTokenCookie(c)
	c.JSON(http.StatusOK, gin.H{"message": "logged out"})
}

// LogoutAll ออกจากระบบทุกอุปกรณ์: POST /api/auth/logout-all
func (ctrl *AuthController) LogoutAll(c *gin.Context) {
	currentUser := middleware.GetCurrentUser(c)
	if err := ctrl.authService.LogoutAll(c.Request.Context(), currentUser.ID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot logout all sessions"})
		return
	}

	clearRefreshTokenCookie(c)
	c.JSON(http.StatusOK, gin.H{"message": "all sessions logged out"})
}

// GetMe ดึงข้อมูล user ปัจจุบัน: GET /api/auth/me
func (ctrl *AuthController) GetMe(c *gin.Context) {
	currentUser := middleware.GetCurrentUser(c)
	user, err := ctrl.userService.GetByID(c.Request.Context(), currentUser.ID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"user": user})
}

// setRefreshTokenCookie ตั้งค่า cookie สำหรับ refresh token
func setRefreshTokenCookie(c *gin.Context, token string) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("refresh_token", token, refreshTokenMaxAge, "/api/auth", "", false, true)
}

// clearRefreshTokenCookie ลบ cookie ของ refresh token
func clearRefreshTokenCookie(c *gin.Context) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("refresh_token", "", -1, "/api/auth", "", false, true)
}
