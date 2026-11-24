package detectionreview

import "time"

// DetectionReview เก็บผลตรวจของแอดมินในตาราง detection_reviews
type DetectionReview struct {
	ID          int        `json:"id"`
	DetectionID int        `json:"detectionId"`
	ReviewedBy  *string    `json:"reviewedBy"` // users.id (UUID)
	Decision    *string    `json:"decision"`
	Note        *string    `json:"note"`
	ReviewedAt  *time.Time `json:"reviewedAt"`
}
