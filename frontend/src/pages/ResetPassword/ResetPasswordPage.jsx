import { useState } from 'react'
import AuthShell from '@/components/ui/AuthShell'
import TextField, { PasswordField } from '@/components/ui/TextField'
import { Link } from '@/routes/router'

const MIN_PASSWORD = 8

export default function ResetPasswordPage() {
  const [values, setValues] = useState({ username: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})

  const onChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }))

  const onSubmit = (e) => {
    e.preventDefault()
    const next = {}
    if (!values.username.trim()) next.username = 'กรุณากรอกชื่อผู้ใช้'
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) next.email = 'อีเมลไม่ถูกต้อง'
    if (values.password.length < MIN_PASSWORD) next.password = `รหัสผ่านต้องมีอย่างน้อย ${MIN_PASSWORD} ตัวอักษร`
    if (values.confirm !== values.password) next.confirm = 'รหัสผ่านไม่ตรงกัน'
    setErrors(next)
    if (Object.keys(next).length) return

    // TODO: เชื่อม backend เมื่อ API พร้อม เช่น
    // apiPost('/auth/reset-password', { username, email, password })
  }

  return (
    <AuthShell title="Reset Password">
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <TextField
          id="username"
          label="Username"
          placeholder="e.g. supanat.tang"
          autoComplete="username"
          value={values.username}
          onChange={onChange}
          error={errors.username}
        />
        <TextField
          id="email"
          type="email"
          label="Email"
          placeholder="name@example.com"
          autoComplete="email"
          value={values.email}
          onChange={onChange}
          error={errors.email}
        />
        <PasswordField
          id="password"
          label="New Password"
          placeholder="new password"
          autoComplete="new-password"
          value={values.password}
          onChange={onChange}
          error={errors.password}
        />
        <PasswordField
          id="confirm"
          label="Confirm New Password"
          placeholder="confirm new password"
          autoComplete="new-password"
          value={values.confirm}
          onChange={onChange}
          error={errors.confirm}
        />
        <button type="submit" className="btn btn-gold auth-btn">
          Reset Password
        </button>
        <Link className="auth-link" to="/login">
          Back to Log In
        </Link>
      </form>
    </AuthShell>
  )
}
