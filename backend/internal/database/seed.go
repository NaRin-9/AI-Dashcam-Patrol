// seed: สร้าง superadmin เริ่มต้นถ้ายังไม่มี
package database

import (
	"database/sql"
	"fmt"
	"log"

	"golang.org/x/crypto/bcrypt"
)

// SeedSuperadmin ตรวจสอบว่ามี superadmin หรือยัง ถ้าไม่มีจะสร้างให้
func SeedSuperadmin(db *sql.DB, username, email, password string) error {
	if username == "" || email == "" || len(password) < 8 {
		return fmt.Errorf("configure SUPERADMIN_USERNAME, SUPERADMIN_EMAIL and a SUPERADMIN_PASSWORD of at least 8 characters")
	}

	var count int
	err := db.QueryRow(`SELECT COUNT(*) FROM users WHERE role_id = 3 AND is_active = true`).Scan(&count)
	if err != nil {
		return err
	}

	if count > 0 {
		log.Println("พบ superadmin อยู่แล้ว ข้ามการ seed")
		return nil
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	_, err = db.Exec(
		`INSERT INTO users (username, email, password_hash, role_id) VALUES ($1, $2, $3, $4)`,
		username, email, string(hash), 3,
	)
	if err != nil {
		return err
	}

	log.Println("สร้าง superadmin เริ่มต้นแล้ว")

	return nil
}
