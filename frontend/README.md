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
│  └─ App.jsx      เลือกหน้าที่จะแสดงตาม URL
├─ routes/
│  ├─ index.jsx    รายการหน้าทั้งหมดและเมนู (เพิ่มหน้าใหม่ที่นี่)
│  └─ router.jsx   ตัวเปลี่ยนหน้าแบบ #/path และ <Link>
├─ pages/          1 โฟลเดอร์ = 1 หน้า
│  ├─ Home/        HomePage.jsx + components/Hero.jsx
│  ├─ LiveMap/
│  ├─ RiskReports/
│  ├─ HowItWorks/
│  ├─ Login/
│  └─ NotFound/
├─ components/     ส่วนประกอบที่ใช้หลายหน้า
│  ├─ layout/      Layout.jsx, Navbar.jsx
│  └─ ui/          ปุ่ม การ์ด ฯลฯ (ตอนนี้มี PagePlaceholder)
├─ services/       api.js จุดเดียวที่เรียก backend
├─ hooks/          custom hooks ที่ใช้ร่วมกัน
├─ utils/          ฟังก์ชันช่วยทั่วไป
├─ assets/         รูปและไอคอน
└─ styles/         global.css สีหลัก #74045F, #C7911B
public/            ไฟล์ที่ใช้ตรงๆ เช่น favicon.png
```

หน้าที่ยังไม่มีเนื้อหาแสดง `PagePlaceholder` ไว้ก่อน ลบออกเมื่อเริ่มทำหน้านั้น

## เชื่อม backend

- ตอนพัฒนา คำขอ `/api/...` ถูกส่งต่อไปที่ backend Go `http://localhost:8000` (แก้พอร์ตใน `vite.config.js`)
- ตอนใช้งานจริง ตั้ง `VITE_API_URL` ในไฟล์ `.env` (คัดลอกจาก `.env.example`)
- เรียก API ผ่าน `apiGet` / `apiPost` ใน `src/services/api.js`

## เปลี่ยนหน้า

ใช้ `<Link to="/live-map">` จาก `@/routes/router` แทน `<a href>`
router นี้เขียนเองแบบเล็กเพราะติดตั้งแพ็กเกจเพิ่มไม่ได้ในตอนตั้งโปรเจกต์
ถ้าทีมอยากใช้ react-router-dom ภายหลัง แก้เฉพาะ `src/routes/router.jsx` และ `src/app/App.jsx`

ฟอนต์: Inter (อังกฤษ) + Noto Sans Thai (ไทย)
