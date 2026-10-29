// กรอบชั่วคราวสำหรับหน้าที่ยังไม่ได้พัฒนา ลบออกเมื่อหน้านั้นมีเนื้อหาจริง
export default function PagePlaceholder({ title, description }) {
  return (
    <section className="placeholder">
      <h1>{title}</h1>
      <p>{description}</p>
      <p className="placeholder-note">หน้านี้อยู่ระหว่างพัฒนา</p>
    </section>
  )
}
