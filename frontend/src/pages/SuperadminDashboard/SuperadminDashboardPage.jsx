import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiGet, apiPut, apiDelete } from '@/services/api'

const card = {
  background: 'rgba(255,255,255,0.08)',
  borderRadius: 16,
  padding: '28px 32px',
  backdropFilter: 'blur(8px)',
  marginBottom: 20,
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

export default function SuperadminDashboardPage() {
  const { user: currentUser } = useAuth()
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

  async function handleDeleteUser(userId, username) {
    if (!confirm(`คุณต้องการลบผู้ใช้ "${username}" จริงหรือไม่?`)) return
    try {
      setUpdating(userId)
      await apiDelete(`/admin/users/${userId}`)
      await fetchUsers()
    } catch (err) {
      alert('ลบผู้ใช้ไม่สำเร็จ: ' + err.message)
    } finally {
      setUpdating(null)
    }
  }

  // สรุปสถิติ
  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    admins: users.filter((u) => u.role === 'admin').length,
    superadmins: users.filter((u) => u.role === 'superadmin').length,
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>
        🔑 Super Admin Dashboard
      </h1>
      <p style={{ opacity: 0.8, marginBottom: 32 }}>
        การจัดการระบบและผู้ใช้งานทั้งหมด
      </p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="ผู้ใช้ทั้งหมด" value={stats.total} color="var(--gold)" />
        <StatCard label="Active" value={stats.active} color="#1a8a4a" />
        <StatCard label="Admins" value={stats.admins} color="#c60da0" />
        <StatCard label="Superadmins" value={stats.superadmins} color="var(--purple-dark)" />
      </div>

      {/* User Management */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
            จัดการผู้ใช้ทั้งหมด
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

                  return (
                    <tr key={u.id}>
                      <td style={td}>
                        {u.username}
                        {isCurrentUser && <span style={{ opacity: 0.5, marginLeft: 6, fontSize: '0.8rem' }}>(คุณ)</span>}
                      </td>
                      <td style={td}>{u.email}</td>
                      <td style={td}>
                        <span style={roleBadge(u.role)}>{u.role}</span>
                      </td>
                      <td style={td}>{u.isActive ? '✅' : '❌'}</td>
                      <td style={td}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('th-TH') : '-'}
                      </td>
                      <td style={td}>
                        {!isCurrentUser ? (
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <select
                              value={u.role === 'superadmin' ? 3 : u.role === 'admin' ? 2 : 1}
                              onChange={(e) => handleRoleChange(u.id, Number(e.target.value))}
                              disabled={updating === u.id}
                              style={selectStyle}
                            >
                              <option value={1}>user</option>
                              <option value={2}>admin</option>
                              <option value={3}>superadmin</option>
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
                            <button
                              onClick={() => handleDeleteUser(u.id, u.username)}
                              disabled={updating === u.id}
                              style={{ ...smallBtn, background: '#8b0000' }}
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>—</span>
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

      {/* System Info */}
      <div style={card}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: 0, marginBottom: 16 }}>
          ข้อมูลระบบ
        </h2>
        <div style={{ display: 'grid', gap: 10 }}>
          <InfoRow label="Frontend" value="React 19 + Vite 7" />
          <InfoRow label="Backend" value="Go + Gin" />
          <InfoRow label="Auth" value="JWT (access + refresh)" />
          <InfoRow label="Database" value="PostgreSQL" />
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.08)',
      borderRadius: 12,
      padding: '20px 24px',
      textAlign: 'center',
      borderLeft: `4px solid ${color}`,
    }}>
      <div style={{ fontSize: '2rem', fontWeight: 700 }}>{value}</div>
      <div style={{ opacity: 0.7, fontSize: '0.85rem', marginTop: 4 }}>{label}</div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <span style={{ fontWeight: 600, minWidth: 110, opacity: 0.7, fontSize: '0.9rem' }}>{label}</span>
      <span>{value}</span>
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
