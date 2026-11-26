import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import useMediaQuery from '@/hooks/useMediaQuery'
import { routes } from '@/routes'
import { Navigate, Route, Router, Routes, ScrollToTop } from '@/routes/router'

function AppRoutes() {
  const isPhone = useMediaQuery('(max-width: 760px)')
  const { loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'var(--purple)',
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

  return (
    <Routes>
      {routes.map(({ path, element, phoneElement }) => (
        <Route key={path} path={path} element={isPhone && phoneElement ? phoneElement : element} />
      ))}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}
