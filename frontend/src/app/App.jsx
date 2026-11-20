import Layout from '@/components/layout/Layout'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import useMediaQuery from '@/hooks/useMediaQuery'
import NotFoundPage from '@/pages/NotFound'
import { routes } from '@/routes'
import { Route, Router, Routes, ScrollToTop } from '@/routes/router'

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
      {routes.map((r) => {
        // หน้าที่มี phoneElement จะแสดงแบบนั้นแทนบนมือถือ (เต็มจอ ไม่มี Navbar)
        const onPhone = isPhone && r.phoneElement
        const element = onPhone ? r.phoneElement : r.element
        // หน้า bare (Welcome / Log In / Reset Password) แสดงเต็มจอ ไม่มี Navbar
        const bare = r.bare || onPhone
        return (
          <Route
            key={r.path}
            path={r.path}
            element={bare ? element : <Layout>{element}</Layout>}
          />
        )
      })}
      <Route
        path="*"
        element={
          <Layout>
            <NotFoundPage />
          </Layout>
        }
      />
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
