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
	AuthController         *controllers.AuthController
	UserController         *controllers.UserController
	DepartmentController   *controllers.DepartmentController
	RiskReportsController  *controllers.RiskReportsController
	VideoUploadsController *controllers.VideoUploadsController
	JWTSecret              string
	AllowedOrigin          string
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
			if deps.DepartmentController != nil {
				authenticated.GET("/departments", deps.DepartmentController.List)
				authenticated.GET("/departments/:id", deps.DepartmentController.Get)
			}
			if deps.VideoUploadsController != nil {
				authenticated.GET("/videos", deps.VideoUploadsController.ListMine)
				authenticated.POST("/videos", deps.VideoUploadsController.Upload)
			}

			// Admin & Superadmin endpoints (จัดการผู้ใช้: เพิ่ม ลบ แก้ไข ทั้ง user, admin, superadmin)
			admin := authenticated.Group("")
			admin.Use(middleware.RequireRole("admin", "superadmin"))
			{
				admin.GET("/users", deps.UserController.ListUsers)
				admin.POST("/users", deps.UserController.AdminCreateUser)
				admin.GET("/users/:id", deps.UserController.GetUser)
				admin.PUT("/users/:id", deps.UserController.AdminUpdateUser)
				admin.GET("/roles", deps.UserController.ListRoles)
				admin.PUT("/users/:id/role", deps.UserController.AdminChangeRole)
				admin.DELETE("/users/:id", deps.UserController.AdminDeleteUser)

				// Department management for admin/superadmin (write operations & aliases)
				if deps.DepartmentController != nil {
					admin.POST("/departments", deps.DepartmentController.Create)
					admin.PUT("/departments/:id", deps.DepartmentController.Update)
					admin.DELETE("/departments/:id", deps.DepartmentController.Delete)

					// Aliases with /admin prefix
					admin.GET("/admin/departments", deps.DepartmentController.List)
					admin.GET("/admin/departments/:id", deps.DepartmentController.Get)
					admin.POST("/admin/departments", deps.DepartmentController.Create)
					admin.PUT("/admin/departments/:id", deps.DepartmentController.Update)
					admin.DELETE("/admin/departments/:id", deps.DepartmentController.Delete)
				}

				// Aliases for /admin/users to support frontend calling with /admin prefix
				admin.GET("/admin/users", deps.UserController.ListUsers)
				admin.POST("/admin/users", deps.UserController.AdminCreateUser)
				admin.GET("/admin/users/:id", deps.UserController.GetUser)
				admin.PUT("/admin/users/:id", deps.UserController.AdminUpdateUser)
				admin.PUT("/admin/users/:id/role", deps.UserController.AdminChangeRole)
				admin.DELETE("/admin/users/:id", deps.UserController.AdminDeleteUser)
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
