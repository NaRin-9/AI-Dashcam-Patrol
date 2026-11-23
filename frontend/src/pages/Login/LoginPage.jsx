import { useState, useEffect } from 'react'
import AuthShell from '@/components/ui/AuthShell'
import TextField, { PasswordField } from '@/components/ui/TextField'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { Link } from '@/routes/router'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth()
  const [values, setValues] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loginStatus, setLoginStatus] = useState('loading') // 'loading' | 'success'

  // หากล็อกอินอยู่แล้ว นำทางไปยังหน้าที่เหมาะสม
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
    if (!values.username.trim()) next.username = 'กรุณากรอกชื่อผู้ใช้'
    if (!values.password) next.password = 'กรุณากรอกรหัสผ่าน'
    setErrors(next)
    if (Object.keys(next).length) return

    try {
      setLoading(true)
      setLoginStatus('loading')
      setApiError('')

      // เรียก API login พร้อมหน่วงเวลาขั้นต่ำเล็กน้อยเพื่อให้หน้า loading แสดงผลอย่างนุ่มนวล
      const [data] = await Promise.all([
        login({
          username: values.username.trim(),
          password: values.password,
        }),
        new Promise((resolve) => setTimeout(resolve, 600)),
      ])

      // เข้าสู่ระบบสำเร็จ แสดงสถานะ success ก่อนเปลี่ยนหน้า
      setLoginStatus('success')
      await new Promise((resolve) => setTimeout(resolve, 400))

      // เปลี่ยนเส้นทางตามบทบาท (Role-based redirect)
      const role = data?.user?.role
      if (role === 'superadmin') {
        window.location.hash = '#/superadmin'
      } else if (role === 'admin') {
        window.location.hash = '#/admin'
      } else {
        window.location.hash = '#/dashboard'
      }
    } catch (err) {
      setApiError(err.message || 'เข้าสู่ระบบไม่สำเร็จ')
      setLoading(false)
      setLoginStatus('loading')
    }
  }

  return (
    <>
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
      <AuthShell title="Log In">
        <form className="auth-form" onSubmit={onSubmit} noValidate>
          {apiError && (
            <div style={{
              width: '100%',
              padding: '8px 12px',
              marginBottom: '16px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 0, 0, 0.25)',
              color: '#fff',
              fontSize: '0.875rem',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              {apiError}
            </div>
          )}
          <TextField
            id="username"
            label="Username"
            placeholder="Username"
            autoComplete="username"
            value={values.username}
            onChange={onChange}
            error={errors.username}
            disabled={loading}
          />
          <PasswordField
            id="password"
            label="Password"
            placeholder="password"
            autoComplete="current-password"
            value={values.password}
            onChange={onChange}
            error={errors.password}
            disabled={loading}
          />
          <button type="submit" className="btn btn-gold auth-btn" disabled={loading}>
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'Log In'}
          </button>
          <div style={{ marginTop: '12px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Link className="auth-link" to="/register">
              Register
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>|</span>
            <Link className="auth-link" to="/reset-password">
              Forgot Password
            </Link>
          </div>
        </form>
      </AuthShell>
    </>
  )
}
