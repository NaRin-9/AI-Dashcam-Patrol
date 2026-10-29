# การทำงานร่วมกัน

## แบ่งงานตามหน้า

แต่ละหน้าอยู่ในโฟลเดอร์ของตัวเองใน `frontend/src/pages/` คนที่รับผิดชอบหน้าไหนแก้เฉพาะโฟลเดอร์นั้นเป็นหลัก
จึงไม่ค่อยชนกันเวลารวมงาน

| หน้า | โฟลเดอร์ | URL | ผู้รับผิดชอบ |
|---|---|---|---|
| หน้าแรก | `pages/Home` | `#/` | |
| แผนที่ | `pages/LiveMap` | `#/live-map` | |
| รายงานความเสี่ยง | `pages/RiskReports` | `#/risk-reports` | |
| วิธีการทำงาน | `pages/HowItWorks` | `#/how-it-works` | |
| เข้าสู่ระบบ | `pages/Login` | `#/login` | |

ไฟล์ที่ใช้ร่วมกันหลายหน้า แก้แล้วให้บอกทีม
- `frontend/src/routes/index.jsx` รายการหน้าและเมนู
- `backend/internal/routes/routes.go` รายการ API
- `src/components/` ส่วนประกอบที่ใช้หลายหน้า
- `src/styles/global.css` สีและสไตล์หลัก

## เพิ่มหน้าใหม่

1. คัดลอกโฟลเดอร์ของหน้าที่ยังว่าง เช่น `pages/LiveMap` แล้วเปลี่ยนชื่อ
2. เพิ่ม 1 บรรทัดใน `frontend/src/routes/index.jsx`
3. ส่วนย่อยที่ใช้เฉพาะหน้านั้นให้ไว้ใน `pages/<ชื่อหน้า>/components/`

## เพิ่ม API (backend Go)

1. รูปแบบข้อมูลใหม่ เพิ่มใน `backend/internal/entities`
2. logic เขียนใน `internal/services/<เรื่อง>.go`
3. controller เขียนใน `internal/controllers/<เรื่อง>.go`
4. เพิ่ม 1 บรรทัดใน `internal/routes/routes.go`
5. รัน `go fmt ./...` และ `go test ./...` ก่อน commit

## Git

- อย่า commit ตรงเข้า `main` ให้แตกกิ่งใหม่ทุกครั้ง
- ตั้งชื่อกิ่ง: `feature/<หน้าหรือเรื่อง>` เช่น `feature/live-map`, แก้บั๊กใช้ `fix/<เรื่อง>`
- ข้อความ commit สั้นๆ บอกว่าทำอะไร เช่น `live-map: add route layer`
- เปิด Pull Request ให้เพื่อนอีก 1 คนดูก่อน merge
- ก่อนเริ่มงานทุกวัน `git pull` จาก `main` ก่อน

## import

ใช้ `@/` แทนการไล่ `../../` เช่น `import Navbar from '@/components/layout/Navbar'`
