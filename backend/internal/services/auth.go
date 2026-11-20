// services/auth: จัดการ authentication — register, login, refresh, logout
package services

import (
	"context"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"ai-dashcam-patrol/backend/internal/config"
	"ai-dashcam-patrol/backend/internal/entities"
)

// AuthService จัดการ authentication ทั้งหมด
type AuthService struct {
	db  *sql.DB
	cfg *config.Config
}

// NewAuthService สร้าง AuthService ใหม่
func NewAuthService(db *sql.DB, cfg *config.Config) *AuthService {
	return &AuthService{db: db, cfg: cfg}
}

// Register ลงทะเบียนผู้ใช้ใหม่ ด้วย role เริ่มต้นเป็น user (role_id=1)
func (s *AuthService) Register(ctx context.Context, req entities.RegisterRequest) (*entities.User, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("cannot hash password: %w", err)
	}

	var user entities.User
	err = s.db.QueryRowContext(ctx,
		`INSERT INTO users (username, email, password_hash, role_id)
		 VALUES ($1, $2, $3, 1)
		 RETURNING id, username, email, password_hash, role_id, is_active, created_at, updated_at`,
		req.Username, req.Email, string(hash),
	).Scan(&user.ID, &user.Username, &user.Email, &user.PasswordHash,
		&user.RoleID, &user.IsActive, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("cannot create user: %w", err)
	}
	user.RoleName = "user"
	return &user, nil
}

// Login ตรวจสอบ credentials แล้วสร้าง tokens
func (s *AuthService) Login(ctx context.Context, req entities.LoginRequest) (*entities.AuthResponse, string, error) {
	var user entities.User
	err := s.db.QueryRowContext(ctx,
		`SELECT u.id, u.username, u.email, u.password_hash, u.role_id, r.name, u.is_active, u.created_at, u.updated_at
		 FROM users u JOIN roles r ON u.role_id = r.id
		 WHERE u.username = $1`,
		req.Username,
	).Scan(&user.ID, &user.Username, &user.Email, &user.PasswordHash,
		&user.RoleID, &user.RoleName, &user.IsActive, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, "", fmt.Errorf("invalid credentials")
		}
		return nil, "", fmt.Errorf("cannot query user: %w", err)
	}

	if !user.IsActive {
		return nil, "", fmt.Errorf("account is deactivated")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, "", fmt.Errorf("invalid credentials")
	}

	accessToken, err := s.GenerateAccessToken(user)
	if err != nil {
		return nil, "", err
	}

	refreshToken := s.GenerateRefreshToken()
	tokenHash := s.HashToken(refreshToken)

	_, err = s.db.ExecContext(ctx,
		`INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
		 VALUES ($1, $2, $3)`,
		user.ID, tokenHash, time.Now().Add(s.cfg.JWTRefreshExpiry),
	)
	if err != nil {
		return nil, "", fmt.Errorf("cannot store refresh token: %w", err)
	}

	return &entities.AuthResponse{
		User:        user,
		AccessToken: accessToken,
	}, refreshToken, nil
}

// RefreshToken ตรวจสอบ refresh token แล้วสร้าง pair ใหม่ (token rotation)
func (s *AuthService) RefreshToken(ctx context.Context, rawToken string) (*entities.AuthResponse, string, error) {
	tokenHash := s.HashToken(rawToken)

	var rt entities.RefreshToken
	err := s.db.QueryRowContext(ctx,
		`SELECT id, user_id, expires_at FROM refresh_tokens WHERE token_hash = $1`,
		tokenHash,
	).Scan(&rt.ID, &rt.UserID, &rt.ExpiresAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, "", fmt.Errorf("invalid refresh token")
		}
		return nil, "", fmt.Errorf("cannot query refresh token: %w", err)
	}

	if time.Now().After(rt.ExpiresAt) {
		// ลบ token ที่หมดอายุ
		_, _ = s.db.ExecContext(ctx, `DELETE FROM refresh_tokens WHERE id = $1`, rt.ID)
		return nil, "", fmt.Errorf("refresh token expired")
	}

	// ลบ token เก่า (rotation)
	_, _ = s.db.ExecContext(ctx, `DELETE FROM refresh_tokens WHERE id = $1`, rt.ID)

	// ดึงข้อมูล user
	var user entities.User
	err = s.db.QueryRowContext(ctx,
		`SELECT u.id, u.username, u.email, u.password_hash, u.role_id, r.name, u.is_active, u.created_at, u.updated_at
		 FROM users u JOIN roles r ON u.role_id = r.id
		 WHERE u.id = $1`,
		rt.UserID,
	).Scan(&user.ID, &user.Username, &user.Email, &user.PasswordHash,
		&user.RoleID, &user.RoleName, &user.IsActive, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, "", fmt.Errorf("cannot query user: %w", err)
	}

	if !user.IsActive {
		return nil, "", fmt.Errorf("account is deactivated")
	}

	accessToken, err := s.GenerateAccessToken(user)
	if err != nil {
		return nil, "", err
	}

	newRefreshToken := s.GenerateRefreshToken()
	newHash := s.HashToken(newRefreshToken)

	_, err = s.db.ExecContext(ctx,
		`INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
		 VALUES ($1, $2, $3)`,
		user.ID, newHash, time.Now().Add(s.cfg.JWTRefreshExpiry),
	)
	if err != nil {
		return nil, "", fmt.Errorf("cannot store new refresh token: %w", err)
	}

	return &entities.AuthResponse{
		User:        user,
		AccessToken: accessToken,
	}, newRefreshToken, nil
}

// Logout ลบ refresh token เฉพาะตัว
func (s *AuthService) Logout(ctx context.Context, rawToken string) error {
	tokenHash := s.HashToken(rawToken)
	_, err := s.db.ExecContext(ctx, `DELETE FROM refresh_tokens WHERE token_hash = $1`, tokenHash)
	return err
}

// LogoutAll ลบ refresh token ทั้งหมดของ user
func (s *AuthService) LogoutAll(ctx context.Context, userID string) error {
	_, err := s.db.ExecContext(ctx, `DELETE FROM refresh_tokens WHERE user_id = $1`, userID)
	return err
}

// GenerateAccessToken สร้าง JWT access token
func (s *AuthService) GenerateAccessToken(user entities.User) (string, error) {
	claims := entities.TokenClaims{
		UserID:   user.ID,
		Username: user.Username,
		RoleID:   user.RoleID,
		RoleName: user.RoleName,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(s.cfg.JWTAccessExpiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.JWTSecret))
}

// GenerateRefreshToken สร้าง random UUID เป็น refresh token
func (s *AuthService) GenerateRefreshToken() string {
	return uuid.New().String()
}

// HashToken สร้าง SHA-256 hash ของ token สำหรับเก็บในฐานข้อมูล
func (s *AuthService) HashToken(token string) string {
	h := sha256.Sum256([]byte(token))
	return hex.EncodeToString(h[:])
}
