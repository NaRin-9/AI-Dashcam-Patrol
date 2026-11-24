package videoupload

import "time"

// VideoUpload เก็บข้อมูลวิดีโอและสถานะประมวลผลในตาราง video_uploads
type VideoUpload struct {
	ID                  string     `json:"id"` // UUID
	UploadedBy          *string    `json:"uploadedBy"`
	OriginalName        string     `json:"originalName"`
	StorageKey          string     `json:"-"`
	SizeBytes           int64      `json:"sizeBytes"`
	Status              string     `json:"status"`
	CreatedAt           time.Time  `json:"createdAt"`
	PatrolRunID         *int       `json:"patrolRunId"`
	ProcessingStartedAt *time.Time `json:"processingStartedAt"`
	ProcessedAt         *time.Time `json:"processedAt"`
	ProcessingError     *string    `json:"-"`
}

// Summary คือข้อมูลที่หน้า “วิดีโอของฉัน” แสดง
type Summary struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	SizeBytes int64     `json:"sizeBytes"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"createdAt"`
}
