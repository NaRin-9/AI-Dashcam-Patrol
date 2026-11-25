# Backend (Go)

API ของ AI Dashcam Patrol ใช้ Go, Gin และ PostgreSQL สำหรับระบบล็อกอิน

## รัน

ต้องมี Go 1.26 ขึ้นไป และตั้งค่าฐานข้อมูลก่อน

```bash
cd backend
go run ./cmd/server
```

เซิร์ฟเวอร์เปิดที่ http://localhost:8000 ตรวจได้ที่ http://localhost:8000/api/health
frontend (`npm run dev`) ส่งคำขอ `/api/...` มาที่พอร์ตนี้ให้อัตโนมัติ

ตั้ง `FRONTEND_DIR` ไปยังโฟลเดอร์ `frontend/dist` ที่ build แล้วเพื่อเสิร์ฟเว็บจาก Go ด้วย ดูตัวอย่างการรันใน [README หลัก](../README.md#รันเว็บที่-build-แล้ว)

## ตั้งค่าฐานข้อมูลและล็อกอิน

1. เตรียม PostgreSQL จาก `docker compose up -d postgres` ที่รากโปรเจกต์ หรือใช้ PostgreSQL ที่มีอยู่
2. คัดลอก `backend/.env.example` เป็น `backend/.env` แล้วตั้ง `DB_*` ให้ตรงกับฐานข้อมูล รวมถึง `JWT_SECRET` ที่สุ่มขึ้นมาอย่างน้อย 32 ไบต์ Go จะสร้างตารางสำหรับระบบล็อกอินตอนเริ่มรัน
3. หากต้องการสร้าง Superadmin คนแรก ให้ตั้ง `SUPERADMIN_USERNAME`, `SUPERADMIN_EMAIL` และ `SUPERADMIN_PASSWORD` ก่อนเปิด Go เมื่อสร้างบัญชีแล้วสามารถเอาค่าทั้งสามออกจาก environment ได้

ตอนทดสอบในเครื่องเดียวสามารถตั้ง `HOST=127.0.0.1` ให้ Go รับเฉพาะการเชื่อมต่อในเครื่อง

ใช้ `go fmt ./...` เพื่อจัดรูปแบบโค้ด และ `go build -o bin/server ./cmd/server` เพื่อสร้างไฟล์โปรแกรม

### บัญชีทดสอบสำหรับเครื่องพัฒนา

เปิด PostgreSQL ให้พร้อม แล้วรันจากโฟลเดอร์ `backend`

```bash
go run ./cmd/server -seed-demo-users
```

คำสั่งนี้ใช้กับ PostgreSQL ในเครื่อง และจะจบหลังสร้างบัญชี ให้เปิด Backend ตามปกติแล้วล็อกอินด้วยชื่อบัญชีในตาราง

| ชื่อบัญชี | บทบาท |
|---|---|
| `demo_user` | User |
| `demo_admin` | Admin |
| `demo_superadmin` | Superadmin |

บัญชีใหม่ทั้งสามใช้รหัสผ่านทดสอบ `Dashcam1234!` หากต้องการใช้รหัสอื่น ให้ตั้ง `DEMO_USERS_PASSWORD` ใน `backend/.env` ให้มีอย่างน้อย 12 ตัวอักษรก่อนรัน เมื่อรันซ้ำ คำสั่งจะเติมชื่อ นามสกุล และแผนกที่ยังว่างในบัญชีทดสอบ โดยเก็บข้อมูลที่กรอกไว้และรหัสผ่านเดิม

## จะแก้เรื่องไหน เปิดไฟล์ไหนดี

พาธในตารางนับจากโฟลเดอร์ `backend/`

| เรื่อง | เริ่มจากไฟล์นี้ |
|---|---|
| เปิดเซิร์ฟเวอร์ เชื่อมฐานข้อมูล หรือเรียก seed | [cmd/server/main.go](cmd/server/main.go) |
| ค่าตั้งต้นของระบบและตัวแปรแวดล้อม | [internal/config/config.go](internal/config/config.go) และ [.env.example](.env.example) |
| เพิ่ม URL ของ API หรือแก้ CORS | [internal/routes/routes.go](internal/routes/routes.go) |
| ตรวจโทเคนและบทบาทผู้ใช้ | [internal/middleware/auth.go](internal/middleware/auth.go) |
| รับคำขอ HTTP และส่งผลกลับ | [internal/controllers/](internal/controllers/) |
| กฎการทำงานและการอ่านเขียนข้อมูล เช่น บัญชีผู้ใช้และแผนก | [internal/services/](internal/services/) |
| โครงสร้างข้อมูล เช่น ผู้ใช้ จุดเสี่ยง หรือวิดีโอ | [internal/entities/](internal/entities/) แยกโฟลเดอร์ตามชนิดข้อมูล |
| สร้างหรืออัปเดตตาราง รวมถึงข้อมูลเริ่มต้นของบทบาทและแผนก | [internal/database/database.go](internal/database/database.go) |
| สร้างบัญชี Superadmin เริ่มต้นหรือบัญชีทดสอบ | [internal/database/seed.go](internal/database/seed.go) |
| เสิร์ฟหน้าเว็บเมื่อกำหนด `FRONTEND_DIR` | [internal/routes/frontend.go](internal/routes/frontend.go) |

ตัวอย่าง ถ้าจะแก้ API รายชื่อแผนก ให้เริ่มจาก `GET /api/departments` ใน `routes.go` เส้นทางนี้เรียก `DepartmentController.List` ใน `controllers/department.go` แล้วไปอ่านฐานข้อมูลผ่าน `DepartmentService.List` ใน `services/department.go`

ส่วนวิดีโอให้เริ่มที่ [controllers/video_uploads.go](internal/controllers/video_uploads.go) ตอนนี้ไฟล์นี้รับคำขอ ตรวจไฟล์ บันทึกลงดิสก์ และอ่านเขียนตาราง `video_uploads` โดยตรง ที่เก็บไฟล์ปรับได้ด้วย `VIDEO_UPLOAD_DIR`

## API ที่ใช้บ่อย

| Method | Path | ทำอะไร | สิทธิ์ |
|---|---|---|---|
| GET | `/api/health` | เช็กว่า Backend ตอบได้ | เปิดทั่วไป |
| POST | `/api/auth/login` | เข้าสู่ระบบ | เปิดทั่วไป |
| GET | `/api/departments` | ดูรายชื่อแผนก | ล็อกอิน |
| GET | `/api/live-map` | คืนหมุดจำลอง ส่วน Admin และ Superadmin ได้เส้นทางรถจำลองด้วย | ล็อกอิน |
| GET | `/api/risk-reports` | รายงานช่วงเสาที่มีความเสี่ยง ตอนนี้คืนรายการว่าง | ล็อกอิน |
| GET | `/api/videos` | ดูรายการวิดีโอของบัญชีที่ล็อกอิน | ล็อกอิน |
| POST | `/api/videos` | อัปโหลด MP4 หรือ MOV แล้วบันทึกสถานะเริ่มต้นเป็น `queued` | ล็อกอิน |
| GET | `/api/admin/users` | ดูรายการบัญชีผู้ใช้ | Admin และ Superadmin |

ดูเส้นทางทั้งหมดได้ที่ [routes.go](internal/routes/routes.go)

## เพิ่ม API ใหม่

1. เขียนส่วนรับคำขอและส่งผลตอบกลับใน `internal/controllers/` ถ้ามีกฎการทำงานหรือการอ่านเขียนข้อมูล ให้เพิ่มใน Service ของเรื่องนั้น
2. ถ้าต้องเพิ่มรูปแบบข้อมูล ให้สร้าง struct ในแพ็กเกจของเรื่องนั้นใต้ `internal/entities/`
3. ลงทะเบียนใน `internal/routes/routes.go` โดยเลือกกลุ่มตามสิทธิ์ `api` สำหรับ API สาธารณะ, `authenticated` สำหรับคนที่ล็อกอิน และ `admin` สำหรับ Admin กับ Superadmin ตัวอย่างที่ใช้อยู่

   ```go
   authenticated.GET("/departments/:id", deps.DepartmentController.Get)
   ```

   เส้นทางเต็มคือ `GET /api/departments/:id`
4. รัน `go fmt ./...` และ `go test ./...` จากโฟลเดอร์ `backend` ก่อนเปิด Pull Request
