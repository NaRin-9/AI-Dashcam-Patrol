// Router ขนาดเล็กแบบ hash (#/live-map) ไม่ต้องติดตั้งแพ็กเกจเพิ่ม
// ใช้ได้ทั้งตอน `npm run dev` และตอนเปิดไฟล์ build ตรงๆ
// ถ้าภายหลังติดตั้ง react-router-dom ได้ ให้เปลี่ยนเฉพาะไฟล์นี้กับ app/App.jsx
import { useEffect, useState } from 'react'

function currentPath() {
  const hash = window.location.hash.replace(/^#/, '')
  return hash.startsWith('/') ? hash : '/'
}

export function usePath() {
  const [path, setPath] = useState(currentPath)
  useEffect(() => {
    const onChange = () => {
      setPath(currentPath())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return path
}

export function Link({ to, className, children, ...rest }) {
  return (
    <a href={`#${to}`} className={className} {...rest}>
      {children}
    </a>
  )
}
