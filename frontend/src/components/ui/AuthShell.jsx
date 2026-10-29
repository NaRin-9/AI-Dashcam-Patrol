import logo from '@/assets/pea-logo.png'

// กรอบหน้าฟอร์มแบบเต็มจอ (Log In / Reset Password)
// มือถือ: แผ่นสีบานเย็นเต็มจอ มีแผ่นซ้อนด้านบน | PC: การ์ดอยู่กลางจอ
export default function AuthShell({ title, children }) {
  return (
    <main className="auth">
      <div className="auth-stack">
        <section className="auth-sheet" aria-labelledby="auth-title">
          <img className="auth-logo" src={logo} alt="การไฟฟ้าส่วนภูมิภาค" />
          <h1 id="auth-title" className="auth-title">
            {title}
          </h1>
          {children}
        </section>
      </div>
    </main>
  )
}
