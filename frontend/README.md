# Frontend (React + Vite)

## รัน

```bash
npm install
npm run dev      # เปิดเว็บสำหรับพัฒนา http://localhost:5173
npm run build    # สร้างไฟล์เว็บใน dist/ สำหรับเสิร์ฟผ่าน HTTP
```

## โครงสร้าง

```
src/
├─ main.jsx        จุดเริ่มของแอป
├─ app/
│  └─ App.jsx      ตั้ง <Routes> จากรายการใน routes/index.jsx
├─ routes/
│  ├─ index.jsx    รายการหน้าทั้งหมดและเมนู (เพิ่มหน้าใหม่ที่นี่)
│  └─ router.jsx   ตัวห่อ react-router-dom (BrowserRouter, Link, usePath)
├─ pages/          1 โฟลเดอร์ = 1 หน้า
│  ├─ Home/        HomePage.jsx + components/Hero.jsx
│  ├─ Dashboard/   ภาพรวมและส่วนย่อยใน components/
│  ├─ RiskCases/   รายการจุดเสี่ยง (/risk-cases)
│  ├─ MyVideos/    รายการวิดีโอและ components/VideoUpload.jsx
│  ├─ LiveMap/
│  ├─ RiskReports/
│  ├─ HowItWorks/
│  ├─ Welcome/     หน้าต้อนรับ (/welcome)
│  ├─ Login/
│  ├─ ResetPassword/
│  └─ NotFound/
├─ components/     ส่วนประกอบที่ใช้หลายหน้า
│  ├─ layout/      Layout.jsx, Navbar.jsx และแถบผู้ใช้ใน user/
│  ├─ risk-cases/  แผนที่ สัญลักษณ์ และรายละเอียดเคสที่ใช้ข้ามหน้า
│  └─ ui/          PagePlaceholder, AuthShell, TextField (ฟอร์ม)
├─ services/       api.js จุดเดียวที่เรียก backend
├─ hooks/          custom hooks ที่ใช้ร่วมกัน
├─ utils/          ฟังก์ชันช่วยทั่วไป
├─ assets/         รูปและไอคอน
└─ styles/         global.css สีหลัก #74045F, #C7911B
public/            ไฟล์ที่ใช้ตรงๆ เช่น favicon.png
```

ดูรายการโฟลเดอร์ของทุกหน้าและ URL ใน [คู่มือทีม](../CONTRIBUTING.md)

หน้าแรก `/` บนมือถือ (กว้างไม่เกิน 760px) แสดงหน้า Welcome แทน Hero ผ่าน `phoneElement` ใน routes

route ที่ใส่ `bare: true` จะแสดงเต็มจอโดยไม่มี Navbar

หน้าที่ยังไม่มีเนื้อหาแสดง `PagePlaceholder` ไว้ก่อน ลบออกเมื่อเริ่มทำหน้านั้น

## เชื่อม backend

- ตอนพัฒนา คำขอ `/api/...` ถูกส่งต่อไปที่ backend Go `http://localhost:8000` (แก้พอร์ตใน `vite.config.js`)
- เวลาให้ Go เสิร์ฟเว็บด้วย `FRONTEND_DIR` ให้เว้น `VITE_API_URL` เพื่อเรียก `/api` บน origin เดียวกัน หากแยกโฮสต์ให้ตั้ง `VITE_API_URL` เป็น URL ของ API รวม `/api` ก่อน build และตั้ง `ALLOWED_ORIGIN` ฝั่ง Go ให้ตรงกับ origin ของเว็บ
- เรียก API ผ่าน `apiGet` / `apiPost` ใน `src/services/api.js`

## เปลี่ยนหน้า

ใช้ `<Link to="/live-map">` จาก `@/routes/router` แทน `<a href>`
โปรเจกต์ใช้ BrowserRouter สำหรับ URL เช่น `/live-map` และ build สำหรับรากโดเมน หากแยกไปใช้ static host ให้ตั้งค่าเสิร์ฟไฟล์ static ตามพาธจริง แล้วส่ง `index.html` เมื่อเปิดเส้นทางของ React โดยตรง ให้แยก `/api` และไฟล์ static ที่หาไม่พบออกจาก fallback นี้

ฟอนต์: Inter (อังกฤษ) + Noto Sans Thai (ไทย)
