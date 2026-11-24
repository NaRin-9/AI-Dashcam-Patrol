// config: โหลดค่าตั้งค่าจาก environment variable สำหรับระบบทั้งหมด
package config

import (
	"fmt"
	"os"
	"time"
)

// Config เก็บค่าตั้งค่าทั้งหมดของ backend
type Config struct {
	// Database
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBSSLMode  string

	// JWT
	JWTSecret        string
	JWTAccessExpiry  time.Duration
	JWTRefreshExpiry time.Duration

	// Server
	Port          string
	AllowedOrigin string
}

// Load อ่านค่าจาก environment variable แล้วส่งคืน Config
func Load() (*Config, error) {
	jwtSecret := os.Getenv("JWT_SECRET")
	if len(jwtSecret) < 32 {
		return nil, fmt.Errorf("JWT_SECRET must contain at least 32 bytes")
	}

	accessExpiry, err := time.ParseDuration(getenv("JWT_ACCESS_EXPIRY", "15m"))
	if err != nil {
		return nil, fmt.Errorf("invalid JWT_ACCESS_EXPIRY: %w", err)
	}

	refreshExpiry, err := time.ParseDuration(getenv("JWT_REFRESH_EXPIRY", "168h"))
	if err != nil {
		return nil, fmt.Errorf("invalid JWT_REFRESH_EXPIRY: %w", err)
	}

	return &Config{
		DBHost:     getenv("DB_HOST", "localhost"),
		DBPort:     getenv("DB_PORT", "5432"),
		DBUser:     getenv("DB_USER", "postgres"),
		DBPassword: getenv("DB_PASSWORD", ""),
		DBName:     getenv("DB_NAME", "dashcam_patrol"),
		DBSSLMode:  getenv("DB_SSLMODE", "disable"),

		JWTSecret:        jwtSecret,
		JWTAccessExpiry:  accessExpiry,
		JWTRefreshExpiry: refreshExpiry,

		Port:          getenv("PORT", "8000"),
		AllowedOrigin: getenv("ALLOWED_ORIGIN", "http://localhost:5173"),
	}, nil
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
