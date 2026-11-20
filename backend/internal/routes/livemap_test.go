package routes

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"ai-dashcam-patrol/backend/internal/entities"
	"github.com/golang-jwt/jwt/v5"
)

func TestLiveMapTracksByRole(t *testing.T) {
	const testSecret = "live-map-test-signing-key"
	handler := Setup(Dependencies{JWTSecret: testSecret})

	tests := []struct {
		role       string
		wantStatus int
		wantTracks bool
	}{
		{"", http.StatusUnauthorized, false},
		{"user", http.StatusOK, false},
		{"admin", http.StatusOK, true},
		{"superadmin", http.StatusOK, true},
	}

	for _, test := range tests {
		t.Run(test.role, func(t *testing.T) {
			request := httptest.NewRequest(http.MethodGet, "/api/live-map", nil)
			if test.role != "" {
				token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, entities.TokenClaims{
					RoleName: test.role,
				}).SignedString([]byte(testSecret))
				if err != nil {
					t.Fatal(err)
				}
				request.Header.Set("Authorization", "Bearer "+token)
			}

			response := httptest.NewRecorder()
			handler.ServeHTTP(response, request)
			if response.Code != test.wantStatus {
				t.Fatalf("status = %d, want %d", response.Code, test.wantStatus)
			}
			if response.Code != http.StatusOK {
				return
			}

			var payload entities.LiveMap
			if err := json.Unmarshal(response.Body.Bytes(), &payload); err != nil {
				t.Fatal(err)
			}
			if gotTracks := len(payload.Tracks) != 0; gotTracks != test.wantTracks {
				t.Fatalf("has tracks = %t, want %t", gotTracks, test.wantTracks)
			}
			if len(payload.Cases) == 0 {
				t.Fatal("authenticated map should include cases")
			}
		})
	}
}
