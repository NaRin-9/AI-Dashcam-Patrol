package auth

import (
	"ai-dashcam-patrol/backend/internal/entities/user"
	"github.com/golang-jwt/jwt/v5"
)

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

// AuthResponse ส่งกลับหลังจาก login/register สำเร็จ
type AuthResponse struct {
	User        user.User `json:"user"`
	AccessToken string    `json:"accessToken"`
}

// TokenClaims ข้อมูลที่เก็บไว้ใน JWT
type TokenClaims struct {
	UserID   string `json:"userId"`
	Username string `json:"username"`
	RoleID   int    `json:"roleId"`
	RoleName string `json:"role"`
	jwt.RegisteredClaims
}
