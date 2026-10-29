import Layout from '@/components/layout/Layout'
import NotFoundPage from '@/pages/NotFound'
import { routes } from '@/routes'
import { usePath } from '@/routes/router'

export default function App() {
  const path = usePath()
  const route = routes.find((r) => r.path === path)

  return <Layout>{route ? route.element : <NotFoundPage />}</Layout>
}
