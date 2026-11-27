import DashboardPage from '@/pages/Dashboard'
import RiskCasesPage from '@/pages/RiskCases'
import LoginPage from '@/pages/Login'
import RegisterPage from '@/pages/Register'
import ResetPasswordPage from '@/pages/ResetPassword'
import MyVideosPage from '@/pages/MyVideos'
import AdminDashboardPage from '@/pages/AdminDashboard'
import SuperadminDashboardPage from '@/pages/SuperadminDashboard'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export const routes = [
  { path: '/', label: 'Log In', element: <LoginPage />, showInNav: false, bare: true },
  {
    path: '/dashboard',
    label: 'ภาพรวม',
    bare: true,
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
    showInNav: false,
  },
  {
    path: '/risk-cases',
    label: 'รายการจุดเสี่ยง',
    bare: true,
    element: <ProtectedRoute><RiskCasesPage /></ProtectedRoute>,
    showInNav: false,
  },
  {
    path: '/my-videos',
    label: 'วิดีโอของฉัน',
    bare: true,
    element: (
      <ProtectedRoute>
        <MyVideosPage />
      </ProtectedRoute>
    ),
    showInNav: false,
  },
  {
    path: '/admin',
    label: 'Admin',
    bare: true,
    element: (
      <ProtectedRoute roles={['admin', 'superadmin']}>
        <AdminDashboardPage />
      </ProtectedRoute>
    ),
    showInNav: false,
  },
  {
    path: '/superadmin',
    label: 'Super Admin',
    bare: true,
    element: (
      <ProtectedRoute roles={['superadmin']}>
        <SuperadminDashboardPage />
      </ProtectedRoute>
    ),
    showInNav: false,
  },

  // Auth pages (bare: เต็มจอ ไม่มี navbar)
  // { path: '/welcome', label: 'Welcome', element: <WelcomePage />, showInNav: false, bare: true },
  { path: '/login', label: 'Log In', element: <LoginPage />, showInNav: false, bare: true },
  { path: '/register', label: 'Register', element: <RegisterPage />, showInNav: false, bare: true },
  { path: '/reset-password', label: 'Reset Password', element: <ResetPasswordPage />, showInNav: false, bare: true },
]
