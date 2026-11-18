import Layout from '@/components/layout/Layout'
import useMediaQuery from '@/hooks/useMediaQuery'
import NotFoundPage from '@/pages/NotFound'
import { routes } from '@/routes'
import { Route, Router, Routes, ScrollToTop } from '@/routes/router'

function AppRoutes() {
  const isPhone = useMediaQuery('(max-width: 760px)')

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
      <ScrollToTop />
      <AppRoutes />
    </Router>
  )
}
