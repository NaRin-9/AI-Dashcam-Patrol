import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi, setAccessToken, clearAccessToken } from '@/services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // true ขณะตรวจสอบ auth ตอน mount

  // ลอง restore session ตอน mount (ผ่าน refresh token cookie)
  useEffect(() => {
    restoreSession()
  }, [])

  async function restoreSession() {
    try {
      const data = await authApi.refresh()
      setAccessToken(data.accessToken)
      setUser(data.user)
    } catch {
      clearAccessToken()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = useCallback(async (credentials) => {
    const data = await authApi.login(credentials)
    setAccessToken(data.accessToken)
    setUser(data.user)
    return data
  }, [])

  const register = useCallback(async (userData) => {
    const data = await authApi.register(userData)
    setAccessToken(data.accessToken)
    setUser(data.user)
    return data
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore errors
    }
    clearAccessToken()
    setUser(null)
    window.location.hash = '#/login'
  }, [])

  const logoutAll = useCallback(async () => {
    try {
      await authApi.logoutAll()
    } catch {
      // ignore errors
    }
    clearAccessToken()
    setUser(null)
    window.location.hash = '#/login'
  }, [])

  // ตรวจสอบ role
  const hasRole = useCallback((role) => {
    return user?.role === role
  }, [user])

  const hasAnyRole = useCallback((...roles) => {
    return roles.includes(user?.role)
  }, [user])

  const isAuthenticated = !!user
  const isUser = user?.role === 'user'
  const isAdmin = user?.role === 'admin'
  const isSuperadmin = user?.role === 'superadmin'
  const isAdminOrAbove = isAdmin || isSuperadmin

  const value = {
    user,
    loading,
    isAuthenticated,
    isUser,
    isAdmin,
    isSuperadmin,
    isAdminOrAbove,
    login,
    register,
    logout,
    logoutAll,
    hasRole,
    hasAnyRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
