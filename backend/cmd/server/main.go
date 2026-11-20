// จุดเริ่มของ backend: อ่านค่าตั้งค่า สร้าง routes แล้วเปิดเซิร์ฟเวอร์
package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"ai-dashcam-patrol/backend/internal/routes"
)

func main() {
	// ค่าตั้งค่าจาก environment variable (ดู .env.example)
	port := getenv("PORT", "8000")
	allowedOrigin := getenv("ALLOWED_ORIGIN", "http://localhost:5173")

	handler := routes.New(allowedOrigin)
	if frontendDir := os.Getenv("FRONTEND_DIR"); frontendDir != "" {
		var err error
		handler, err = routes.WithFrontend(handler, os.DirFS(frontendDir))
		if err != nil {
			log.Fatalf("FRONTEND_DIR %q: %v", frontendDir, err)
		}
	}

	srv := &http.Server{
		Addr:              ":" + port,
		Handler:           handler,
		ReadHeaderTimeout: 10 * time.Second,
	}

	log.Printf("backend listening on http://localhost:%s", port)
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
