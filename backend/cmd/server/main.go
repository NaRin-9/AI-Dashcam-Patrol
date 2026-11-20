// จุดเริ่มของ backend: โหลด config, เชื่อมต่อฐานข้อมูล, migrate, และเปิด Gin web server
package main

import (
	"log"
	"net"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"

	"ai-dashcam-patrol/backend/internal/config"
	"ai-dashcam-patrol/backend/internal/controllers"
	"ai-dashcam-patrol/backend/internal/database"
	"ai-dashcam-patrol/backend/internal/routes"
	"ai-dashcam-patrol/backend/internal/services"
)

func main() {
	// โหลดไฟล์ .env โดยค้นหาทั้งใน directory ปัจจุบันและ backend/.env
	_ = godotenv.Load(".env", "backend/.env", "../.env")

	// โหลดค่า config
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load configuration: %v", err)
	}

	// เชื่อมต่อฐานข้อมูล PostgreSQL
	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer db.Close()

	// รัน database migration
	if err := database.Migrate(db); err != nil {
		log.Fatalf("failed to run database migration: %v", err)
	}

	if password := os.Getenv("SUPERADMIN_PASSWORD"); password != "" {
		if err := database.SeedSuperadmin(db, os.Getenv("SUPERADMIN_USERNAME"), os.Getenv("SUPERADMIN_EMAIL"), password); err != nil {
			log.Fatalf("failed to seed superadmin: %v", err)
		}
	}

	// สร้าง Service instances
	authService := services.NewAuthService(db, cfg)
	userService := services.NewUserService(db)

	// สร้าง Controller instances
	authController := controllers.NewAuthController(authService, userService)
	userController := controllers.NewUserController(userService)
	riskReportsController := controllers.NewRiskReportsController()

	// กำหนด Routes และ Engine
	router := routes.Setup(routes.Dependencies{
		AuthController:        authController,
		UserController:        userController,
		RiskReportsController: riskReportsController,
		JWTSecret:             cfg.JWTSecret,
		AllowedOrigin:         cfg.AllowedOrigin,
	})

	var handler http.Handler = router
	if frontendDir := os.Getenv("FRONTEND_DIR"); frontendDir != "" {
		var err error
		handler, err = routes.WithFrontend(handler, os.DirFS(frontendDir))
		if err != nil {
			log.Fatalf("FRONTEND_DIR %q: %v", frontendDir, err)
		}
	}

	srv := &http.Server{
		Addr:              net.JoinHostPort(os.Getenv("HOST"), cfg.Port),
		Handler:           handler,
		ReadHeaderTimeout: 10 * time.Second,
	}

	log.Printf("backend listening on http://localhost:%s", cfg.Port)
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}
