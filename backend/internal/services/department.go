package services

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"ai-dashcam-patrol/backend/internal/entities/department"
)

// DepartmentService จัดการข้อมูลแผนก
type DepartmentService struct {
	db *sql.DB
}

// NewDepartmentService สร้าง DepartmentService ใหม่
func NewDepartmentService(db *sql.DB) *DepartmentService {
	return &DepartmentService{db: db}
}

// List ดึงรายการแผนกทั้งหมดพร้อมจำนวนสมาชิกในแผนก
func (s *DepartmentService) List(ctx context.Context) ([]department.Department, error) {
	rows, err := s.db.QueryContext(ctx,
		`SELECT d.id, d.name, COALESCE(d.description, ''), d.created_at, d.updated_at,
		        COUNT(u.id) AS user_count
		 FROM departments d
		 LEFT JOIN users u ON u.department_id = d.id AND u.is_active = true
		 GROUP BY d.id, d.name, d.description, d.created_at, d.updated_at
		 ORDER BY d.id ASC`,
	)
	if err != nil {
		return nil, fmt.Errorf("cannot query departments: %w", err)
	}
	defer rows.Close()

	var list []department.Department
	for rows.Next() {
		var dept department.Department
		if err := rows.Scan(&dept.ID, &dept.Name, &dept.Description, &dept.CreatedAt, &dept.UpdatedAt, &dept.UserCount); err != nil {
			return nil, fmt.Errorf("cannot scan department: %w", err)
		}
		list = append(list, dept)
	}
	return list, rows.Err()
}

// GetByID ดึงข้อมูลแผนกตาม ID
func (s *DepartmentService) GetByID(ctx context.Context, id int) (*department.Department, error) {
	var dept department.Department
	err := s.db.QueryRowContext(ctx,
		`SELECT d.id, d.name, COALESCE(d.description, ''), d.created_at, d.updated_at,
		        COUNT(u.id) AS user_count
		 FROM departments d
		 LEFT JOIN users u ON u.department_id = d.id
		 WHERE d.id = $1
		 GROUP BY d.id, d.name, d.description, d.created_at, d.updated_at`,
		id,
	).Scan(&dept.ID, &dept.Name, &dept.Description, &dept.CreatedAt, &dept.UpdatedAt, &dept.UserCount)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("department not found")
		}
		return nil, fmt.Errorf("cannot query department: %w", err)
	}
	return &dept, nil
}

// Create สร้างแผนกใหม่
func (s *DepartmentService) Create(ctx context.Context, req department.CreateDepartmentRequest) (*department.Department, error) {
	var id int
	err := s.db.QueryRowContext(ctx,
		`INSERT INTO departments (name, description, created_at, updated_at)
		 VALUES ($1, $2, NOW(), NOW())
		 RETURNING id`,
		req.Name, req.Description,
	).Scan(&id)
	if err != nil {
		return nil, fmt.Errorf("cannot create department: %w", err)
	}

	return s.GetByID(ctx, id)
}

// Update แก้ไขแผนก
func (s *DepartmentService) Update(ctx context.Context, id int, req department.UpdateDepartmentRequest) (*department.Department, error) {
	if _, err := s.GetByID(ctx, id); err != nil {
		return nil, err
	}

	query := `UPDATE departments SET updated_at = NOW()`
	args := []any{}
	argIdx := 1

	if req.Name != nil {
		query += fmt.Sprintf(`, name = $%d`, argIdx)
		args = append(args, *req.Name)
		argIdx++
	}
	if req.Description != nil {
		query += fmt.Sprintf(`, description = $%d`, argIdx)
		args = append(args, *req.Description)
		argIdx++
	}

	query += fmt.Sprintf(` WHERE id = $%d`, argIdx)
	args = append(args, id)

	_, err := s.db.ExecContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("cannot update department: %w", err)
	}

	return s.GetByID(ctx, id)
}

// Delete ลบแผนก (ผู้ใช้ในแผนกนี้จะถูกเซ็ต department_id = NULL โดยอัตโนมัติตาม Foreign Key)
func (s *DepartmentService) Delete(ctx context.Context, id int) error {
	res, err := s.db.ExecContext(ctx, `DELETE FROM departments WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("cannot delete department: %w", err)
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("department not found")
	}
	return nil
}
