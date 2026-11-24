package refreshtoken

import "time"

// RefreshToken เก็บ hashed refresh token ในฐานข้อมูล
type RefreshToken struct {
	ID        string    `json:"id"`
	UserID    string    `json:"userId"`
	TokenHash string    `json:"-"`
	ExpiresAt time.Time `json:"expiresAt"`
	CreatedAt time.Time `json:"createdAt"`
}
