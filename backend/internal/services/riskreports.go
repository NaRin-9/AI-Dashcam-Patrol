// services: logic ของระบบ เช่น ดึงข้อมูลและจัดลำดับความเสี่ยง แยกจาก controller ที่ดูแลแค่ HTTP
package services

import (
	"context"

	"ai-dashcam-patrol/backend/internal/entities"
)

// ListRiskSpans คืนรายการ span เรียงตามความเสี่ยง
// TODO: ดึงจากฐานข้อมูล (PostGIS) เมื่อมีฐานข้อมูล
func ListRiskSpans(ctx context.Context) ([]entities.RiskSpan, error) {
	return []entities.RiskSpan{}, nil
}
