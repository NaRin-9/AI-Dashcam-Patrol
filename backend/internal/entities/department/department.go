package department

import "time"

// Department แผนกในองค์กร
type Department struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
	UserCount   int       `json:"userCount"`
}

// CreateDepartmentRequest คำขอสร้างแผนกใหม่
type CreateDepartmentRequest struct {
	Name        string `json:"name" binding:"required,min=2,max=100"`
	Description string `json:"description"`
}

// UpdateDepartmentRequest คำขอแก้ไขแผนก
type UpdateDepartmentRequest struct {
	Name        *string `json:"name" binding:"omitempty,min=2,max=100"`
	Description *string `json:"description"`
}
