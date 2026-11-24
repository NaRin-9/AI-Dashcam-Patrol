package user

import "time"

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
