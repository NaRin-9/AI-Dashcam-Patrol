// database: เชื่อมต่อ PostgreSQL และสร้างตาราง
package database

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"

	"ai-dashcam-patrol/backend/internal/config"
)

// Connect สร้างการเชื่อมต่อไปยัง PostgreSQL
func Connect(cfg *config.Config) (*sql.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBSSLMode,
	)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("cannot open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("cannot ping database: %w", err)
	}

	log.Println("เชื่อมต่อ PostgreSQL สำเร็จ")
	return db, nil
}

// Migrate สร้างตารางที่จำเป็นถ้ายังไม่มี
func Migrate(db *sql.DB) error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS roles (
			id SERIAL PRIMARY KEY,
			name VARCHAR(50) UNIQUE NOT NULL
		)`,
		`INSERT INTO roles (name) VALUES ('user'), ('admin'), ('superadmin') ON CONFLICT (name) DO NOTHING`,
		`CREATE TABLE IF NOT EXISTS users (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			username VARCHAR(100) UNIQUE NOT NULL,
			email VARCHAR(255) UNIQUE NOT NULL,
			password_hash VARCHAR(255) NOT NULL,
			role_id INTEGER NOT NULL DEFAULT 1 REFERENCES roles(id),
			is_active BOOLEAN NOT NULL DEFAULT true,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS refresh_tokens (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			token_hash VARCHAR(255) NOT NULL,
			expires_at TIMESTAMPTZ NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id)`,
		`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash)`,
	}

	for _, q := range queries {
		if _, err := db.Exec(q); err != nil {
			return fmt.Errorf("migration failed: %w\nquery: %s", err, q)
		}
	}

	log.Println("migration สำเร็จ")
	return nil
}
