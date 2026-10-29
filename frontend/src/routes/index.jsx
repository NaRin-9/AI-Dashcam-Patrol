// รายการหน้าทั้งหมดของเว็บ (คู่กับ backend/internal/routes) เพิ่มหน้าใหม่ที่นี่ที่เดียว
// label = ชื่อในเมนู, showInNav = แสดงในแถบเมนูหรือไม่
// phoneElement = หน้าที่แสดงแทนบนมือถือ (กว้างไม่เกิน 760px) เช่น หน้าแรกบนมือถือเป็น Welcome
// bare = true: แสดงเต็มจอโดยไม่มี Navbar (หน้า Welcome / Log In / Reset Password)
import HomePage from '@/pages/Home'
import LiveMapPage from '@/pages/LiveMap'
import RiskReportsPage from '@/pages/RiskReports'
import HowItWorksPage from '@/pages/HowItWorks'
import LoginPage from '@/pages/Login'
import ResetPasswordPage from '@/pages/ResetPassword'
import WelcomePage from '@/pages/Welcome'

export const routes = [
  { path: '/', label: 'Home', element: <HomePage />, phoneElement: <WelcomePage />, showInNav: true },
  { path: '/live-map', label: 'Live Map', element: <LiveMapPage />, showInNav: true },
  { path: '/risk-reports', label: 'Risk Reports', element: <RiskReportsPage />, showInNav: true },
  { path: '/how-it-works', label: 'How it Works', element: <HowItWorksPage />, showInNav: true },
  { path: '/welcome', label: 'Welcome', element: <WelcomePage />, showInNav: false, bare: true },
  { path: '/login', label: 'Log In', element: <LoginPage />, showInNav: false, bare: true },
  { path: '/reset-password', label: 'Reset Password', element: <ResetPasswordPage />, showInNav: false, bare: true },
]
