package patrolrun

import "time"

// PatrolRun เก็บข้อมูลรอบสำรวจในตาราง patrol_runs
type PatrolRun struct {
	ID              int        `json:"id"`
	UploadedBy      string     `json:"uploadedBy"` // users.id (UUID)
	StartedAt       *time.Time `json:"startedAt"`
	EndedAt         *time.Time `json:"endedAt"`
	TrackStorageKey *string    `json:"-"`
	CreatedAt       time.Time  `json:"createdAt"`
}
