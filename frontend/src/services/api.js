// จุดเดียวที่ frontend ใช้เรียก backend
// ตั้งค่า URL ได้ในไฟล์ .env (ดู .env.example) ถ้าไม่ตั้ง จะเรียก /api ผ่าน proxy ของ Vite
const BASE_URL = import.meta.env.VITE_API_URL || '/api'

// เก็บ access token ใน memory เท่านั้น (ไม่เก็บใน localStorage เพื่อความปลอดภัย)
let accessToken = null

export function setAccessToken(token) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

export function clearAccessToken() {
  accessToken = null
}

class ApiError extends Error {
  constructor(status, body) {
    super(body?.error || `Request failed: ${status}`)
    this.status = status
    this.body = body
  }
}

async function tryRefresh() {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
    if (!res.ok) return false
    const data = await res.json()
    accessToken = data.accessToken
    return true
  } catch {
    return false
  }
}

async function apiFetch(path, options = {}) {
  const headers = { ...options.headers }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  if (options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include', // สำคัญสำหรับ cookie (refresh token)
  })

  // ข้ามการ refresh token ถ้าเป็น auth endpoint (login, register, refresh)
  const isAuthEndpoint = path.includes('/auth/login') || path.includes('/auth/register') || path.includes('/auth/refresh')

  // ถ้าได้ 401 และไม่ใช่ auth endpoint ให้ลอง refresh token
  if (res.status === 401 && !isAuthEndpoint) {
    const refreshed = await tryRefresh()
    if (refreshed) {
      headers['Authorization'] = `Bearer ${accessToken}`
      const retryRes = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
        credentials: 'include',
      })
      if (!retryRes.ok) {
        const body = await retryRes.json().catch(() => ({ error: 'Unknown error' }))
        throw new ApiError(retryRes.status, body)
      }
      return retryRes.json()
    }
    throw new ApiError(401, { error: 'Session expired' })
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new ApiError(res.status, body)
  }

  return res.json()
}

// Keep existing exports working
export async function apiGet(path, { signal } = {}) {
  return apiFetch(path, { signal })
}

export async function apiPost(path, body) {
  return apiFetch(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  })
}

export async function apiPut(path, body) {
  return apiFetch(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export async function apiDelete(path) {
  return apiFetch(path, { method: 'DELETE' })
}

export async function uploadVideo(file, onProgress) {
  const form = new FormData()
  form.append('video', file)

  function send() {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest()
      request.open('POST', `${BASE_URL}/videos`)
      request.withCredentials = true
      request.responseType = 'json'
      if (accessToken) request.setRequestHeader('Authorization', `Bearer ${accessToken}`)
      request.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress(Math.floor(event.loaded / event.total * 100))
      }
      request.onload = () => {
        if (request.status === 201) resolve(request.response)
        else reject(new ApiError(request.status, request.response ?? { error: 'อัปโหลดไม่สำเร็จ' }))
      }
      request.onerror = () => reject(new Error('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองอีกครั้ง'))
      request.send(form)
    })
  }

  try {
    return await send()
  } catch (error) {
    if (error.status !== 401) throw error
    if (!await tryRefresh()) throw new Error('กรุณาเข้าสู่ระบบใหม่แล้วลองอีกครั้ง')
    onProgress(0)
    return send()
  }
}

// Auth-specific API calls
export const authApi = {
  login: (data) => apiPost('/auth/login', data),
  register: (data) => apiPost('/auth/register', data),
  refresh: () => apiPost('/auth/refresh'),
  logout: () => apiPost('/auth/logout'),
  logoutAll: () => apiPost('/auth/logout-all'),
  me: () => apiGet('/auth/me'),
}
