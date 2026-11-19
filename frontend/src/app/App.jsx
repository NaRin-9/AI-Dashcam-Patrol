import Layout from '@/components/layout/Layout'
import NotFoundPage from '@/pages/NotFound'
import { routes } from '@/routes'
import { usePath } from '@/routes/router'
import useMediaQuery from '@/hooks/useMediaQuery'
import { useAuth } from '@/contexts/AuthContext'

export default function App() {
  const path = usePath()
  const route = routes.find((r) => r.path === path)
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

  // หน้าที่มี phoneElement จะแสดงแบบนั้นแทนบนมือถือ (เต็มจอ ไม่มี Navbar)
  if (isPhone && route?.phoneElement) return route.phoneElement

  // หน้า bare (Welcome / Log In / Reset Password / Register) แสดงเต็มจอ ไม่มี Navbar
  if (route?.bare) return route.element

  return <Layout>{route ? route.element : <NotFoundPage />}</Layout>
}
