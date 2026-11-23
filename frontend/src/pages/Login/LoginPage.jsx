import { useState, useEffect } from 'react'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { Link } from '@/routes/router'
import { useAuth } from '@/contexts/AuthContext'
import logo from '@/assets/pea-logo.png'
import phone from '@/assets/phone.svg'

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth()
  const [values, setValues] = useState({ username: '', password: '' })
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [lang, setLang] = useState('TH')
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loginStatus, setLoginStatus] = useState('loading') // 'loading' | 'success'

  // Role-based redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'superadmin') {
        window.location.hash = '#/superadmin'
      } else if (user.role === 'admin') {
        window.location.hash = '#/admin'
      } else {
        window.location.hash = '#/dashboard'
      }
    }
  }, [isAuthenticated, user])

  const onChange = (e) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }))
    setApiError('')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (loading) return

    const next = {}
    if (!values.username.trim()) next.username = lang === 'TH' ? 'กรุณากรอกรหัสพนักงานหรือชื่อผู้ใช้งาน' : 'Please enter employee ID or username'
    if (!values.password) next.password = lang === 'TH' ? 'กรุณากรอกรหัสผ่าน' : 'Please enter password'
    setErrors(next)
    if (Object.keys(next).length) return

    try {
      setLoading(true)
      setLoginStatus('loading')
      setApiError('')

      const [data] = await Promise.all([
        login({
          username: values.username.trim(),
          password: values.password,
        }),
        new Promise((resolve) => setTimeout(resolve, 600)),
      ])

      setLoginStatus('success')
      await new Promise((resolve) => setTimeout(resolve, 400))

      const role = data?.user?.role
      if (role === 'superadmin') {
        window.location.hash = '#/superadmin'
      } else if (role === 'admin') {
        window.location.hash = '#/admin'
      } else {
        window.location.hash = '#/dashboard'
      }
    } catch (err) {
      setApiError(err.message || (lang === 'TH' ? 'รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง' : 'Invalid credentials'))
      setLoading(false)
      setLoginStatus('loading')
    }
  }

  const isTH = lang === 'TH'

  return (
    <div className="login-split-page">
      {loading && (
        <LoadingOverlay
          title={loginStatus === 'success' ? 'เข้าสู่ระบบสำเร็จ' : 'กำลังเข้าสู่ระบบ...'}
          subtitle={
            loginStatus === 'success'
              ? 'ระบบกำลังพาคุณไปยังหน้าแดชบอร์ด...'
              : 'โปรดรอสักครู่ ระบบกำลังตรวจสอบข้อมูลความปลอดภัย'
          }
          status={loginStatus}
        />
      )}

      {/* ================= ฝั่งซ้าย: Clean White Center Login Form ================= */}
      <main className="login-clean-left" aria-label="เข้าสู่ระบบ">
        <div className="login-clean-center-box">
          {/* Top Bar: Security Badge + Language Switch */}
          <div className="login-clean-topbar">
            {/* <div className="login-clean-sec-pill">
              <span className="clean-sec-dot" />
              <span>{isTH ? 'การเชื่อมต่อปลอดภัย (PEA Official Portal)' : 'Secure Connection (PEA Official Portal)'}</span>
            </div> */}

            <button
              type="button"
              className="login-clean-lang-btn"
              onClick={() => setLang(isTH ? 'EN' : 'TH')}
              aria-label="เปลี่ยนภาษา"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="clean-globe-icon">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>{lang} / {isTH ? 'EN' : 'TH'}</span>
            </button>
          </div>

          {/* Brand Header */}
          <div className="login-clean-brand">
            <div className="login-clean-emblem">
              <img src={logo} alt="การไฟฟ้าส่วนภูมิภาค" className="clean-emblem-img" />
            </div>
            <div className="login-clean-brand-info">
              {/* <span className="login-clean-tag">PEA FLEET & GIS</span> */}
              <h1 className="login-clean-org">
                {isTH ? 'การไฟฟ้าส่วนภูมิภาค' : 'Provincial Electricity Authority'}
              </h1>
              <p className="login-clean-sub">
                {isTH ? 'ระบบบริหารจัดการยานพาหนะและติดตามพิกัดภาคสนาม' : 'Fleet Management & Field GIS Tracking System'}
              </p>
            </div>
          </div>

          {/* Welcome Heading */}
          <div className="login-clean-heading">
            <h2 className="login-clean-title">{isTH ? 'เข้าสู่ระบบ' : 'Log in'}</h2>
            <p className="login-clean-desc">
              {isTH ? 'กรุณากรอกรหัสพนักงานและรหัสผ่านเพื่อเข้าใช้งานระบบ' : 'Please enter your employee ID and password to sign in'}
            </p>
          </div>

          {/* API Error Banner */}
          {apiError && (
            <div className="login-clean-error-banner" role="alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="clean-err-icon">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{apiError}</span>
            </div>
          )}

          {/* Form */}
          <form className="login-clean-form" onSubmit={onSubmit} noValidate>
            {/* Username Field */}
            <div className="login-clean-field">
              <label htmlFor="username">
                {isTH ? 'รหัสพนักงาน / ชื่อผู้ใช้งาน (Username)' : 'Employee ID / Username'}
              </label>
              <div className={`login-clean-input-box ${errors.username ? 'has-error' : ''}`}>
                <span className="clean-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder={isTH ? 'เช่น 501234 หรือ firstname.l' : 'e.g. 501234 or firstname.l'}
                  autoComplete="username"
                  value={values.username}
                  onChange={onChange}
                  disabled={loading}
                />
              </div>
              {errors.username && <p className="login-clean-field-error">{errors.username}</p>}
            </div>

            {/* Password Field */}
            <div className="login-clean-field">
              <label htmlFor="password">
                {isTH ? 'รหัสผ่าน (Password)' : 'Password'}
              </label>
              <div className={`login-clean-input-box ${errors.password ? 'has-error' : ''}`}>
                <span className="clean-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  value={values.password}
                  onChange={onChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="clean-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="login-clean-field-error">{errors.password}</p>}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="login-clean-meta">
              <label className="login-clean-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>{isTH ? 'จดจำการเข้าสู่ระบบ' : 'Remember me'}</span>
              </label>

              <Link to="/reset-password" className="login-clean-forgot">
                {isTH ? 'ลืมรหัสผ่าน?' : 'Forgot Password?'}
              </Link>
            </div>

            {/* Submit Button */}
            <button type="submit" className="login-clean-submit-btn" disabled={loading}>
              <span>{loading ? (isTH ? 'กำลังเข้าสู่ระบบ...' : 'Signing in...') : (isTH ? 'เข้าสู่ระบบ (Log in)' : 'Log in')}</span>
              {!loading && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="clean-btn-arrow">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* ================= ฝั่งขวา: Purple World Map Background with Phone Mockup ================= */}
      <aside className="login-clean-right" aria-hidden="true">
        <img
          src={phone}
          alt="AI Dashcam Patrol Map Navigation"
          className="login-clean-phone-img"
          draggable="false"
        />
      </aside>
    </div>
  )
}
