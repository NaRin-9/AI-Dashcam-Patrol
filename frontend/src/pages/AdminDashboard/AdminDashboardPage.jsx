import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiGet, apiPut } from '@/services/api'

const card = {
  background: 'rgba(255,255,255,0.08)',
  borderRadius: 16,
  padding: '28px 32px',
  backdropFilter: 'blur(8px)',
}

const roleBadge = (role) => ({
  display: 'inline-block',
  padding: '3px 12px',
  borderRadius: 20,
  fontSize: '0.8rem',
  fontWeight: 600,
  background: role === 'superadmin' ? 'var(--purple-dark)' : role === 'admin' ? '#c60da0' : 'var(--gold)',
  color: '#fff',
})

const th = {
  textAlign: 'left',
  padding: '10px 14px',
  fontSize: '0.85rem',
  fontWeight: 600,
  opacity: 0.7,
  borderBottom: '1px solid rgba(255,255,255,0.15)',
}

const td = {
  padding: '10px 14px',
  fontSize: '0.9rem',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
}

export default function AdminDashboardPage() {
  const { user: currentUser, isSuperadmin } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiGet('/admin/users')
      setUsers(data.users || data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  async function handleRoleChange(userId, newRoleId) {
    try {
      setUpdating(userId)
      await apiPut(`/admin/users/${userId}/role`, { roleId: newRoleId })
      await fetchUsers()
    } catch (err) {
      alert('เปลี่ยน role ไม่สำเร็จ: ' + err.message)
    } finally {
      setUpdating(null)
    }
  }

  async function handleToggleActive(userId, isActive) {
    try {
      setUpdating(userId)
      await apiPut(`/admin/users/${userId}`, { isActive: !isActive })
      await fetchUsers()
    } catch (err) {
      alert('เปลี่ยนสถานะไม่สำเร็จ: ' + err.message)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>
        Admin Dashboard
      </h1>
      <p style={{ opacity: 0.8, marginBottom: 32 }}>
        จัดการผู้ใช้งานในระบบ
      </p>

      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
            ผู้ใช้ทั้งหมด ({users.length})
          </h2>
          <button onClick={fetchUsers} style={refreshBtn} disabled={loading}>
            {loading ? '⏳' : '🔄'} Refresh
          </button>
        </div>

        {error && (
          <p style={{ color: '#ffd54a', marginBottom: 16 }}>⚠️ {error}</p>
        )}

        {loading ? (
          <p style={{ opacity: 0.7, textAlign: 'center', padding: 32 }}>กำลังโหลด...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>Username</th>
                  <th style={th}>Email</th>
                  <th style={th}>Role</th>
                  <th style={th}>สถานะ</th>
                  <th style={th}>สมัครเมื่อ</th>
                  <th style={th}>การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isCurrentUser = u.id === currentUser?.id
                  const isSA = u.role === 'superadmin'
                  // admin ไม่สามารถเปลี่ยน role ของ superadmin ได้
                  const canChangeRole = !isCurrentUser && (!isSA || isSuperadmin)

                  return (
                    <tr key={u.id}>
                      <td style={td}>{u.username}</td>
                      <td style={td}>{u.email}</td>
                      <td style={td}>
                        <span style={roleBadge(u.role)}>{u.role}</span>
                      </td>
                      <td style={td}>{u.isActive ? '✅' : '❌'}</td>
                      <td style={td}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('th-TH') : '-'}
                      </td>
                      <td style={td}>
                        {canChangeRole && (
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <select
                              value={u.role === 'superadmin' ? 3 : u.role === 'admin' ? 2 : 1}
                              onChange={(e) => handleRoleChange(u.id, Number(e.target.value))}
                              disabled={updating === u.id}
                              style={selectStyle}
                            >
                              <option value={1}>user</option>
                              <option value={2}>admin</option>
                              {isSuperadmin && <option value={3}>superadmin</option>}
                            </select>
                            <button
                              onClick={() => handleToggleActive(u.id, u.isActive)}
                              disabled={updating === u.id}
                              style={{
                                ...smallBtn,
                                background: u.isActive ? '#b8044e' : '#1a8a4a',
                              }}
                            >
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        )}
                        {isCurrentUser && (
                          <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>คุณ</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

const refreshBtn = {
  padding: '6px 16px',
  background: 'var(--gold)',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
  fontFamily: 'var(--font)',
}

const selectStyle = {
  padding: '4px 8px',
  borderRadius: 6,
  border: '1px solid rgba(255,255,255,0.3)',
  background: 'rgba(255,255,255,0.1)',
  color: '#fff',
  fontSize: '0.8rem',
  fontFamily: 'var(--font)',
  cursor: 'pointer',
}

const smallBtn = {
  padding: '4px 12px',
  border: 'none',
  borderRadius: 6,
  color: '#fff',
  fontSize: '0.8rem',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'var(--font)',
}
