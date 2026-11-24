package detection

import "time"

// Detection เก็บผลตรวจจากโมเดลในตาราง detections
type Detection struct {
	ID              int        `json:"id"`
	VideoID         string     `json:"videoId"` // video_uploads.id (UUID)
	RiskCaseID      *int       `json:"riskCaseId"`
	FrameOffsetMS   int64      `json:"frameOffsetMs"`
	FrameStorageKey *string    `json:"-"`
	RiskLevel       string     `json:"riskLevel"`
	Confidence      *float32   `json:"confidence"`
	CameraLatitude  *float64   `json:"cameraLatitude"`
	CameraLongitude *float64   `json:"cameraLongitude"`
	CapturedAt      *time.Time `json:"capturedAt"`
	CreatedAt       time.Time  `json:"createdAt"`
}
