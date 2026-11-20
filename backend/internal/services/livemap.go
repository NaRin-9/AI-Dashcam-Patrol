package services

import "ai-dashcam-patrol/backend/internal/entities"

// DemoLiveMap คืนเส้นทางและเคสจำลองสำหรับทดลองหน้าแผนที่
func DemoLiveMap() entities.LiveMap {
	return entities.LiveMap{
		Demo: true,
		Tracks: []entities.Track{
			{
				ID:   "DEMO-TRACK-01",
				Date: "2026-11-18",
				Points: [][2]float64{
					{100.5308, 13.7264},
					{100.5355, 13.7251},
					{100.5403, 13.7240},
					{100.5449, 13.7229},
					{100.5508, 13.7222},
					{100.5530, 13.7252},
					{100.5553, 13.7285},
					{100.5578, 13.7321},
				},
			},
		},
		Spans: []entities.RiskSpan{},
		Cases: []entities.RiskCaseMarker{
			{
				ID:                "DEMO-001",
				ConfirmedLocation: [2]float64{100.5355, 13.7254},
				RiskLevel:         "near",
				CapturedAt:        "2026-11-18T09:02:00+07:00",
			},
			{
				ID:                "DEMO-002",
				ConfirmedLocation: [2]float64{100.5450, 13.7233},
				RiskLevel:         "touching",
				CapturedAt:        "2026-11-18T09:05:00+07:00",
			},
			{
				ID:                "DEMO-003",
				ConfirmedLocation: [2]float64{100.5557, 13.7284},
				RiskLevel:         "near",
				CapturedAt:        "2026-11-18T09:08:00+07:00",
			},
		},
	}
}
