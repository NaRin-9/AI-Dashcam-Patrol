# Backend (Go)

API ของ AI Dashcam Patrol เขียนด้วย Go ใช้แค่ไลบรารีมาตรฐาน (`net/http`) ยังไม่มีแพ็กเกจภายนอก

## รัน

ต้องมี Go 1.22 ขึ้นไป

```bash
cd backend
go run ./cmd/server
```

เซิร์ฟเวอร์เปิดที่ http://localhost:8000 ตรวจได้ที่ http://localhost:8000/api/health
frontend (`npm run dev`) ส่งคำขอ `/api/...` มาที่พอร์ตนี้ให้อัตโนมัติ

คำสั่งอื่น: `go test ./...` รันเทสต์, `go fmt ./...` จัดรูปแบบโค้ด, `go build -o bin/server ./cmd/server` สร้างไฟล์โปรแกรม

## โครงสร้าง

```
backend/
├─ cmd/server/main.go        จุดเริ่ม: อ่านค่าตั้งค่า แล้วเปิดเซิร์ฟเวอร์
├─ internal/
│  ├─ routes/
│  │  ├─ routes.go           รายการ API ทั้งหมด: method + path → controller
│  │  └─ middleware.go       logger และ CORS ที่ทุกคำขอผ่าน
│  ├─ controllers/           รับคำขอ HTTP → เรียก service → ส่ง JSON กลับ
│  │  ├─ health.go           GET /api/health
│  │  ├─ riskreports.go      GET /api/risk-reports
│  │  ├─ livemap.go          GET /api/live-map
│  │  └─ respond.go          ฟังก์ชันส่ง JSON และ error
│  ├─ services/              logic ของระบบ
│  │  └─ riskreports.go
│  └─ entities/              รูปแบบข้อมูลของระบบ
│     └─ entities.go         RiskSpan, Track, LiveMap
├─ .env.example              PORT, ALLOWED_ORIGIN
└─ go.mod
```

## แต่ละส่วนทำหน้าที่อะไร

| ส่วน | หน้าที่ | ไม่ควรทำ |
|---|---|---|
| `routes` | ประตูทางเข้า บอกว่า URL ไหนไปหา controller ตัวไหน และให้ทุกคำขอผ่าน logger กับ CORS | ไม่มี logic |
| `controllers` | คุยกับ HTTP: อ่านค่าจาก URL หรือ body ตรวจความถูกต้อง เรียก service แล้วส่ง JSON และรหัสสถานะ (200, 400, 500) กลับ | ไม่คำนวณ ไม่ต่อฐานข้อมูลเอง |
| `services` | สมองของระบบ: ดึงข้อมูล คำนวณ จัดลำดับความเสี่ยง และ (เมื่อมีฐานข้อมูล) อ่านเขียนฐานข้อมูล | ไม่รู้จัก HTTP |
| `entities` | นิยามหน้าตาข้อมูล เช่น span มีรหัสเสา ระดับความเสี่ยง คะแนน ใช้ร่วมกันทุกชั้น และเป็นรูปแบบ JSON ที่ frontend ได้รับ | ไม่มี logic |
| `cmd/server` | เปิดโปรแกรม อ่านค่าตั้งค่า แล้วเริ่มเซิร์ฟเวอร์ | – |

ลำดับเมื่อมีคำขอเข้ามา:

```
frontend → routes → controller → service → (ฐานข้อมูล)
                         ↑            ↓
                     entities ← ข้อมูลที่ได้
```

ตัวอย่าง: frontend เรียก `GET /api/risk-reports`
1. `routes` ส่งไปที่ `controllers.ListRiskReports`
2. controller เรียก `services.ListRiskSpans`
3. service คืนรายการ `entities.RiskSpan` (ตอนนี้ยังว่าง)
4. controller แปลงเป็น JSON `{"items": [...]}` ส่งกลับ

## API ตอนนี้

| Method | Path | ใช้กับหน้า | สถานะ |
|---|---|---|---|
| GET | `/api/health` | – | ใช้ได้ |
| GET | `/api/risk-reports` | RiskReports | คืนรายการว่าง รอฐานข้อมูล |
| GET | `/api/live-map` | LiveMap | คืนข้อมูลว่าง รอฐานข้อมูล |

## เพิ่ม endpoint ใหม่

1. ถ้ามีข้อมูลรูปแบบใหม่ เพิ่ม struct ใน `internal/entities`
2. เขียน logic ใน `internal/services/<เรื่อง>.go`
3. เขียน controller ใน `internal/controllers/<เรื่อง>.go`
4. เพิ่ม 1 บรรทัดใน `internal/routes/routes.go` เช่น `mux.HandleFunc("GET /api/spans/{id}", controllers.GetSpan)`
5. ฝั่ง frontend เรียกผ่าน `apiGet('/spans/123')` ใน `src/services/api.js`
