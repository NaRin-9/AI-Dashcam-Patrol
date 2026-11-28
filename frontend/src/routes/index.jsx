// รายการหน้าทั้งหมดของเว็บ (คู่กับ backend/internal/routes) เพิ่มหน้าใหม่ที่นี่ที่เดียว
// phoneElement = หน้าที่แสดงแทนบนมือถือ (กว้างไม่เกิน 760px)
import DashboardPage from '@/pages/Dashboard'
import RiskCasesPage from '@/pages/RiskCases'
import LiveMapPage from '@/pages/LiveMap'
import LoginPage from '@/pages/Login'
import RegisterPage from '@/pages/Register'
import ResetPasswordPage from '@/pages/ResetPassword'
import WelcomePage from '@/pages/Welcome'
import MyVideosPage from '@/pages/MyVideos'
import NotificationsPage from '@/pages/Notifications'
import AdminDashboardPage from '@/pages/AdminDashboard'
import SuperadminDashboardPage from '@/pages/SuperadminDashboard'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { Navigate } from './router'

export const routes = [
  { path: '/', element: <Navigate to="/login" replace />, phoneElement: <WelcomePage /> },
  {
    path: '/live-map',
    element: (
      <ProtectedRoute>
        <LiveMapPage />
      </ProtectedRoute>
    ),
  },

  // Dashboard routes พร้อม Role-based route protection
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/risk-cases',
    element: <ProtectedRoute><RiskCasesPage /></ProtectedRoute>,
  },
  {
    path: '/my-videos',
    element: (
      <ProtectedRoute>
        <MyVideosPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/notifications',
    element: (
      <ProtectedRoute>
        <NotificationsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute roles={['admin', 'superadmin']}>
        <AdminDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/superadmin',
    element: (
      <ProtectedRoute roles={['superadmin']}>
        <SuperadminDashboardPage />
      </ProtectedRoute>
    ),
  },

  { path: '/welcome', element: <WelcomePage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
]
