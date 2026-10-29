import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  // relative path: เปิดไฟล์ใน dist/ ได้โดยไม่ต้องมีเซิร์ฟเวอร์
  base: './',
  resolve: {
    // import จาก src ได้ด้วย '@/...' แทน '../../..'
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    // เมื่อมี backend: คำขอ /api จะถูกส่งต่อไปที่ backend (แก้พอร์ตตาม backend จริง)
    proxy: { '/api': 'http://localhost:8000' },
  },
})
