// จุดเดียวที่ frontend ใช้เรียก backend
// ตั้งค่า URL ได้ในไฟล์ .env (ดู .env.example) ถ้าไม่ตั้ง จะเรียก /api ผ่าน proxy ของ Vite
const BASE_URL = import.meta.env.VITE_API_URL || '/api'

export async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
  return res.json()
}

export async function apiPost(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`)
  return res.json()
}
