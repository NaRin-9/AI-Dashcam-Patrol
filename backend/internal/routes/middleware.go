package routes

import (
	"log"
	"net/http"
	"time"
)

// logger พิมพ์ method, path และเวลาที่ใช้ของทุกคำขอ
func logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s", r.Method, r.URL.Path, time.Since(start))
	})
}

// cors อนุญาตให้ frontend จาก origin ที่กำหนดเรียก API ได้
// (ตอนพัฒนาผ่าน proxy ของ Vite ไม่จำเป็น แต่ต้องใช้เมื่อ frontend เรียก backend ตรง)
func cors(allowedOrigin string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
