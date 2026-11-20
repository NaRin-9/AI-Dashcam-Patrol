// entities: รูปแบบข้อมูลของระบบ ใช้ร่วมกันทุกชั้นและเป็นรูปแบบ JSON ที่ส่งให้ frontend
package entities

// RiskSpan คือช่วงเสา 1 ช่วงพร้อมระดับความเสี่ยง
type RiskSpan struct {
	ID         string  `json:"id"`
	FromPole   string  `json:"fromPole"`   // รหัสเสาต้นทาง
	ToPole     string  `json:"toPole"`     // รหัสเสาปลายทาง
	Feeder     string  `json:"feeder"`     // ฟีดเดอร์
	RiskLevel  string  `json:"riskLevel"`  // clear | near | touching
	Score      float64 `json:"score"`      // คะแนนจากโมเดล 0–1
	ImageURL   string  `json:"imageUrl"`   // ภาพประกอบ
	CapturedAt string  `json:"capturedAt"` // วันที่บันทึกภาพ (ISO 8601)
}

// Track คือเส้นทางรถ 1 รอบวิ่ง (พิกัด [lng, lat])
type Track struct {
	ID     string       `json:"id"`
	Date   string       `json:"date"`
	Points [][2]float64 `json:"points"`
}

// RiskCaseMarker คือจุดเสี่ยงที่ยืนยันแล้วสำหรับแผนที่ (พิกัด [lng, lat])
type RiskCaseMarker struct {
	ID                string     `json:"id"`
	ConfirmedLocation [2]float64 `json:"confirmedLocation"`
	RiskLevel         string     `json:"riskLevel"`
	CapturedAt        string     `json:"capturedAt"`
}

// LiveMap คือข้อมูลทั้งหมดที่หน้าแผนที่ใช้
type LiveMap struct {
	Demo   bool             `json:"demo"`
	Tracks []Track          `json:"tracks"`
	Spans  []RiskSpan       `json:"spans"`
	Cases  []RiskCaseMarker `json:"cases"`
}
