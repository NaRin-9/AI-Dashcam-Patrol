import Navbar from './Navbar'

// โครงหน้าที่ทุกหน้าใช้ร่วมกัน (เมนูด้านบน + เนื้อหา)
export default function Layout({ children }) {
  return (
    <div className="page">
      <Navbar />
      <main>{children}</main>
    </div>
  )
}
