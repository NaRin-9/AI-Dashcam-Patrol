// controllers: รับคำขอ HTTP อ่านพารามิเตอร์ เรียก service แล้วส่ง JSON กลับ
package controllers

import (
	"encoding/json"
	"net/http"
)

// writeJSON ส่งข้อมูลกลับเป็น JSON ทุก controller ใช้ฟังก์ชันนี้
func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

// writeError ส่งข้อผิดพลาดในรูปแบบเดียวกันทุก endpoint: {"error": "..."}
func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}
