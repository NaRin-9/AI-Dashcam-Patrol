// รายการหน้าทั้งหมดของเว็บ (คู่กับ backend/internal/routes) เพิ่มหน้าใหม่ที่นี่ที่เดียว
// label = ชื่อในเมนู, showInNav = แสดงในแถบเมนูหรือไม่
import HomePage from '@/pages/Home'
import LiveMapPage from '@/pages/LiveMap'
import RiskReportsPage from '@/pages/RiskReports'
import HowItWorksPage from '@/pages/HowItWorks'
import LoginPage from '@/pages/Login'

export const routes = [
  { path: '/', label: 'Home', element: <HomePage />, showInNav: true },
  { path: '/live-map', label: 'Live Map', element: <LiveMapPage />, showInNav: true },
  { path: '/risk-reports', label: 'Risk Reports', element: <RiskReportsPage />, showInNav: true },
  { path: '/how-it-works', label: 'How it Works', element: <HowItWorksPage />, showInNav: true },
  { path: '/login', label: 'Log In', element: <LoginPage />, showInNav: false },
]
