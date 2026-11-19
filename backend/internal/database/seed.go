// seed: สร้าง superadmin เริ่มต้นถ้ายังไม่มี
package database

import (
	"database/sql"
	"log"

	"golang.org/x/crypto/bcrypt"
)

// SeedSuperadmin ตรวจสอบว่ามี superadmin หรือยัง ถ้าไม่มีจะสร้างให้
func SeedSuperadmin(db *sql.DB) error {
	var count int
	err := db.QueryRow(`SELECT COUNT(*) FROM users WHERE role_id = 3 AND is_active = true`).Scan(&count)
	if err != nil {
		return err
	}

	if count > 0 {
		log.Println("พบ superadmin อยู่แล้ว ข้ามการ seed")
		return nil
	}

	hash, err := bcrypt.GenerateFromPassword([]byte("Admin@1234"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	_, err = db.Exec(
		`INSERT INTO users (username, email, password_hash, role_id) VALUES ($1, $2, $3, $4)`,
		"admin", "admin@example.com", string(hash), 3,
	)
	if err != nil {
		return err
	}

	log.Println("============================================")
	log.Println("สร้าง superadmin เริ่มต้น:")
	log.Println("  Username: admin")
	log.Println("  Email:    admin@example.com")
	log.Println("  Password: Admin@1234")
	log.Println("  กรุณาเปลี่ยนรหัสผ่านทันทีหลังเข้าสู่ระบบ!")
	log.Println("============================================")

	return nil
}
