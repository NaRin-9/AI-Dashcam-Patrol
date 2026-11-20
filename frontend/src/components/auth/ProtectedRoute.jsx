import { useAuth } from '@/contexts/AuthContext'
import { Link, Navigate } from '@/routes/router'

// แสดง children เฉพาะเมื่อ user ล็อกอินแล้วและมี role ที่กำหนด
// ถ้าไม่ระบุ roles จะตรวจแค่ว่าล็อกอินแล้วหรือยัง
export default function ProtectedRoute({ roles, children }) {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) return <LoadingSpinner />

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <AccessDenied />
  }

  return children
}

function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
    }}>
      <div style={{
        width: 48,
        height: 48,
        border: '4px solid rgba(255,255,255,0.2)',
        borderTopColor: 'var(--gold)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

function AccessDenied() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      color: 'var(--white)',
      textAlign: 'center',
      padding: '24px',
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: 12 }}>🚫 Access Denied</h1>
      <p style={{ opacity: 0.85, marginBottom: 24 }}>
        คุณไม่มีสิทธิ์เข้าถึงหน้านี้
      </p>
      <Link
        to="/dashboard"
        style={{
          padding: '10px 24px',
          background: 'var(--gold)',
          color: 'var(--white)',
          borderRadius: 8,
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        กลับไปหน้า Dashboard
      </Link>
    </div>
  )
}
