// services/user: จัดการข้อมูลผู้ใช้ — ดูโปรไฟล์, อัปเดต, เปลี่ยนรหัสผ่าน, จัดการโดย admin
package services

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"golang.org/x/crypto/bcrypt"

	"ai-dashcam-patrol/backend/internal/entities/role"
	"ai-dashcam-patrol/backend/internal/entities/user"
)

// UserService จัดการข้อมูลผู้ใช้ทั้งหมด
type UserService struct {
	db *sql.DB
}

// NewUserService สร้าง UserService ใหม่
func NewUserService(db *sql.DB) *UserService {
	return &UserService{db: db}
}

// GetByID ดึงข้อมูล user ตาม id พร้อม role name และ department
func (s *UserService) GetByID(ctx context.Context, id string) (*user.User, error) {
	var user user.User
	err := s.db.QueryRowContext(ctx,
		`SELECT u.id, u.username, u.email, COALESCE(u.first_name, ''), COALESCE(u.last_name, ''),
		        u.department_id, COALESCE(d.name, ''),
		        u.password_hash, u.role_id, r.name, u.is_active, u.created_at, u.updated_at
		 FROM users u
		 JOIN roles r ON u.role_id = r.id
		 LEFT JOIN departments d ON u.department_id = d.id
		 WHERE u.id = $1`,
		id,
	).Scan(&user.ID, &user.Username, &user.Email, &user.FirstName, &user.LastName,
		&user.DepartmentID, &user.DepartmentName,
		&user.PasswordHash, &user.RoleID, &user.RoleName, &user.IsActive, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("cannot query user: %w", err)
	}
	return &user, nil
}

// GetAll ดึงข้อมูล user ทั้งหมดพร้อม role name และ department (สำหรับ admin)
func (s *UserService) GetAll(ctx context.Context) ([]user.User, error) {
	rows, err := s.db.QueryContext(ctx,
		`SELECT u.id, u.username, u.email, COALESCE(u.first_name, ''), COALESCE(u.last_name, ''),
		        u.department_id, COALESCE(d.name, ''),
		        u.password_hash, u.role_id, r.name, u.is_active, u.created_at, u.updated_at
		 FROM users u
		 JOIN roles r ON u.role_id = r.id
		 LEFT JOIN departments d ON u.department_id = d.id
		 ORDER BY u.created_at DESC`,
	)
	if err != nil {
		return nil, fmt.Errorf("cannot query users: %w", err)
	}
	defer rows.Close()

	var users []user.User
	for rows.Next() {
		var u user.User
		if err := rows.Scan(&u.ID, &u.Username, &u.Email, &u.FirstName, &u.LastName,
			&u.DepartmentID, &u.DepartmentName,
			&u.PasswordHash, &u.RoleID, &u.RoleName, &u.IsActive, &u.CreatedAt, &u.UpdatedAt); err != nil {
			return nil, fmt.Errorf("cannot scan user: %w", err)
		}
		users = append(users, u)
	}
	return users, rows.Err()
}

// UpdateProfile ผู้ใช้อัปเดตโปรไฟล์ตัวเอง (ไม่สามารถเปลี่ยน role ได้)
func (s *UserService) UpdateProfile(ctx context.Context, userID string, req user.UpdateUserRequest) (*user.User, error) {
	// ไม่อนุญาตให้ user ทั่วไปเปลี่ยน isActive
	safeReq := user.UpdateUserRequest{
		Username:     req.Username,
		Email:        req.Email,
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		DepartmentID: req.DepartmentID,
	}
	return s.updateUser(ctx, userID, safeReq)
}

