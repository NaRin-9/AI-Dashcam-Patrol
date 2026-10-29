import Layout from '@/components/layout/Layout'
import NotFoundPage from '@/pages/NotFound'
import { routes } from '@/routes'
import { usePath } from '@/routes/router'
import useMediaQuery from '@/hooks/useMediaQuery'

export default function App() {
  const path = usePath()
  const route = routes.find((r) => r.path === path)
  const isPhone = useMediaQuery('(max-width: 760px)')

  // หน้าที่มี phoneElement จะแสดงแบบนั้นแทนบนมือถือ (เต็มจอ ไม่มี Navbar)
  if (isPhone && route?.phoneElement) return route.phoneElement

  // หน้า bare (Welcome / Log In / Reset Password) แสดงเต็มจอ ไม่มี Navbar
  if (route?.bare) return route.element

  return <Layout>{route ? route.element : <NotFoundPage />}</Layout>
}
