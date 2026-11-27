// จุดเริ่มของ backend: โหลด config, เชื่อมต่อฐานข้อมูล, migrate, และเปิด Gin web server
package main

import (
	"errors"
	"flag"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/joho/godotenv"

	"ai-dashcam-patrol/backend/internal/config"
	"ai-dashcam-patrol/backend/internal/controllers"
	"ai-dashcam-patrol/backend/internal/database"
	"ai-dashcam-patrol/backend/internal/routes"
	"ai-dashcam-patrol/backend/internal/services"
)

const defaultDemoUsersPassword = "Dashcam1234!"

func main() {
	seedDemoUsers := flag.Bool("seed-demo-users", false, "seed local test accounts and exit")
	flag.Parse()

	if err := loadEnv(); err != nil {
		log.Fatalf("failed to load environment: %v", err)
	}

	// โหลดค่า config
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load configuration: %v", err)
	}

	demoPassword := os.Getenv("DEMO_USERS_PASSWORD")
	if *seedDemoUsers {
		if host := cfg.DBHost; host != "localhost" && host != "127.0.0.1" && host != "::1" {
			log.Fatal("seed-demo-users requires a local database")
		}
		if demoPassword == "" {
			demoPassword = defaultDemoUsersPassword
		}
		if len(demoPassword) < 12 {
			log.Fatal("set DEMO_USERS_PASSWORD to at least 12 characters")
		}
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

	if *seedDemoUsers {
		if err := database.SeedDemoUsers(db, demoPassword); err != nil {
			log.Fatalf("failed to seed demo users: %v", err)
		}
		log.Println("demo_user, demo_admin and demo_superadmin are ready")
		return
	}

	if password := os.Getenv("SUPERADMIN_PASSWORD"); password != "" {
		if err := database.SeedSuperadmin(db, os.Getenv("SUPERADMIN_USERNAME"), os.Getenv("SUPERADMIN_EMAIL"), password); err != nil {
			log.Fatalf("failed to seed superadmin: %v", err)
		}
	}

	// สร้าง Service instances
	authService := services.NewAuthService(db, cfg)
	userService := services.NewUserService(db)
	deptService := services.NewDepartmentService(db)

	// สร้าง Controller instances
	authController := controllers.NewAuthController(authService, userService)
	userController := controllers.NewUserController(userService)
	deptController := controllers.NewDepartmentController(deptService)
	riskReportsController := controllers.NewRiskReportsController()
	videoUploadsController := controllers.NewVideoUploadsController(db, videoUploadDir())

	// กำหนด Routes และ Engine
	router := routes.Setup(routes.Dependencies{
		AuthController:         authController,
		UserController:         userController,
		DepartmentController:   deptController,
		RiskReportsController:  riskReportsController,
		VideoUploadsController: videoUploadsController,
		JWTSecret:              cfg.JWTSecret,
		AllowedOrigin:          cfg.AllowedOrigin,
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

func videoUploadDir() string {
	if dir := os.Getenv("VIDEO_UPLOAD_DIR"); dir != "" {
		return dir
	}
	for _, candidate := range []string{"backend", ".", "..", "../.."} {
		if _, err := os.Stat(filepath.Join(candidate, "go.mod")); err == nil {
			return filepath.Join(candidate, "data", "videos")
		}
	}
	return filepath.Join("data", "videos")
}

func loadEnv() error {
	cwd, err := os.Getwd()
	if err != nil {
		return err
	}

	files := []string{".env", "backend/.env"}
	if filepath.Base(cwd) == "server" && filepath.Base(filepath.Dir(cwd)) == "cmd" {
		files = append(files, "../../.env")
	}
	files = append(files, "../.env")

	// โหลดทีละไฟล์เพื่อข้ามพาธที่ไม่มีและรักษาค่าที่ตั้งจาก environment ไว้
	for _, file := range files {
		if err := godotenv.Load(file); err != nil && !errors.Is(err, os.ErrNotExist) {
			return fmt.Errorf("load %s: %w", file, err)
		}
	}
	return nil
}
