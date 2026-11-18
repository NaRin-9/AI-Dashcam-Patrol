# Frontend (React + Vite)

## รัน

```bash
npm install
npm run dev      # เปิดเว็บสำหรับพัฒนา http://localhost:5173
npm run build    # สร้างไฟล์เว็บใน dist/ (เปิด dist/index.html ได้ตรงๆ)
```

## โครงสร้าง

```
src/
├─ main.jsx        จุดเริ่มของแอป
├─ app/
│  └─ App.jsx      ตั้ง <Routes> จากรายการใน routes/index.jsx
├─ routes/
│  ├─ index.jsx    รายการหน้าทั้งหมดและเมนู (เพิ่มหน้าใหม่ที่นี่)
│  └─ router.jsx   ตัวห่อ react-router-dom (HashRouter, Link, usePath)
├─ pages/          1 โฟลเดอร์ = 1 หน้า
│  ├─ Home/        HomePage.jsx + components/Hero.jsx
│  ├─ LiveMap/
│  ├─ RiskReports/
│  ├─ HowItWorks/
│  ├─ Welcome/     หน้าต้อนรับ (/welcome)
│  ├─ Login/
│  ├─ ResetPassword/
│  └─ NotFound/
├─ components/     ส่วนประกอบที่ใช้หลายหน้า
│  ├─ layout/      Layout.jsx, Navbar.jsx
│  └─ ui/          PagePlaceholder, AuthShell, TextField (ฟอร์ม)
├─ services/       api.js จุดเดียวที่เรียก backend
├─ hooks/          custom hooks ที่ใช้ร่วมกัน
├─ utils/          ฟังก์ชันช่วยทั่วไป
├─ assets/         รูปและไอคอน
└─ styles/         global.css สีหลัก #74045F, #C7911B
public/            ไฟล์ที่ใช้ตรงๆ เช่น favicon.png
```

หน้าแรก `/` บนมือถือ (กว้างไม่เกิน 760px) แสดงหน้า Welcome แทน Hero ผ่าน `phoneElement` ใน routes

route ที่ใส่ `bare: true` จะแสดงเต็มจอโดยไม่มี Navbar

หน้าที่ยังไม่มีเนื้อหาแสดง `PagePlaceholder` ไว้ก่อน ลบออกเมื่อเริ่มทำหน้านั้น

## เชื่อม backend

- ตอนพัฒนา คำขอ `/api/...` ถูกส่งต่อไปที่ backend Go `http://localhost:8000` (แก้พอร์ตใน `vite.config.js`)
- ตอนใช้งานจริง ตั้ง `VITE_API_URL` ในไฟล์ `.env` (คัดลอกจาก `.env.example`)
- เรียก API ผ่าน `apiGet` / `apiPost` ใน `src/services/api.js`

## เปลี่ยนหน้า

ใช้ `<Link to="/live-map">` จาก `@/routes/router` แทน `<a href>`
โปรเจกต์ใช้ react-router-dom แบบ HashRouter (URL เป็น `#/live-map`) เพื่อให้เปิดไฟล์ใน `dist/` ได้ตรงๆ
ถ้าภายหลังมีเซิร์ฟเวอร์รองรับ เปลี่ยนเป็น BrowserRouter ได้ที่ `src/routes/router.jsx` ที่เดียว

ฟอนต์: Inter (อังกฤษ) + Noto Sans Thai (ไทย)
