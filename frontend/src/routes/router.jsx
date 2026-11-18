// ตัวห่อ react-router-dom ไว้จุดเดียว หน้าอื่นๆ import จากไฟล์นี้ (`@/routes/router`)
// ใช้ HashRouter (URL แบบ #/live-map) เพื่อให้เปิดไฟล์ใน dist/ ตรงๆ ได้โดยไม่ต้องมีเซิร์ฟเวอร์
// ถ้าภายหลังมีเซิร์ฟเวอร์รองรับ ให้เปลี่ยน HashRouter เป็น BrowserRouter ที่นี่ที่เดียว
import { useEffect } from 'react'
import { HashRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'

export { HashRouter as Router, Link, Navigate, Route, Routes, useLocation }

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
