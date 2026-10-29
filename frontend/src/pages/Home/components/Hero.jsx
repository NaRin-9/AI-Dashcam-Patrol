import { useState } from 'react'
import phone from '@/assets/phone.svg'
import { Link } from '@/routes/router'

export default function Hero() {
  // Hover slides the phone out on desktop; tap/click/keyboard toggles it
  // so it also works on touch screens.
  const [out, setOut] = useState(false)

  return (
    <section className="hero">
      <div className="hero-copy">
        <h1>
          <span>เปลี่ยนทุกเส้นทางของรถปฏิบัติการ</span>{' '}
          <span>ให้เป็นข้อมูลเฝ้าระวังต้นไม้ใกล้แนวสายไฟ</span>
        </h1>
        <p className="lede">
          <span>ด้วยเทคโนโลยี AI ที่ช่วยตรวจจับจุดเสี่ยง ระบุตำแหน่ง</span>{' '}
          <span>GPS และสนับสนุนการวางแผนบำรุงรักษาระบบ</span>{' '}
          <span>จำหน่ายไฟฟ้าอย่างมีประสิทธิภาพ</span>
        </p>
        <Link className="btn btn-gold btn-lg" to="/live-map">
          Get Started
        </Link>
      </div>

      <div className="phone-dock">
        <button
          type="button"
          className={`phone-slide ${out ? 'is-out' : ''}`}
          aria-pressed={out}
          aria-label={out ? 'เก็บภาพแผนที่' : 'ดูภาพแผนที่เต็ม'}
          onClick={() => setOut((v) => !v)}
          onMouseLeave={() => setOut(false)}
        >
          <img
            src={phone}
            alt="แอปบนมือถือแสดงเส้นทางรถปฏิบัติการและจุดเสี่ยงที่ AI ตรวจพบบนแผนที่"
            draggable="false"
          />
        </button>
      </div>
    </section>
  )
}
