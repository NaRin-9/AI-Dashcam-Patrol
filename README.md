# AI Dashcam Patrol

ระบบจัดลำดับความเสี่ยงต้นไม้ใกล้แนวสายไฟฟ้าจากกล้องติดรถยนต์ (โครงการนำร่อง กฟภ.)

- **frontend**: เว็บ React + Vite
- **backend**: API ภาษา Go

เอกสารโครงการ (ข้อเสนอ แผนงาน การเลือกกล้อง) เก็บแยกไว้นอก repo นี้

## โครงสร้างโปรเจกต์

```
AI-Dashcam-Patrol/
├─ frontend/                       เว็บ (React + Vite)
│  ├─ src/
│  │  ├─ main.jsx                  จุดเริ่มของแอป
│  │  ├─ app/
│  │  │  └─ App.jsx                เลือกหน้าที่จะแสดงตาม URL
│  │  ├─ routes/
│  │  │  ├─ index.jsx              รายการหน้าทั้งหมดและเมนู (เพิ่มหน้าใหม่ที่นี่)
│  │  │  └─ router.jsx             ตัวเปลี่ยนหน้าแบบ #/path และ <Link>
│  │  ├─ pages/                    1 โฟลเดอร์ = 1 หน้า
│  │  │  ├─ Home/                  HomePage.jsx, components/Hero.jsx
│  │  │  ├─ LiveMap/               แผนที่เส้นทางรถและจุดเสี่ยง
│  │  │  ├─ RiskReports/           รายการ span เรียงตามความเสี่ยง
│  │  │  ├─ HowItWorks/            ขั้นตอนการทำงานของระบบ
│  │  │  ├─ Login/                 เข้าสู่ระบบ
│  │  │  └─ NotFound/              หน้าเมื่อไม่พบ URL
│  │  ├─ components/               ส่วนประกอบที่ใช้หลายหน้า
│  │  │  ├─ layout/                Layout.jsx, Navbar.jsx
│  │  │  └─ ui/                    PagePlaceholder.jsx และปุ่ม การ์ด ฯลฯ
│  │  ├─ services/api.js           จุดเดียวที่เรียก backend
│  │  ├─ hooks/                    custom hooks
│  │  ├─ utils/                    ฟังก์ชันช่วยทั่วไป
│  │  ├─ assets/                   รูปและไอคอน
│  │  └─ styles/global.css         สีและสไตล์หลัก
│  ├─ public/                      favicon.png
│  ├─ index.html
│  ├─ vite.config.js               alias @/ และ proxy /api → backend
│  ├─ .env.example
│  └─ package.json
│
├─ backend/                        API (Go)
│  ├─ cmd/server/main.go           จุดเริ่ม เปิดเซิร์ฟเวอร์พอร์ต 8000
│  ├─ internal/
│  │  ├─ routes/                   รายการ API: URL → controller (+ logger, CORS)
│  │  ├─ controllers/              รับคำขอ HTTP เรียก service แล้วส่ง JSON กลับ
│  │  ├─ services/                 logic ของระบบ (คำนวณ จัดลำดับ อ่านฐานข้อมูล)
│  │  └─ entities/                 รูปแบบข้อมูล เช่น RiskSpan, Track
│  ├─ .env.example
│  └─ go.mod
│
├─ CONTRIBUTING.md                 กติกาทำงานร่วมกัน
├─ .editorconfig  .gitattributes   รูปแบบไฟล์ที่ทุกคนใช้ร่วมกัน
└─ .gitignore                      ไฟล์ที่ไม่ขึ้น git
```

ทั้งสองฝั่งมีโฟลเดอร์ `routes` เป็นที่รวมรายการหน้า (frontend) และรายการ API (backend)

## เริ่มต้นใช้งาน

ต้องมี Node.js 20 ขึ้นไป และ Go 1.22 ขึ้นไป เปิด 2 terminal

```bash
# terminal 1: backend → http://localhost:8000
cd backend
go run ./cmd/server

# terminal 2: frontend → http://localhost:5173
cd frontend
npm install
npm run dev
```

frontend ส่งคำขอ `/api/...` ไปที่ backend ให้อัตโนมัติ ตรวจว่า backend ทำงานที่ http://localhost:8000/api/health

## API ตอนนี้

| Method | Path | ใช้กับหน้า |
|---|---|---|
| GET | `/api/health` | – |
| GET | `/api/risk-reports` | RiskReports (ยังคืนข้อมูลว่าง) |
| GET | `/api/live-map` | LiveMap (ยังคืนข้อมูลว่าง) |

รายละเอียดเพิ่มเติม: [frontend/README.md](frontend/README.md), [backend/README.md](backend/README.md)

## ทำงานร่วมกัน

อ่าน [CONTRIBUTING.md](CONTRIBUTING.md) ก่อนเริ่มแก้โค้ด

## ข้อห้าม

ห้าม commit วิดีโอ ภาพจากกล้อง ข้อมูล GIS หรือข้อมูลของ กฟภ. ให้เก็บในโฟลเดอร์ `data/` ซึ่งถูกกันไว้ใน `.gitignore` แล้ว
