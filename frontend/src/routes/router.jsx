// ตัวห่อ react-router-dom ไว้จุดเดียว หน้าอื่นๆ import จากไฟล์นี้ (`@/routes/router`)
import { useEffect } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom'

export { BrowserRouter as Router, Link, Navigate, Route, Routes, useLocation, useNavigate, useSearchParams }

// path ปัจจุบัน เช่น '/login'
export function usePath() {
  return useLocation().pathname
}

// เลื่อนกลับบนสุดทุกครั้งที่เปลี่ยนหน้า
export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
