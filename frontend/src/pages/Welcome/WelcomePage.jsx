import logo from '@/assets/pea-logo.png'
import phone from '@/assets/phone.svg'
import { Link } from '@/routes/router'

// หน้าต้อนรับ (ก่อนเข้าสู่ระบบ) มือถือเรียงบนลงล่าง | PC แบ่งสองคอลัมน์
export default function WelcomePage() {
  return (
    <main className="welcome">
      <header className="welcome-head">
        <div>
          <h1 className="welcome-title">Dashcam Patrol</h1>
          <p className="welcome-sub">รู้ทุกพิกัดเสี่ยง จัดการก่อนเกิดเหตุ</p>
        </div>
        <img className="welcome-logo" src={logo} alt="การไฟฟ้าส่วนภูมิภาค" />
      </header>

      <div className="welcome-art">
        <img
          src={phone}
          alt="แอปบนมือถือแสดงเส้นทางรถปฏิบัติการและจุดเสี่ยงที่ตรวจพบบนแผนที่"
          draggable="false"
        />
      </div>

      <div className="welcome-cta">
        <Link className="btn btn-gold welcome-btn" to="/login">
          เริ่มต้นใช้งาน
        </Link>
      </div>
    </main>
  )
}
