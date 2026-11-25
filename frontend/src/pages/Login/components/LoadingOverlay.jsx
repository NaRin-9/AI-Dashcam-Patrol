import logo from '@/assets/pea-logo.png'

export default function LoadingOverlay({
  title = 'กำลังเข้าสู่ระบบ...',
  subtitle = 'โปรดรอสักครู่ ระบบกำลังตรวจสอบข้อมูลความปลอดภัย',
  status = 'loading', // 'loading' | 'success'
}) {
  return (
    <div className="auth-loading-overlay" role="dialog" aria-modal="true" aria-live="assertive">
      <div className="auth-loading-card">
        <img className="auth-loading-logo" src={logo} alt="การไฟฟ้าส่วนภูมิภาค" />

        {status === 'loading' ? (
          <div className="auth-loading-spinner-wrapper" aria-hidden="true">
            <div className="auth-loading-spinner" />
            <div className="auth-loading-spinner-inner" />
          </div>
        ) : (
          <div className="auth-loading-success-wrapper" aria-hidden="true">
            <div className="auth-loading-success-icon">✓</div>
          </div>
        )}

        <h2 className="auth-loading-title">{title}</h2>
        <p className="auth-loading-desc">{subtitle}</p>
      </div>
    </div>
  )
}
