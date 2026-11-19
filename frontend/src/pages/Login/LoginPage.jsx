import { useState } from 'react'
import AuthShell from '@/components/ui/AuthShell'
import TextField, { PasswordField } from '@/components/ui/TextField'
import { Link } from '@/routes/router'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const [values, setValues] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const onChange = (e) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }))
    setApiError('')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!values.username.trim()) next.username = 'กรุณากรอกชื่อผู้ใช้'
    if (!values.password) next.password = 'กรุณากรอกรหัสผ่าน'
    setErrors(next)
    if (Object.keys(next).length) return

    try {
      setLoading(true)
      setApiError('')
      const data = await login({
        username: values.username.trim(),
        password: values.password,
      })

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
    } finally {
      setLoading(false)
    }
  }

  return (
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
        />
        <PasswordField
          id="password"
          label="Password"
          placeholder="password"
          autoComplete="current-password"
          value={values.password}
          onChange={onChange}
          error={errors.password}
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
  )
}
