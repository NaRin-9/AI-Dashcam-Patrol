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

// SeedDemoUsers เพิ่มบัญชีทดสอบและเติมโปรไฟล์เฉพาะส่วนที่ยังว่าง
func SeedDemoUsers(db *sql.DB, password string) error {
	if len(password) < 12 {
		return fmt.Errorf("DEMO_USERS_PASSWORD must contain at least 12 characters")
	}

	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	accounts := []struct {
		role, firstName, lastName, department string
	}{
		{"user", "ผู้ใช้", "ทดสอบ", "แผนกปฏิบัติการและบำรุงรักษา"},
		{"admin", "ผู้ดูแล", "ทดสอบ", "แผนกบริการลูกค้า"},
		{"superadmin", "ผู้ดูแลสูงสุด", "ทดสอบ", "ฝ่ายเทคโนโลยีสารสนเทศ"},
	}
	for _, account := range accounts {
		username := "demo_" + account.role
		email := username + "@example.test"
		var departmentID int
		err := tx.QueryRow(`SELECT id FROM departments WHERE name = $1`, account.department).Scan(&departmentID)
		if err != nil {
			return fmt.Errorf("find department for %s: %w", username, err)
		}
		hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}

		_, err = tx.Exec(
			`INSERT INTO users (username, email, password_hash, role_id, first_name, last_name, department_id)
			VALUES ($1, $2, $3, (SELECT id FROM roles WHERE name = $4), $5, $6, $7)
			ON CONFLICT (username) DO NOTHING`,
			username, email, string(hash), account.role, account.firstName, account.lastName, departmentID,
		)
		if err != nil {
			return fmt.Errorf("insert %s: %w", username, err)
		}

		var matches bool
		err = tx.QueryRow(
			`SELECT u.email = $2 AND r.name = $3 AND u.is_active
			FROM users u JOIN roles r ON u.role_id = r.id WHERE u.username = $1 FOR UPDATE OF u`,
			username, email, account.role,
		).Scan(&matches)
		if err != nil {
			return fmt.Errorf("verify %s: %w", username, err)
		}
		if !matches {
			return fmt.Errorf("%s already exists with a different email, role, or active status", username)
		}

		_, err = tx.Exec(
			`UPDATE users SET
				first_name = CASE WHEN COALESCE(BTRIM(first_name), '') = '' THEN $2 ELSE first_name END,
				last_name = CASE WHEN COALESCE(BTRIM(last_name), '') = '' THEN $3 ELSE last_name END,
				department_id = COALESCE(department_id, $4),
				updated_at = NOW()
			WHERE username = $1 AND (
				COALESCE(BTRIM(first_name), '') = '' OR COALESCE(BTRIM(last_name), '') = '' OR department_id IS NULL
			)`,
			username, account.firstName, account.lastName, departmentID,
		)
		if err != nil {
			return fmt.Errorf("complete profile for %s: %w", username, err)
		}
	}

	return tx.Commit()
}
