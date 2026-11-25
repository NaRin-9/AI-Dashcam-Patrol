import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api'

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
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(null)

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState(null)

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    departmentId: '',
    password: '',
    roleId: 1,
    isActive: true,
  })

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

  const fetchDepartments = useCallback(async () => {
    try {
      const data = await apiGet('/departments')
      setDepartments(data.departments || [])
    } catch {
      // non-blocking
    }
  }, [])

  useEffect(() => {
    fetchUsers()
    fetchDepartments()
  }, [fetchUsers, fetchDepartments])

  // Add User
  async function handleAddUser(e) {
    e.preventDefault()
    setModalLoading(true)
    setModalError(null)
    try {
      await apiPost('/admin/users', {
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        departmentId: formData.departmentId ? Number(formData.departmentId) : 0,
        password: formData.password,
        roleId: Number(formData.roleId),
      })
      setShowAddModal(false)
      setFormData({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        departmentId: '',
        password: '',
        roleId: 1,
        isActive: true,
      })
      await fetchUsers()
    } catch (err) {
      setModalError(err.message || 'ไม่สามารถเพิ่มผู้ใช้งานได้')
    } finally {
      setModalLoading(false)
    }
  }

  // Edit User
  async function handleEditUser(e) {
    e.preventDefault()
    if (!selectedUser) return
    setModalLoading(true)
    setModalError(null)
    try {
      await apiPut(`/admin/users/${selectedUser.id}`, {
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        departmentId: formData.departmentId ? Number(formData.departmentId) : 0,
        isActive: formData.isActive,
      })

      const origRoleId = selectedUser.role === 'superadmin' ? 3 : selectedUser.role === 'admin' ? 2 : 1
      if (Number(formData.roleId) !== origRoleId) {
        await apiPut(`/admin/users/${selectedUser.id}/role`, {
          roleId: Number(formData.roleId),
        })
      }

      setShowEditModal(false)
      setSelectedUser(null)
      await fetchUsers()
    } catch (err) {
      setModalError(err.message || 'ไม่สามารถแก้ไขข้อมูลได้')
    } finally {
      setModalLoading(false)
    }
  }

  // Delete User
  async function handleDeleteUser() {
    if (!selectedUser) return
    setModalLoading(true)
    setModalError(null)
    try {
      await apiDelete(`/admin/users/${selectedUser.id}`)
      setShowDeleteModal(false)
      setSelectedUser(null)
      await fetchUsers()
    } catch (err) {
      setModalError(err.message || 'ไม่สามารถลบผู้ใช้งานได้')
    } finally {
      setModalLoading(false)
    }
  }

  // Change Role
  async function handleRoleChange(userId, newRoleId) {
    try {
      setUpdating(userId)
      await apiPut(`/admin/users/${userId}/role`, { roleId: Number(newRoleId) })
      await fetchUsers()
    } catch (err) {
      alert('เปลี่ยน role ไม่สำเร็จ: ' + err.message)
    } finally {
      setUpdating(null)
    }
  }

  // Toggle Active
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

  function openEditModal(u) {
    setSelectedUser(u)
    setFormData({
      username: u.username,
      email: u.email,
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      departmentId: u.departmentId || '',
      password: '',
      roleId: u.role === 'superadmin' ? 3 : u.role === 'admin' ? 2 : 1,
      isActive: u.isActive,
    })
    setModalError(null)
    setShowEditModal(true)
  }

  function openDeleteModal(u) {
    setSelectedUser(u)
    setModalError(null)
    setShowDeleteModal(true)
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>
            Admin Dashboard
          </h1>
          <p style={{ opacity: 0.8, margin: '6px 0 0' }}>
            จัดการผู้ใช้งานในระบบ (เพิ่ม ลบ แก้ไข ทั้ง User, Admin, Super Admin พร้อมระบุชื่อ-นามสกุล และแผนก)
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({
              username: '',
              email: '',
              firstName: '',
              lastName: '',
              departmentId: '',
              password: '',
              roleId: 1,
              isActive: true,
            })
            setModalError(null)
            setShowAddModal(true)
          }}
          style={addBtn}
        >
          + เพิ่มผู้ใช้งานใหม่
        </button>
      </div>

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
                  <th style={th}>ชื่อ - นามสกุล</th>
                  <th style={th}>แผนก</th>
                  <th style={th}>Email</th>
                  <th style={th}>Role</th>
                  <th style={th}>สถานะ</th>
                  <th style={th}>การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isCurrentUser = u.id === currentUser?.id

                  return (
                    <tr key={u.id}>
                      <td style={td}>
                        <strong>{u.username}</strong>
                        {isCurrentUser && <span style={{ opacity: 0.6, fontSize: '0.8rem', marginLeft: 6 }}>(คุณ)</span>}
                      </td>
                      <td style={td}>
                        {u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : '-'}
                      </td>
                      <td style={td}>
                        {u.department ? (
                          <span style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: 'rgba(255,255,255,0.15)',
                            fontSize: '0.8rem',
                          }}>
                            🏢 {u.department}
                          </span>
                        ) : '-'}
                      </td>
                      <td style={td}>{u.email}</td>
                      <td style={td}>
                        <span style={roleBadge(u.role)}>{u.role}</span>
                      </td>
                      <td style={td}>{u.isActive ? '✅ Active' : '❌ Inactive'}</td>
                      <td style={td}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
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
                            onClick={() => openEditModal(u)}
                            style={{ ...smallBtn, background: '#4b5563' }}
                          >
                            ✏️ แก้ไข
                          </button>
                          <button
                            onClick={() => openDeleteModal(u)}
                            style={{ ...smallBtn, background: '#dc2626' }}
                          >
                            🗑️ ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div style={modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.2rem', color: '#fff' }}>+ เพิ่มผู้ใช้งานใหม่</h3>
            {modalError && <p style={{ color: '#ffd54a', fontSize: '0.85rem' }}>⚠️ {modalError}</p>}
            <form onSubmit={handleAddUser}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={formGroup}>
                  <label style={labelStyle}>ชื่อจริง (First Name)</label>
                  <input
                    style={inputStyle}
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div style={formGroup}>
                  <label style={labelStyle}>นามสกุล (Last Name)</label>
                  <input
                    style={inputStyle}
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div style={formGroup}>
                <label style={labelStyle}>แผนก (Department)</label>
                <select
                  style={inputStyle}
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                >
                  <option value="" style={{ color: '#000' }}>-- ไม่ระบุแผนก --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id} style={{ color: '#000' }}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div style={formGroup}>
                <label style={labelStyle}>Username *</label>
                <input
                  required
                  style={inputStyle}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
              <div style={formGroup}>
                <label style={labelStyle}>Email *</label>
                <input
                  required
                  type="email"
                  style={inputStyle}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div style={formGroup}>
                <label style={labelStyle}>Password * (อย่างน้อย 8 ตัวอักษร)</label>
                <input
                  required
                  type="password"
                  minLength={8}
                  style={inputStyle}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div style={formGroup}>
                <label style={labelStyle}>Role *</label>
                <select
                  style={inputStyle}
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: Number(e.target.value) })}
                >
                  <option value={1} style={{ color: '#000' }}>User (ผู้ใช้งานทั่วไป)</option>
                  <option value={2} style={{ color: '#000' }}>Admin (ผู้ดูแลระบบ)</option>
                  <option value={3} style={{ color: '#000' }}>Super Admin (ผู้ดูแลระบบสูงสุด)</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={cancelBtn}>ยกเลิก</button>
                <button type="submit" disabled={modalLoading} style={submitBtn}>
                  {modalLoading ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div style={modalOverlay} onClick={() => setShowEditModal(false)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.2rem', color: '#fff' }}>✏️ แก้ไขข้อมูล: {selectedUser.username}</h3>
            {modalError && <p style={{ color: '#ffd54a', fontSize: '0.85rem' }}>⚠️ {modalError}</p>}
            <form onSubmit={handleEditUser}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={formGroup}>
                  <label style={labelStyle}>ชื่อจริง (First Name)</label>
                  <input
                    style={inputStyle}
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div style={formGroup}>
                  <label style={labelStyle}>นามสกุล (Last Name)</label>
                  <input
                    style={inputStyle}
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div style={formGroup}>
                <label style={labelStyle}>แผนก (Department)</label>
                <select
                  style={inputStyle}
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                >
                  <option value="" style={{ color: '#000' }}>-- ไม่ระบุแผนก --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id} style={{ color: '#000' }}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div style={formGroup}>
                <label style={labelStyle}>Username</label>
                <input
                  required
                  style={inputStyle}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
              <div style={formGroup}>
                <label style={labelStyle}>Email</label>
                <input
                  required
                  type="email"
                  style={inputStyle}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div style={formGroup}>
                <label style={labelStyle}>Role</label>
                <select
                  style={inputStyle}
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: Number(e.target.value) })}
                >
                  <option value={1} style={{ color: '#000' }}>User</option>
                  <option value={2} style={{ color: '#000' }}>Admin</option>
                  <option value={3} style={{ color: '#000' }}>Super Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0' }}>
                <input
                  type="checkbox"
                  id="adminIsActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label htmlFor="adminIsActive" style={{ color: '#fff', fontSize: '0.9rem', cursor: 'pointer' }}>
                  เปิดใช้งานบัญชี (Active)
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button type="button" onClick={() => setShowEditModal(false)} style={cancelBtn}>ยกเลิก</button>
                <button type="submit" disabled={modalLoading} style={submitBtn}>
                  {modalLoading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div style={modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.2rem', color: '#fff' }}>🗑️ ยืนยันการลบผู้ใช้</h3>
            {modalError && <p style={{ color: '#ffd54a', fontSize: '0.85rem' }}>⚠️ {modalError}</p>}
            <p style={{ color: '#e5e7eb', fontSize: '0.95rem' }}>
              คุณต้องการลบหรือปิดการใช้งานบัญชี <strong>{selectedUser.username}</strong> ({selectedUser.role}) หรือไม่?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
              <button type="button" onClick={() => setShowDeleteModal(false)} style={cancelBtn}>ยกเลิก</button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={modalLoading}
                style={{ ...submitBtn, background: '#dc2626' }}
              >
                {modalLoading ? 'กำลังลบ...' : 'ยืนยันลบ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const addBtn = {
  padding: '10px 20px',
  background: 'var(--gold)',
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  fontWeight: 700,
  fontSize: '0.95rem',
  cursor: 'pointer',
}

const refreshBtn = {
  padding: '6px 16px',
  background: 'rgba(255,255,255,0.15)',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
}

const selectStyle = {
  padding: '5px 8px',
  borderRadius: 6,
  border: '1px solid rgba(255,255,255,0.3)',
  background: 'rgba(0,0,0,0.3)',
  color: '#fff',
  fontSize: '0.8rem',
  cursor: 'pointer',
}

const smallBtn = {
  padding: '5px 12px',
  border: 'none',
  borderRadius: 6,
  color: '#fff',
  fontSize: '0.8rem',
  fontWeight: 600,
  cursor: 'pointer',
}

const modalOverlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.6)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: 20,
}

const modalBox = {
  background: '#2b0c36',
  borderRadius: 16,
  padding: '28px',
  width: '100%',
  maxWidth: 480,
  border: '1px solid rgba(255,255,255,0.2)',
  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
}

const formGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  marginBottom: 14,
}

const labelStyle = {
  fontSize: '0.85rem',
  fontWeight: 600,
  color: '#e5e7eb',
}

const inputStyle = {
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.25)',
  background: 'rgba(255,255,255,0.1)',
  color: '#fff',
  fontSize: '0.9rem',
}

const cancelBtn = {
  padding: '8px 16px',
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 8,
  color: '#fff',
  cursor: 'pointer',
}

const submitBtn = {
  padding: '8px 18px',
  background: 'var(--gold)',
  border: 'none',
  borderRadius: 8,
  color: '#fff',
  fontWeight: 600,
  cursor: 'pointer',
}
