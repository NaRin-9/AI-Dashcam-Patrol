# การทำงานร่วมกัน

## แบ่งงานตามหน้า

แต่ละหน้าอยู่ในโฟลเดอร์ของตัวเองใน `frontend/src/pages/` คนที่รับผิดชอบหน้าไหนแก้เฉพาะโฟลเดอร์นั้นเป็นหลัก
จึงไม่ค่อยชนกันเวลารวมงาน

| หน้า | โฟลเดอร์ | URL | ผู้รับผิดชอบ |
|---|---|---|---|
| ต้อนรับ | `pages/Welcome` | `/welcome` และ `/` บนมือถือ | |
| ภาพรวมผู้ใช้ | `pages/Dashboard` | `/dashboard` | |
| แผนที่ | `pages/LiveMap` | `/live-map` | |
| รายการจุดเสี่ยง | `pages/RiskCases` | `/risk-cases` | |
| วิดีโอของฉัน | `pages/MyVideos` | `/my-videos` | |
| เข้าสู่ระบบ | `pages/Login` | `/login` และปลายทางของ `/` บน PC | |
| สมัครบัญชี | `pages/Register` | `/register` | |
| ตั้งรหัสผ่านใหม่ | `pages/ResetPassword` | `/reset-password` | |
| ผู้ดูแลระบบ | `pages/AdminDashboard` | `/admin` | |
| ผู้ดูแลระบบสูงสุด | `pages/SuperadminDashboard` | `/superadmin` | |

URL ที่ไม่ได้ลงทะเบียนจะกลับไปที่ `/`

## ไฟล์ที่ใช้ร่วมกัน

แจ้งทีมเมื่อแก้ไฟล์ที่มีผลกับหลายหน้า

| งาน | เริ่มจากไฟล์ |
|---|---|
| URL ของหน้า สิทธิ์การเข้าถึง และเมนูหลัก | [routes/index.jsx](frontend/src/routes/index.jsx) |
| เมนูด้านซ้ายและรายการเมนูของแต่ละบทบาท | [DashboardSidebar.jsx](frontend/src/components/layout/dashboard/DashboardSidebar.jsx) |
| หัวข้อหน้า ช่องค้นหา และเมนูบัญชี | [DashboardTopBar.jsx](frontend/src/components/layout/dashboard/DashboardTopBar.jsx) |
| โครงหน้าปฏิบัติงานของ User, Admin และ Super Admin | [DashboardLayout.jsx](frontend/src/components/layout/dashboard/DashboardLayout.jsx) และ [dashboard-layout.css](frontend/src/components/layout/dashboard/dashboard-layout.css) |
| แผนที่ หมุด และรายละเอียดจุดเสี่ยง | [components/risk-cases/](frontend/src/components/risk-cases/) |
| การโหลดข้อมูลสำรวจ | [hooks/useSurvey.js](frontend/src/hooks/useSurvey.js) |
| สีและสไตล์พื้นฐานของเว็บ | [styles/global.css](frontend/src/styles/global.css) |
| เส้นทาง API | [backend/internal/routes/routes.go](backend/internal/routes/routes.go) |

## เพิ่มหน้าใหม่

1. สร้าง `pages/<ชื่อหน้า>/<ชื่อหน้า>Page.jsx` และให้ `index.js` ในโฟลเดอร์นั้น export ตัวหน้า
2. ลงทะเบียน URL และคอมโพเนนต์หน้าใน `frontend/src/routes/index.jsx` เลือก Layout และสิทธิ์ให้เหมาะกับหน้า
3. เก็บ CSS และส่วนย่อยเฉพาะหน้าไว้กับหน้า เช่น `pages/MyVideos/components/VideoUpload.jsx`
4. ส่วนที่หลายหน้าใช้ให้ import จาก `src/components/` เช่น Layout ของหน้าปฏิบัติงานจาก `components/layout/dashboard/` และแผนที่หรือรายละเอียดเคสจาก `components/risk-cases/` ส่วนการโหลดข้อมูลสำรวจใช้ `hooks/useSurvey.js`

## หน้าผู้ใช้

- หน้าภาพรวม (`/dashboard`) และหน้ารายการจุดเสี่ยง (`/risk-cases`) ลงทะเบียนคนละเส้นทางใน Router หลัก แต่ละหน้าเรียก `DashboardLayout` โดยตรงและเก็บคำค้นของตัวเอง ช่องค้นหาจะเริ่มว่างเมื่อสลับหน้า
- ใช้ `<Link to="/risk-cases">` จาก `@/routes/router` เมื่อต้องการเปิดหน้ารายการจุดเสี่ยง ปุ่ม **ดูรายการทั้งหมด** และเมนูด้านซ้ายใช้เส้นทางนี้
- ปุ่มอัปโหลดอยู่ในหน้า **วิดีโอของฉัน** โค้ดหน้าต่างอัปโหลดอยู่ที่ [VideoUpload.jsx](frontend/src/pages/MyVideos/components/VideoUpload.jsx)

## เพิ่ม API (backend Go)

1. รูปแบบข้อมูลใหม่ เพิ่มใน `backend/internal/entities`
2. logic เขียนใน `internal/services/<เรื่อง>.go`
3. controller เขียนใน `internal/controllers/<เรื่อง>.go`
4. เพิ่ม 1 บรรทัดใน `internal/routes/routes.go`
5. รัน `go fmt ./...` และ `go build ./...` ก่อน commit

## Git

- อย่า commit ตรงเข้า `main` ให้แตกกิ่งใหม่ทุกครั้ง
- ตั้งชื่อกิ่ง: `feature/<หน้าหรือเรื่อง>` เช่น `feature/live-map`, แก้บั๊กใช้ `fix/<เรื่อง>`
- ข้อความ commit สั้นๆ บอกว่าทำอะไร เช่น `live-map: add route layer`
- เปิด Pull Request ให้เพื่อนอีก 1 คนดูก่อน merge
- ก่อนเริ่มงานทุกวัน `git pull` จาก `main` ก่อน

## import

ใช้ `@/` แทนการไล่ `../../` เช่น `import DashboardLayout from '@/components/layout/dashboard/DashboardLayout'`
