// routes: รายการ API ทั้งหมดกำหนดด้วย Gin router
package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"ai-dashcam-patrol/backend/internal/controllers"
	"ai-dashcam-patrol/backend/internal/middleware"
)

// Dependencies รวบรวม controller ทั้งหมดที่ routes ต้องใช้
type Dependencies struct {
	AuthController      *controllers.AuthController
	UserController      *controllers.UserController
	RiskReportsController *controllers.RiskReportsController
	JWTSecret           string
	AllowedOrigin       string
}

// Setup กำหนดเส้นทาง API ทั้งหมดด้วย Gin
func Setup(deps Dependencies) *gin.Engine {
	r := gin.New()

	// ใช้งาน Logger และ Recovery พื้นฐานของ Gin
	r.Use(gin.Logger(), gin.Recovery())

	// CORS middleware รองรับ credentials สำหรับ cookies
	r.Use(corsMiddleware(deps.AllowedOrigin))

	api := r.Group("/api")
	{
		// Public endpoints
		api.GET("/health", controllers.Health)
		api.POST("/auth/register", deps.AuthController.Register)
		api.POST("/auth/login", deps.AuthController.Login)
		api.POST("/auth/refresh", deps.AuthController.RefreshToken)

		// Authenticated endpoints (ทุก role ที่ผ่านการ login)
		authenticated := api.Group("")
		authenticated.Use(middleware.AuthMiddleware(deps.JWTSecret))
		{
			authenticated.POST("/auth/logout", deps.AuthController.Logout)
			authenticated.POST("/auth/logout-all", deps.AuthController.LogoutAll)
			authenticated.GET("/auth/me", deps.AuthController.GetMe)

			// User self-management (Resource ownership: จัดการได้เฉพาะข้อมูลตนเอง)
			authenticated.GET("/users/me", deps.UserController.GetProfile)
			authenticated.PUT("/users/me", deps.UserController.UpdateProfile)
			authenticated.PUT("/users/me/password", deps.UserController.ChangePassword)

			// Data endpoints
			authenticated.GET("/risk-reports", deps.RiskReportsController.ListRiskReports)
			authenticated.GET("/live-map", controllers.GetLiveMap)

			// Admin & Superadmin endpoints (จัดการผู้ใช้ทั่วไป)
			admin := authenticated.Group("")
			admin.Use(middleware.RequireRole("admin", "superadmin"))
			{
				admin.GET("/users", deps.UserController.ListUsers)
				admin.GET("/users/:id", deps.UserController.GetUser)
				admin.PUT("/users/:id", deps.UserController.AdminUpdateUser)
				admin.GET("/roles", deps.UserController.ListRoles)

				// จัดการ role และลบผู้ใช้ (มีการตรวจสอบเพิ่มเติมใน service)
				// Admin: จัดการได้เฉพาะ ordinary users
				// Superadmin: จัดการได้ทั้ง users, admins และ system-level
				admin.PUT("/users/:id/role", deps.UserController.AdminChangeRole)
				admin.DELETE("/users/:id", deps.UserController.AdminDeleteUser)
			}
		}
	}

	return r
}

// corsMiddleware รองรับ credentials สำหรับ cookies และ origin ที่กำหนด
func corsMiddleware(allowedOrigin string) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", allowedOrigin)
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, Origin")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
