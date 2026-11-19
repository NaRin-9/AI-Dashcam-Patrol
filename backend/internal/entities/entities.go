// entities: รูปแบบข้อมูลของระบบ ใช้ร่วมกันทุกชั้นและเป็นรูปแบบ JSON ที่ส่งให้ frontend
package entities

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// RiskSpan คือช่วงเสา 1 ช่วงพร้อมระดับความเสี่ยง
type RiskSpan struct {
	ID         string  `json:"id"`
	FromPole   string  `json:"fromPole"`   // รหัสเสาต้นทาง
	ToPole     string  `json:"toPole"`     // รหัสเสาปลายทาง
	Feeder     string  `json:"feeder"`     // ฟีดเดอร์
	RiskLevel  string  `json:"riskLevel"`  // clear | near | touching
	Score      float64 `json:"score"`      // คะแนนจากโมเดล 0–1
	ImageURL   string  `json:"imageUrl"`   // ภาพประกอบ
	CapturedAt string  `json:"capturedAt"` // วันที่บันทึกภาพ (ISO 8601)
}

// Track คือเส้นทางรถ 1 รอบวิ่ง (พิกัด [lng, lat])
type Track struct {
	ID     string       `json:"id"`
	Date   string       `json:"date"`
	Points [][2]float64 `json:"points"`
}

// LiveMap คือข้อมูลทั้งหมดที่หน้าแผนที่ใช้
type LiveMap struct {
	Tracks []Track    `json:"tracks"`
	Spans  []RiskSpan `json:"spans"`
}

// ---------- Auth & User ----------

// User ข้อมูลผู้ใช้ในระบบ
type User struct {
	ID           string    `json:"id"`
	Username     string    `json:"username"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	RoleID       int       `json:"roleId"`
	RoleName     string    `json:"role"`
	IsActive     bool      `json:"isActive"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

// Role บทบาทของผู้ใช้
type Role struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

// RefreshToken เก็บ hashed refresh token ในฐานข้อมูล
type RefreshToken struct {
	ID        string    `json:"id"`
	UserID    string    `json:"userId"`
	TokenHash string    `json:"-"`
	ExpiresAt time.Time `json:"expiresAt"`
	CreatedAt time.Time `json:"createdAt"`
}

// ---------- Request / Response ----------

// RegisterRequest คำขอลงทะเบียนผู้ใช้ใหม่
type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=100"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

// LoginRequest คำขอเข้าสู่ระบบ
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// UpdateUserRequest คำขออัปเดตโปรไฟล์ผู้ใช้
type UpdateUserRequest struct {
	Username *string `json:"username" binding:"omitempty,min=3,max=100"`
	Email    *string `json:"email" binding:"omitempty,email"`
	IsActive *bool   `json:"isActive"`
}

// ChangePasswordRequest คำขอเปลี่ยนรหัสผ่าน
type ChangePasswordRequest struct {
	OldPassword string `json:"oldPassword" binding:"required"`
	NewPassword string `json:"newPassword" binding:"required,min=8"`
}

// AdminChangeRoleRequest คำขอเปลี่ยนบทบาทโดย admin
type AdminChangeRoleRequest struct {
	RoleID int `json:"roleId" binding:"required"`
}

// AuthResponse ส่งกลับหลังจาก login/register สำเร็จ
type AuthResponse struct {
	User        User   `json:"user"`
	AccessToken string `json:"accessToken"`
}

// TokenClaims ข้อมูลที่เก็บไว้ใน JWT
type TokenClaims struct {
	UserID   string `json:"userId"`
	Username string `json:"username"`
	RoleID   int    `json:"roleId"`
	RoleName string `json:"role"`
	jwt.RegisteredClaims
}