// ChangePassword ตรวจสอบรหัสเก่าแล้วเปลี่ยนรหัสใหม่
func (s *UserService) ChangePassword(ctx context.Context, userID string, req user.ChangePasswordRequest) error {
	var currentHash string
	err := s.db.QueryRowContext(ctx,
		`SELECT password_hash FROM users WHERE id = $1`, userID,
	).Scan(&currentHash)
	if err != nil {
		return fmt.Errorf("user not found")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(currentHash), []byte(req.OldPassword)); err != nil {
		return fmt.Errorf("old password is incorrect")
	}

	newHash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("cannot hash password: %w", err)
	}

	_, err = s.db.ExecContext(ctx,
		`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
		string(newHash), userID,
	)
	return err
}

// AdminCreateUser สร้างผู้ใช้งานใหม่โดย admin หรือ superadmin
func (s *UserService) AdminCreateUser(ctx context.Context, adminUser user.User, req user.AdminCreateUserRequest) (*user.User, error) {
	// ตรวจสอบว่า roleId ถูกต้องหรือไม่
	var roleName string
	err := s.db.QueryRowContext(ctx, `SELECT name FROM roles WHERE id = $1`, req.RoleID).Scan(&roleName)
	if err != nil {
		return nil, fmt.Errorf("invalid role id: %d", req.RoleID)
	}

	// ตรวจสอบ username ซ้ำ
	var existingCount int
	err = s.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM users WHERE username = $1`, req.Username).Scan(&existingCount)
	if err != nil {
		return nil, fmt.Errorf("cannot check username: %w", err)
	}
	if existingCount > 0 {
		return nil, fmt.Errorf("username already taken")
	}

	// ตรวจสอบ email ซ้ำ
	err = s.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM users WHERE email = $1`, req.Email).Scan(&existingCount)
	if err != nil {
		return nil, fmt.Errorf("cannot check email: %w", err)
	}
	if existingCount > 0 {
		return nil, fmt.Errorf("email already in use")
	}

	// Hash password
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("cannot hash password: %w", err)
	}

	var deptID any = req.DepartmentID
	if req.DepartmentID != nil && *req.DepartmentID <= 0 {
		deptID = nil
	}

	var newUserID string
	err = s.db.QueryRowContext(ctx,
		`INSERT INTO users (username, email, first_name, last_name, department_id, password_hash, role_id, is_active)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, true)
		 RETURNING id`,
		req.Username, req.Email, req.FirstName, req.LastName, deptID, string(hash), req.RoleID,
	).Scan(&newUserID)
	if err != nil {
		return nil, fmt.Errorf("cannot create user: %w", err)
	}

	return s.GetByID(ctx, newUserID)
}

// AdminUpdateUser admin/superadmin อัปเดตข้อมูล user (username, email, isActive)
func (s *UserService) AdminUpdateUser(ctx context.Context, adminUser user.User, targetUserID string, req user.UpdateUserRequest) (*user.User, error) {
	// ตรวจสอบ target user
	_, err := s.GetByID(ctx, targetUserID)
	if err != nil {
		return nil, err
	}

	return s.updateUser(ctx, targetUserID, req)
}

// AdminChangeRole เปลี่ยน role ของ user พร้อมตรวจสอบความปลอดภัย
func (s *UserService) AdminChangeRole(ctx context.Context, adminUser user.User, targetUserID string, req user.AdminChangeRoleRequest) (*user.User, error) {
	target, err := s.GetByID(ctx, targetUserID)
	if err != nil {
		return nil, err
	}

	// ดึงชื่อ role ใหม่
	var newRoleName string
	err = s.db.QueryRowContext(ctx, `SELECT name FROM roles WHERE id = $1`, req.RoleID).Scan(&newRoleName)
	if err != nil {
		return nil, fmt.Errorf("invalid role id")
	}

	// ป้องกันการ demote superadmin คนสุดท้าย
	if target.RoleName == "superadmin" && newRoleName != "superadmin" {
		var count int
		err = s.db.QueryRowContext(ctx,
			`SELECT COUNT(*) FROM users WHERE role_id = 3 AND is_active = true AND id != $1`,
			targetUserID,
		).Scan(&count)
		if err != nil {
			return nil, err
		}
		if count == 0 {
			return nil, fmt.Errorf("cannot demote the last active superadmin")
		}
	}

	_, err = s.db.ExecContext(ctx,
		`UPDATE users SET role_id = $1, updated_at = NOW() WHERE id = $2`,
		req.RoleID, targetUserID,
	)
	if err != nil {
		return nil, fmt.Errorf("cannot change role: %w", err)
	}

	return s.GetByID(ctx, targetUserID)
}

// AdminDeleteUser soft delete (set is_active=false) พร้อมตรวจสอบ
func (s *UserService) AdminDeleteUser(ctx context.Context, adminUser user.User, targetUserID string) error {
	target, err := s.GetByID(ctx, targetUserID)
	if err != nil {
		return err
	}

	// ป้องกันลบ superadmin คนสุดท้าย
	if target.RoleName == "superadmin" {
		var count int
		err = s.db.QueryRowContext(ctx,
			`SELECT COUNT(*) FROM users WHERE role_id = 3 AND is_active = true AND id != $1`,
			targetUserID,
		).Scan(&count)
		if err != nil {
			return err
		}
		if count == 0 {
			return fmt.Errorf("cannot delete the last active superadmin")
		}
	}

	_, err = s.db.ExecContext(ctx,
		`UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1`,
		targetUserID,
	)
	return err
}

// GetRoles ดึงรายการ role ทั้งหมด
func (s *UserService) GetRoles(ctx context.Context) ([]role.Role, error) {
	rows, err := s.db.QueryContext(ctx, `SELECT id, name FROM roles ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var roles []role.Role
	for rows.Next() {
		var r role.Role
		if err := rows.Scan(&r.ID, &r.Name); err != nil {
			return nil, err
		}
		roles = append(roles, r)
	}
	return roles, rows.Err()
}

// updateUser internal helper สำหรับอัปเดตข้อมูล user
func (s *UserService) updateUser(ctx context.Context, userID string, req user.UpdateUserRequest) (*user.User, error) {
	// สร้าง query แบบ dynamic ตามฟิลด์ที่ส่งมา
	query := `UPDATE users SET updated_at = NOW()`
	args := []any{}
	argIdx := 1

	if req.Username != nil {
		query += fmt.Sprintf(`, username = $%d`, argIdx)
		args = append(args, *req.Username)
		argIdx++
	}
	if req.Email != nil {
		query += fmt.Sprintf(`, email = $%d`, argIdx)
		args = append(args, *req.Email)
		argIdx++
	}
	if req.FirstName != nil {
		query += fmt.Sprintf(`, first_name = $%d`, argIdx)
		args = append(args, *req.FirstName)
		argIdx++
	}
	if req.LastName != nil {
		query += fmt.Sprintf(`, last_name = $%d`, argIdx)
		args = append(args, *req.LastName)
		argIdx++
	}
	if req.DepartmentID != nil {
		query += fmt.Sprintf(`, department_id = $%d`, argIdx)
		if *req.DepartmentID <= 0 {
			args = append(args, nil)
		} else {
			args = append(args, *req.DepartmentID)
		}
		argIdx++
	}
	if req.IsActive != nil {
		query += fmt.Sprintf(`, is_active = $%d`, argIdx)
		args = append(args, *req.IsActive)
		argIdx++
	}

	query += fmt.Sprintf(` WHERE id = $%d`, argIdx)
	args = append(args, userID)

	_, err := s.db.ExecContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("cannot update user: %w", err)
	}

	return s.GetByID(ctx, userID)
}
