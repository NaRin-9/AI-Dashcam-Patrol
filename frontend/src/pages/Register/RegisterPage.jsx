import { useState } from 'react'
import AuthShell from '@/components/ui/AuthShell'
import TextField, { PasswordField } from '@/components/ui/TextField'
import { Link, useNavigate } from '@/routes/router'
import { useAuth } from '@/contexts/AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [values, setValues] = useState({ username: '', email: '', password: '', confirmPassword: '' })
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
    if (values.username.trim().length < 3) next.username = 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร'
    if (!values.email.trim()) next.email = 'กรุณากรอกอีเมล'
    if (!values.password) next.password = 'กรุณากรอกรหัสผ่าน'
    if (values.password.length < 8) next.password = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'
    if (values.password !== values.confirmPassword) next.confirmPassword = 'รหัสผ่านไม่ตรงกัน'

    setErrors(next)
    if (Object.keys(next).length) return

    try {
      setLoading(true)
      setApiError('')
      await register({
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
      })

      // ลงทะเบียนแล้วพาไป dashboard
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setApiError(err.message || 'ลงทะเบียนไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Register">
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
        <TextField
          id="email"
          label="Email"
          placeholder="e.g. name@example.com"
          autoComplete="email"
          type="email"
          value={values.email}
          onChange={onChange}
          error={errors.email}
        />
        <PasswordField
          id="password"
          label="Password"
          placeholder="อย่างน้อย 8 ตัวอักษร"
          autoComplete="new-password"
          value={values.password}
          onChange={onChange}
          error={errors.password}
        />
        <PasswordField
          id="confirmPassword"
          label="Confirm Password"
          placeholder="ยืนยันรหัสผ่าน"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={onChange}
          error={errors.confirmPassword}
        />
        <button type="submit" className="btn btn-gold auth-btn" disabled={loading}>
          {loading ? 'กำลังลงทะเบียน...' : 'Register'}
        </button>
        <div style={{ marginTop: '12px' }}>
          <Link className="auth-link" to="/login">
            Already have an account? Log In
          </Link>
        </div>
      </form>
    </AuthShell>
  )
}
