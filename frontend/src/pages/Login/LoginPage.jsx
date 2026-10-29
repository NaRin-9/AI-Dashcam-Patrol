import { useState } from 'react'
import AuthShell from '@/components/ui/AuthShell'
import TextField, { PasswordField } from '@/components/ui/TextField'
import { Link } from '@/routes/router'

export default function LoginPage() {
  const [values, setValues] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState({})

  const onChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }))

  const onSubmit = (e) => {
    e.preventDefault()
    const next = {}
    if (!values.username.trim()) next.username = 'กรุณากรอกชื่อผู้ใช้'
    if (!values.password) next.password = 'กรุณากรอกรหัสผ่าน'
    setErrors(next)
    if (Object.keys(next).length) return

    // TODO: เชื่อม backend เมื่อ API พร้อม เช่น
    // apiPost('/auth/login', { username: values.username.trim(), password: values.password })
  }

  return (
    <AuthShell title="Log In">
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
        <PasswordField
          id="password"
          label="Password"
          placeholder="password"
          autoComplete="current-password"
          value={values.password}
          onChange={onChange}
          error={errors.password}
        />
        <button type="submit" className="btn btn-gold auth-btn">
          Log In
        </button>
        <Link className="auth-link" to="/reset-password">
          Forgot Password
        </Link>
      </form>
    </AuthShell>
  )
}
