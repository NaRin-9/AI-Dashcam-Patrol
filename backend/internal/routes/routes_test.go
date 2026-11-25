package routes_test

import (
	"testing"

	"github.com/gin-gonic/gin"

	"ai-dashcam-patrol/backend/internal/controllers"
	"ai-dashcam-patrol/backend/internal/routes"
)

func TestSetup_NoDuplicateRoutesPanic(t *testing.T) {
	gin.SetMode(gin.TestMode)

	deps := routes.Dependencies{
		AuthController:         &controllers.AuthController{},
		UserController:         &controllers.UserController{},
		DepartmentController:   &controllers.DepartmentController{},
		RiskReportsController:  &controllers.RiskReportsController{},
		VideoUploadsController: &controllers.VideoUploadsController{},
		JWTSecret:              "test-secret",
		AllowedOrigin:          "http://localhost:5173",
	}

	defer func() {
		if r := recover(); r != nil {
			t.Fatalf("routes.Setup panicked: %v", r)
		}
	}()

	r := routes.Setup(deps)
	if r == nil {
		t.Fatal("expected non-nil router")
	}
}
