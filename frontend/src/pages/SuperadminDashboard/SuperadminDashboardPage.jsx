import { useState, useEffect, useCallback } from 'react'
import DashboardGreeting from '@/components/layout/dashboard/DashboardGreeting'
import DashboardLayout from '@/components/layout/dashboard/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { Link, useSearchParams } from '@/routes/router'
import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api'
import SurveyMap from '@/components/risk-cases/SurveyMap'
import useSurvey from '@/hooks/useSurvey'
import './superadmin-dashboard.css'

const dashboardViews = {
  dashboard: { page: 'superadmin', title: 'ภาพรวมระบบ' },
  users: { page: 'superadmin-users', title: 'จัดการผู้ใช้' },
  departments: { page: 'superadmin-departments', title: 'จัดการแผนก' },
}

export default function SuperadminDashboardPage() {
  const { user: currentUser } = useAuth()

  const [searchParams] = useSearchParams()
  const requestedView = searchParams.get('view')
  const currentView = Object.hasOwn(dashboardViews, requestedView) ? requestedView : 'dashboard'
  const { page, title } = dashboardViews[currentView]
  const isOverview = currentView === 'dashboard'

  // Time filter state: 'today' | 'week' | 'month' | 'last_month'
  const [timeFilter, setTimeFilter] = useState('month')

  // Alert category filter: 'all' | 'pending' | 'processing' | 'done'
  const [alertFilter, setAlertFilter] = useState('pending')
  const [alertSearch, setAlertSearch] = useState('')

  // Map data & selection
  const { data: mapData } = useSurvey()
  const [mapSelection, setMapSelection] = useState(null)

  // Users management state
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [userError, setUserError] = useState(null)
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('all')

  // Departments state
  const [departments, setDepartments] = useState([])
  const [loadingDepts, setLoadingDepts] = useState(false)
  const [deptError, setDeptError] = useState(null)

  // User Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState(null)

  // Department Modals state
  const [showAddDeptModal, setShowAddDeptModal] = useState(false)
  const [showEditDeptModal, setShowEditDeptModal] = useState(false)
  const [showDeleteDeptModal, setShowDeleteDeptModal] = useState(false)
  const [selectedDept, setSelectedDept] = useState(null)
  const [deptFormData, setDeptFormData] = useState({ name: '', description: '' })

  // User Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    departmentId: '',
    password: '',
    roleId: 1, // 1: user, 2: admin, 3: superadmin
    isActive: true,
  })

  // Mock / dynamic incidents alerts data
  const [incidents] = useState([
    {
      id: 'CASE-2026-081',
      poleCode: 'PEA-CNX-014',
      riskLevel: 'touching',
      status: 'pending',
      desc: 'กิ่งไม้สัมผัสแนวสายไฟแรงสูง เสี่ยงไฟดับลัดวงจร',
      location: [18.7883, 98.9853],
      timeAgo: '15 นาทีที่แล้ว',
      date: '2026-11-24',
    },
    {
      id: 'CASE-2026-079',
      poleCode: 'PEA-BKK-092',
      riskLevel: 'near',
      status: 'pending',
      desc: 'ต้นไม้ใกล้แนวสายไฟระยะต่ำกว่า 1.5 เมตร',
      location: [13.7563, 100.5018],
      timeAgo: '42 นาทีที่แล้ว',
      date: '2026-11-24',
    },
    {
      id: 'CASE-2026-072',
      poleCode: 'PEA-NMA-055',
      riskLevel: 'touching',
      status: 'processing',
      desc: 'ทีมช่างกำลังเข้าตัดแต่งกิ่งไม้บริเวณเสา 55',
      location: [14.9799, 102.0978],
      timeAgo: '2 ชั่วโมงที่แล้ว',
      date: '2026-11-24',
    },
    {
      id: 'CASE-2026-068',
      poleCode: 'PEA-HYI-021',
      riskLevel: 'near',
      status: 'processing',
      desc: 'ส่งหนังสือแจ้งเจ้าของพื้นที่ตัดแต่งต้นไม้',
      location: [7.0086, 100.4767],
      timeAgo: '5 ชั่วโมงที่แล้ว',
      date: '2026-11-23',
    },
    {
      id: 'CASE-2026-054',
      poleCode: 'PEA-BKK-019',
      riskLevel: 'resolved',
      status: 'done',
      desc: 'ตัดแต่งกิ่งไม้และตรวจสอบแนวสายไฟเรียบร้อยแล้ว',
      location: [13.7463, 100.5318],
      timeAgo: '1 วันที่แล้ว',
      date: '2026-11-22',
    },
    {
      id: 'CASE-2026-049',
      poleCode: 'PEA-CBI-088',
      riskLevel: 'resolved',
      status: 'done',
      desc: 'ซ่อมแซมและเคลียร์กิ่งไม้เสร็จสิ้น ปลอดภัย',
      location: [13.3611, 100.9847],
      timeAgo: '2 วันที่แล้ว',
      date: '2026-11-21',
    },
  ])

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true)
      setUserError(null)
      const data = await apiGet('/admin/users')
      setUsers(data.users || data || [])
    } catch (err) {
      setUserError(err.message)
    } finally {
      setLoadingUsers(false)
    }
  }, [])

  // Fetch Departments
  const fetchDepartments = useCallback(async () => {
    try {
      setLoadingDepts(true)
      setDeptError(null)
      const data = await apiGet('/departments')
      setDepartments(data.departments || [])
    } catch (err) {
      setDeptError(err.message)
    } finally {
      setLoadingDepts(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
    fetchDepartments()
  }, [fetchUsers, fetchDepartments])

  // Add User Handler
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
      await fetchDepartments()
    } catch (err) {
      setModalError(err.message || 'ไม่สามารถเพิ่มผู้ใช้งานได้')
    } finally {
      setModalLoading(false)
    }
  }

  // Edit User Handler
  async function handleEditUser(e) {
    e.preventDefault()
    if (!selectedUser) return
    setModalLoading(true)
    setModalError(null)
    try {
      // 1. Update basic info, names, department & active status
      await apiPut(`/admin/users/${selectedUser.id}`, {
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        departmentId: formData.departmentId ? Number(formData.departmentId) : 0,
        isActive: formData.isActive,
      })

      // 2. Update role if changed
      const originalRoleId = selectedUser.role === 'superadmin' ? 3 : selectedUser.role === 'admin' ? 2 : 1
      if (Number(formData.roleId) !== originalRoleId) {
        await apiPut(`/admin/users/${selectedUser.id}/role`, {
          roleId: Number(formData.roleId),
        })
      }

      setShowEditModal(false)
      setSelectedUser(null)
      await fetchUsers()
      await fetchDepartments()
    } catch (err) {
      setModalError(err.message || 'ไม่สามารถแก้ไขข้อมูลได้')
    } finally {
      setModalLoading(false)
    }
  }

  // Delete User Handler
  async function handleDeleteUser() {
    if (!selectedUser) return
    setModalLoading(true)
    setModalError(null)
    try {
      await apiDelete(`/admin/users/${selectedUser.id}`)
      setShowDeleteModal(false)
      setSelectedUser(null)
      await fetchUsers()
      await fetchDepartments()
    } catch (err) {
      setModalError(err.message || 'ไม่สามารถลบผู้ใช้งานได้')
    } finally {
      setModalLoading(false)
    }
  }

  // Direct Role Change
  async function handleDirectRoleChange(userId, newRoleId) {
    try {
      await apiPut(`/admin/users/${userId}/role`, { roleId: Number(newRoleId) })
      await fetchUsers()
    } catch (err) {
      alert('เปลี่ยนบทบาทไม่สำเร็จ: ' + err.message)
    }
  }

  // Direct Toggle Active
  async function handleDirectToggleActive(userId, currentActive) {
    try {
      await apiPut(`/admin/users/${userId}`, { isActive: !currentActive })
      await fetchUsers()
    } catch (err) {
      alert('เปลี่ยนสถานะไม่สำเร็จ: ' + err.message)
    }
  }

  // Direct Department Change
  async function handleDirectDepartmentChange(userId, newDeptId) {
    try {
      await apiPut(`/admin/users/${userId}`, {
        departmentId: newDeptId ? Number(newDeptId) : 0,
      })
      await fetchUsers()
      await fetchDepartments()
    } catch (err) {
      alert('เปลี่ยนแผนกไม่สำเร็จ: ' + err.message)
    }
  }

  // Department Handlers
  async function handleAddDept(e) {
    e.preventDefault()
    setModalLoading(true)
    setModalError(null)
    try {
      await apiPost('/departments', deptFormData)
      setShowAddDeptModal(false)
      setDeptFormData({ name: '', description: '' })
      await fetchDepartments()
    } catch (err) {
      setModalError(err.message || 'ไม่สามารถเพิ่มแผนกได้')
    } finally {
      setModalLoading(false)
    }
  }

  async function handleEditDept(e) {
    e.preventDefault()
    if (!selectedDept) return
    setModalLoading(true)
    setModalError(null)
    try {
      await apiPut(`/departments/${selectedDept.id}`, deptFormData)
      setShowEditDeptModal(false)
      setSelectedDept(null)
      await fetchDepartments()
      await fetchUsers()
    } catch (err) {
      setModalError(err.message || 'ไม่สามารถแก้ไขแผนกได้')
    } finally {
      setModalLoading(false)
    }
  }

  async function handleDeleteDept() {
    if (!selectedDept) return
    setModalLoading(true)
    setModalError(null)
    try {
      await apiDelete(`/departments/${selectedDept.id}`)
      setShowDeleteDeptModal(false)
      setSelectedDept(null)
      await fetchDepartments()
      await fetchUsers()
    } catch (err) {
      setModalError(err.message || 'ไม่สามารถลบแผนกได้')
    } finally {
      setModalLoading(false)
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

  function openEditDeptModal(d) {
    setSelectedDept(d)
    setDeptFormData({ name: d.name, description: d.description || '' })
    setModalError(null)
    setShowEditDeptModal(true)
  }

  function openDeleteDeptModal(d) {
    setSelectedDept(d)
    setModalError(null)
    setShowDeleteDeptModal(true)
  }

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const term = userSearch.toLowerCase()
    const matchSearch =
      u.username.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.firstName && u.firstName.toLowerCase().includes(term)) ||
      (u.lastName && u.lastName.toLowerCase().includes(term)) ||
      (u.department && u.department.toLowerCase().includes(term))
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter
    return matchSearch && matchRole
  })

  // Filtered Alerts
  const filteredAlerts = incidents.filter((item) => {
    const matchStatus = alertFilter === 'all' || item.status === alertFilter
    const matchSearch =
      item.id.toLowerCase().includes(alertSearch.toLowerCase()) ||
      item.poleCode.toLowerCase().includes(alertSearch.toLowerCase()) ||
      item.desc.toLowerCase().includes(alertSearch.toLowerCase())
    return matchStatus && matchSearch
  })

  // Stats
  const stats = {
    pending: 40,
    processing: 200,
    done: 500,
  }

  return (
    <>
      <DashboardLayout
        activePage={page}
        title={title}
        query={isOverview ? alertSearch : userSearch}
        onQueryChange={isOverview ? setAlertSearch : currentView === 'users' ? setUserSearch : undefined}
      >
        <div className="superadmin-body">
          {currentView === 'dashboard' ? (
            /* ================= VIEW: DASHBOARD ================= */
            <>
              <DashboardGreeting
                action={
                  <div className="superadmin-time-pills">
                    <button
                      className={`superadmin-time-pill ${timeFilter === 'today' ? 'active' : ''}`}
                      onClick={() => setTimeFilter('today')}
                    >
                      To day
                    </button>
                    <button
                      className={`superadmin-time-pill ${timeFilter === 'week' ? 'active' : ''}`}
                      onClick={() => setTimeFilter('week')}
                    >
                      This Week
                    </button>
                    <button
                      className={`superadmin-time-pill ${timeFilter === 'month' ? 'active' : ''}`}
                      onClick={() => setTimeFilter('month')}
                    >
                      This Month
                    </button>
                    <button
                      className={`superadmin-time-pill ${timeFilter === 'last_month' ? 'active' : ''}`}
                      onClick={() => setTimeFilter('last_month')}
                    >
                      Last Month
                    </button>
                  </div>
                }
              />

              {/* 3 Stat Cards */}
              <div className="superadmin-stats-row">
                <div className="superadmin-stat-card pending">
                  <div className="superadmin-stat-content">
                    <span className="superadmin-stat-label">Pending</span>
                    <strong className="superadmin-stat-number">{stats.pending}</strong>
                  </div>
                </div>

                <div className="superadmin-stat-card processing">
                  <div className="superadmin-stat-content">
                    <span className="superadmin-stat-label">Processing</span>
                    <strong className="superadmin-stat-number">{stats.processing}</strong>
                  </div>
                </div>

                <div className="superadmin-stat-card done">
                  <div className="superadmin-stat-content">
                    <span className="superadmin-stat-label">Done</span>
                    <strong className="superadmin-stat-number">{stats.done}</strong>
                  </div>
                </div>
              </div>

              {/* Split Content: Left Map, Right Alerts */}
              <div className="superadmin-grid">
                <section className="superadmin-map-panel">
                  <div className="superadmin-panel-header">
                    <h2>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                      </svg>
                      แสดงแผนที่ (Survey Map)
                    </h2>
                    <Link
                      to="/live-map"
                      style={{ fontSize: '0.85rem', color: 'var(--sa-purple)', fontWeight: 600, textDecoration: 'none' }}
                    >
                      ขยายเต็มจอ ↗
                    </Link>
                  </div>
                  <div className="superadmin-map-container">
                    <SurveyMap data={mapData} selection={mapSelection} />
                  </div>
                  <div className="superadmin-map-caption">
                    <span>📍 พิกัดสำรวจล่าสุดของการไฟฟ้าส่วนภูมิภาค</span>
                    <span>สีแดง: สัมผัสแนวสายไฟ | สีส้ม: ใกล้แนวสายไฟ</span>
                  </div>
                </section>

                <section className="superadmin-alerts-panel">
                  <div className="superadmin-panel-header">
                    <h2>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
                      แจ้งเตือน (Incidents)
                    </h2>
                    <div className="superadmin-alerts-tabs">
                      <button
                        className={`superadmin-alert-tab tab-pending ${alertFilter === 'pending' ? 'active' : ''}`}
                        onClick={() => setAlertFilter('pending')}
                      >
                        Pending
                      </button>
                      <button
                        className={`superadmin-alert-tab tab-processing ${alertFilter === 'processing' ? 'active' : ''}`}
                        onClick={() => setAlertFilter('processing')}
                      >
                        Processing
                      </button>
                      <button
                        className={`superadmin-alert-tab tab-done ${alertFilter === 'done' ? 'active' : ''}`}
                        onClick={() => setAlertFilter('done')}
                      >
                        Done
                      </button>
                    </div>
                  </div>

                  <div className="superadmin-alerts-list">
                    {filteredAlerts.length > 0 ? (
                      filteredAlerts.map((item) => (
                        <div
                          key={item.id}
                          className={`superadmin-alert-item ${mapSelection?.id === item.id ? 'selected' : ''}`}
                          onClick={() => setMapSelection({ id: item.id })}
                        >
                          <span className={`superadmin-alert-badge badge-${item.status}`}>
                            {item.status}
                          </span>
                          <div className="superadmin-alert-info">
                            <div className="superadmin-alert-title">
                              <strong>{item.id} · {item.poleCode}</strong>
                              <time>{item.timeAgo}</time>
                            </div>
                            <p className="superadmin-alert-desc">{item.desc}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ textAlign: 'center', color: '#9ca3af', padding: '36px 16px', fontSize: '0.9rem' }}>
                        ไม่มีรายการแจ้งเตือนในสถานะนี้
                      </p>
                    )}
                  </div>
                </section>
              </div>
            </>
          ) : currentView === 'departments' ? (
            /* ================= VIEW: DEPARTMENTS ================= */
            <section className="superadmin-users-view">
              <div className="superadmin-users-header">
                <div>
                  <h2>🏢 การจัดการแผนก (Department Management)</h2>
                  <p>เพิ่ม ลบ แก้ไขแผนกต่างๆ ในสังกัดการไฟฟ้าส่วนภูมิภาค เพื่อผูกกับข้อมูลเจ้าหน้าที่</p>
                </div>
                <button
                  className="superadmin-btn-primary"
                  onClick={() => {
                    setDeptFormData({ name: '', description: '' })
                    setModalError(null)
                    setShowAddDeptModal(true)
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  + เพิ่มแผนกใหม่
                </button>
              </div>

              {deptError && (
                <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#b91c1c', borderRadius: 8, marginBottom: 16 }}>
                  ⚠️ {deptError}
                </div>
              )}

              {loadingDepts ? (
                <p style={{ textAlign: 'center', padding: 48, color: '#6b7280' }}>กำลังโหลดข้อมูลแผนก...</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="superadmin-table">
                    <thead>
                      <tr>
                        <th style={{ width: 80 }}>รหัส</th>
                        <th>ชื่อแผนก (Department Name)</th>
                        <th>รายละเอียด (Description)</th>
                        <th style={{ textAlign: 'center', width: 140 }}>จำนวนสมาชิก</th>
                        <th style={{ textAlign: 'center', width: 180 }}>จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departments.map((dept) => (
                        <tr key={dept.id}>
                          <td><strong>#{dept.id}</strong></td>
                          <td>
                            <strong style={{ color: 'var(--sa-purple)', fontSize: '0.95rem' }}>{dept.name}</strong>
                          </td>
                          <td style={{ color: '#4b5563' }}>{dept.description || '-'}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 10px',
                              borderRadius: 12,
                              background: '#e0e7ff',
                              color: '#3730a3',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                            }}>
                              👤 {dept.userCount || 0} คน
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: 8 }}>
                              <button
                                onClick={() => openEditDeptModal(dept)}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: 6,
                                  border: '1px solid var(--sa-border)',
                                  background: '#ffffff',
                                  color: '#374151',
                                  fontSize: '0.82rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                ✏️ แก้ไข
                              </button>
                              <button
                                onClick={() => openDeleteDeptModal(dept)}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: 6,
                                  border: 'none',
                                  background: '#fee2e2',
                                  color: '#b91c1c',
                                  fontSize: '0.82rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                🗑️ ลบ
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ) : (
            /* ================= VIEW: USERS ================= */
            <section className="superadmin-users-view">
              <div className="superadmin-users-header">
                <div>
                  <h2>👥 จัดการผู้ใช้งานในระบบ</h2>
                  <p>แอดมินสามารถเพิ่ม ลบ และแก้ไขสิทธิ์ได้ทั้ง User, Admin, และ Super Admin พร้อมระบุชื่อ-นามสกุล และแผนก</p>
                </div>
                <button
                  className="superadmin-btn-primary"
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
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  + เพิ่มผู้ใช้งานใหม่
                </button>
              </div>

              {/* Filters */}
              <div className="superadmin-table-filters">
                <div className="superadmin-role-filter-pills">
                  <button
                    className={`superadmin-role-pill ${userRoleFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setUserRoleFilter('all')}
                  >
                    ทั้งหมด ({users.length})
                  </button>
                  <button
                    className={`superadmin-role-pill ${userRoleFilter === 'user' ? 'active' : ''}`}
                    onClick={() => setUserRoleFilter('user')}
                  >
                    User ({users.filter((u) => u.role === 'user').length})
                  </button>
                  <button
                    className={`superadmin-role-pill ${userRoleFilter === 'admin' ? 'active' : ''}`}
                    onClick={() => setUserRoleFilter('admin')}
                  >
                    Admin ({users.filter((u) => u.role === 'admin').length})
                  </button>
                  <button
                    className={`superadmin-role-pill ${userRoleFilter === 'superadmin' ? 'active' : ''}`}
                    onClick={() => setUserRoleFilter('superadmin')}
                  >
                    Super Admin ({users.filter((u) => u.role === 'superadmin').length})
                  </button>
                </div>
              </div>

              {userError && (
                <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#b91c1c', borderRadius: 8, marginBottom: 16 }}>
                  ⚠️ {userError}
                </div>
              )}

              {/* Table */}
              {loadingUsers ? (
                <p style={{ textAlign: 'center', padding: 48, color: '#6b7280' }}>กำลังโหลดข้อมูลผู้ใช้...</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="superadmin-table">
                    <thead>
                      <tr>
                        <th>ผู้ใช้งาน (User)</th>
                        <th>ชื่อ - นามสกุล</th>
                        <th>แผนก (Department)</th>
                        <th>อีเมล</th>
                        <th>บทบาท (Role)</th>
                        <th>สถานะ</th>
                        <th style={{ textAlign: 'center' }}>จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => {
                        const isSelf = u.id === currentUser?.id
                        return (
                          <tr key={u.id}>
                            <td>
                              <div className="user-cell">
                                <div className="user-avatar-sm">
                                  {u.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="user-meta">
                                  <strong>{u.username} {isSelf && <small style={{ color: 'var(--sa-purple)' }}>(คุณ)</small>}</strong>
                                  <span>ID: {u.id.slice(0, 8)}...</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <strong>
                                {u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : '-'}
                              </strong>
                            </td>
                            <td>
                              <select
                                value={u.departmentId || ''}
                                onChange={(e) => handleDirectDepartmentChange(u.id, e.target.value)}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: 8,
                                  border: '1px solid var(--sa-border)',
                                  fontSize: '0.85rem',
                                  fontWeight: 600,
                                  color: u.departmentId ? 'var(--sa-purple)' : '#6b7280',
                                  background: u.departmentId ? '#fbf3fa' : '#f9fafb',
                                  cursor: 'pointer',
                                  maxWidth: 220,
                                }}
                              >
                                <option value="">-- ไม่ระบุแผนก --</option>
                                {departments.map((d) => (
                                  <option key={d.id} value={d.id}>
                                    🏢 {d.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>{u.email}</td>
                            <td>
                              <select
                                value={u.role === 'superadmin' ? 3 : u.role === 'admin' ? 2 : 1}
                                onChange={(e) => handleDirectRoleChange(u.id, e.target.value)}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: 8,
                                  border: '1px solid var(--sa-border)',
                                  fontSize: '0.85rem',
                                  fontWeight: 600,
                                  color: u.role === 'superadmin' ? '#741270' : u.role === 'admin' ? '#c60da0' : '#4b5563',
                                  background: u.role === 'superadmin' ? '#fbf3fa' : u.role === 'admin' ? '#fdf2f8' : '#f3f4f6',
                                  cursor: 'pointer',
                                }}
                              >
                                <option value={1}>User (ผู้ใช้ทั่วไป)</option>
                                <option value={2}>Admin (ผู้ดูแล)</option>
                                <option value={3}>Super Admin (ผู้ดูแลสูงสุด)</option>
                              </select>
                            </td>
                            <td>
                              <button
                                onClick={() => handleDirectToggleActive(u.id, u.isActive)}
                                style={{
                                  padding: '4px 12px',
                                  borderRadius: 20,
                                  border: 'none',
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  background: u.isActive ? '#d1fae5' : '#fee2e2',
                                  color: u.isActive ? '#065f46' : '#991b1b',
                                }}
                              >
                                {u.isActive ? '● Active' : '○ Inactive'}
                              </button>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'inline-flex', gap: 8 }}>
                                <button
                                  onClick={() => openEditModal(u)}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: 6,
                                    border: '1px solid var(--sa-border)',
                                    background: '#ffffff',
                                    color: '#374151',
                                    fontSize: '0.82rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                  }}
                                  title="แก้ไขข้อมูล"
                                >
                                  ✏️ แก้ไข
                                </button>
                                <button
                                  onClick={() => openDeleteModal(u)}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: 6,
                                    border: 'none',
                                    background: '#fee2e2',
                                    color: '#b91c1c',
                                    fontSize: '0.82rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                  }}
                                  title="ลบผู้ใช้"
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
            </section>
          )}
        </div>
      </DashboardLayout>

      {/* ================= MODAL: ADD USER ================= */}
      {showAddModal && (
        <div className="superadmin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="superadmin-modal" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="superadmin-modal-header">
              <h3>+ เพิ่มผู้ใช้งานใหม่</h3>
              <button className="superadmin-modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="superadmin-modal-body">
                {modalError && (
                  <div style={{ padding: '8px 12px', background: '#fee2e2', color: '#b91c1c', borderRadius: 6, fontSize: '0.85rem' }}>
                    ⚠️ {modalError}
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="superadmin-form-group">
                    <label>ชื่อจริง (First Name)</label>
                    <input
                      type="text"
                      placeholder="เช่น สมชาย"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="superadmin-form-group">
                    <label>นามสกุล (Last Name)</label>
                    <input
                      type="text"
                      placeholder="เช่น สว่างดี"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="superadmin-form-group">
                  <label>แผนก (Department)</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  >
                    <option value="">-- ไม่ระบุแผนก --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="superadmin-form-group">
                  <label>ชื่อผู้ใช้งาน (Username) *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น somchai_pea"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
                <div className="superadmin-form-group">
                  <label>อีเมล (Email) *</label>
                  <input
                    type="email"
                    required
                    placeholder="เช่น somchai@pea.co.th"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="superadmin-form-group">
                  <label>รหัสผ่าน (Password) * (อย่างน้อย 8 ตัวอักษร)</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="กำหนดรหัสผ่าน"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <div className="superadmin-form-group">
                  <label>บทบาท (Role) *</label>
                  <select
                    value={formData.roleId}
                    onChange={(e) => setFormData({ ...formData, roleId: Number(e.target.value) })}
                  >
                    <option value={1}>👤 User (ผู้ใช้งานทั่วไป)</option>
                    <option value={2}>🛡️ Admin (ผู้ดูแลระบบ)</option>
                    <option value={3}>🔑 Super Admin (ผู้ดูแลระบบสูงสุด)</option>
                  </select>
                </div>
              </div>
              <div className="superadmin-modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  ยกเลิก
                </button>
                <button type="submit" className="superadmin-btn-primary" disabled={modalLoading}>
                  {modalLoading ? 'กำลังบันทึก...' : 'บันทึกผู้ใช้'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT USER ================= */}
      {showEditModal && selectedUser && (
        <div className="superadmin-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="superadmin-modal" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="superadmin-modal-header">
              <h3>✏️ แก้ไขข้อมูล: {selectedUser.username}</h3>
              <button className="superadmin-modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleEditUser}>
              <div className="superadmin-modal-body">
                {modalError && (
                  <div style={{ padding: '8px 12px', background: '#fee2e2', color: '#b91c1c', borderRadius: 6, fontSize: '0.85rem' }}>
                    ⚠️ {modalError}
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="superadmin-form-group">
                    <label>ชื่อจริง (First Name)</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="superadmin-form-group">
                    <label>นามสกุล (Last Name)</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="superadmin-form-group">
                  <label>แผนก (Department)</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  >
                    <option value="">-- ไม่ระบุแผนก --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="superadmin-form-group">
                  <label>ชื่อผู้ใช้งาน (Username)</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
                <div className="superadmin-form-group">
                  <label>อีเมล (Email)</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="superadmin-form-group">
                  <label>บทบาท (Role)</label>
                  <select
                    value={formData.roleId}
                    onChange={(e) => setFormData({ ...formData, roleId: Number(e.target.value) })}
                  >
                    <option value={1}>👤 User (ผู้ใช้งานทั่วไป)</option>
                    <option value={2}>🛡️ Admin (ผู้ดูแลระบบ)</option>
                    <option value={3}>🔑 Super Admin (ผู้ดูแลระบบสูงสุด)</option>
                  </select>
                </div>
                <div className="superadmin-form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <label htmlFor="isActiveCheck" style={{ cursor: 'pointer', marginBottom: 0 }}>
                    เปิดใช้งานบัญชีนี้ (Active)
                  </label>
                </div>
              </div>
              <div className="superadmin-modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                  ยกเลิก
                </button>
                <button type="submit" className="superadmin-btn-primary" disabled={modalLoading}>
                  {modalLoading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE USER ================= */}
      {showDeleteModal && selectedUser && (
        <div className="superadmin-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="superadmin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="superadmin-modal-header">
              <h3>🗑️ ยืนยันการลบผู้ใช้งาน</h3>
              <button className="superadmin-modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div className="superadmin-modal-body">
              {modalError && (
                <div style={{ padding: '8px 12px', background: '#fee2e2', color: '#b91c1c', borderRadius: 6, fontSize: '0.85rem' }}>
                  ⚠️ {modalError}
                </div>
              )}
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#374151' }}>
                คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้ <strong>{selectedUser.username}</strong> ({selectedUser.role})?
              </p>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '8px 0 0' }}>
                บัญชีผู้ใช้นี้จะถูกปิดการใช้งาน (Deactivate) และจะไม่สามารถเข้าสู่ระบบได้
              </p>
            </div>
            <div className="superadmin-modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowDeleteModal(false)}>
                ยกเลิก
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleDeleteUser}
                disabled={modalLoading}
              >
                {modalLoading ? 'กำลังลบ...' : 'ยืนยันลบผู้ใช้'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD DEPARTMENT ================= */}
      {showAddDeptModal && (
        <div className="superadmin-modal-overlay" onClick={() => setShowAddDeptModal(false)}>
          <div className="superadmin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="superadmin-modal-header">
              <h3>🏢 + เพิ่มแผนกใหม่</h3>
              <button className="superadmin-modal-close" onClick={() => setShowAddDeptModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddDept}>
              <div className="superadmin-modal-body">
                {modalError && (
                  <div style={{ padding: '8px 12px', background: '#fee2e2', color: '#b91c1c', borderRadius: 6, fontSize: '0.85rem' }}>
                    ⚠️ {modalError}
                  </div>
                )}
                <div className="superadmin-form-group">
                  <label>ชื่อแผนก (Department Name) *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น แผนกปฏิบัติการและบำรุงรักษา"
                    value={deptFormData.name}
                    onChange={(e) => setDeptFormData({ ...deptFormData, name: e.target.value })}
                  />
                </div>
                <div className="superadmin-form-group">
                  <label>รายละเอียด / ขอบเขตงาน</label>
                  <input
                    type="text"
                    placeholder="เช่น ดูแลบำรุงรักษาระบบสายส่งและจำหน่ายไฟฟ้า"
                    value={deptFormData.description}
                    onChange={(e) => setDeptFormData({ ...deptFormData, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="superadmin-modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAddDeptModal(false)}>
                  ยกเลิก
                </button>
                <button type="submit" className="superadmin-btn-primary" disabled={modalLoading}>
                  {modalLoading ? 'กำลังบันทึก...' : 'บันทึกแผนก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT DEPARTMENT ================= */}
      {showEditDeptModal && selectedDept && (
        <div className="superadmin-modal-overlay" onClick={() => setShowEditDeptModal(false)}>
          <div className="superadmin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="superadmin-modal-header">
              <h3>✏️ แก้ไขแผนก: {selectedDept.name}</h3>
              <button className="superadmin-modal-close" onClick={() => setShowEditDeptModal(false)}>×</button>
            </div>
            <form onSubmit={handleEditDept}>
              <div className="superadmin-modal-body">
                {modalError && (
                  <div style={{ padding: '8px 12px', background: '#fee2e2', color: '#b91c1c', borderRadius: 6, fontSize: '0.85rem' }}>
                    ⚠️ {modalError}
                  </div>
                )}
                <div className="superadmin-form-group">
                  <label>ชื่อแผนก (Department Name) *</label>
                  <input
                    type="text"
                    required
                    value={deptFormData.name}
                    onChange={(e) => setDeptFormData({ ...deptFormData, name: e.target.value })}
                  />
                </div>
                <div className="superadmin-form-group">
                  <label>รายละเอียด / ขอบเขตงาน</label>
                  <input
                    type="text"
                    value={deptFormData.description}
                    onChange={(e) => setDeptFormData({ ...deptFormData, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="superadmin-modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowEditDeptModal(false)}>
                  ยกเลิก
                </button>
                <button type="submit" className="superadmin-btn-primary" disabled={modalLoading}>
                  {modalLoading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE DEPARTMENT ================= */}
      {showDeleteDeptModal && selectedDept && (
        <div className="superadmin-modal-overlay" onClick={() => setShowDeleteDeptModal(false)}>
          <div className="superadmin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="superadmin-modal-header">
              <h3>🗑️ ยืนยันการลบแผนก</h3>
              <button className="superadmin-modal-close" onClick={() => setShowDeleteDeptModal(false)}>×</button>
            </div>
            <div className="superadmin-modal-body">
              {modalError && (
                <div style={{ padding: '8px 12px', background: '#fee2e2', color: '#b91c1c', borderRadius: 6, fontSize: '0.85rem' }}>
                  ⚠️ {modalError}
                </div>
              )}
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#374151' }}>
                คุณแน่ใจหรือไม่ว่าต้องการลบแผนก <strong>{selectedDept.name}</strong>?
              </p>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '8px 0 0' }}>
                ผู้ใช้งานที่สังกัดแผนกนี้ ({selectedDept.userCount || 0} คน) จะถูกปลดสังกัดแผนกโดยอัตโนมัติ (ไม่ถูกลบบัญชี)
              </p>
            </div>
            <div className="superadmin-modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowDeleteDeptModal(false)}>
                ยกเลิก
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleDeleteDept}
                disabled={modalLoading}
              >
                {modalLoading ? 'กำลังลบ...' : 'ยืนยันลบแผนก'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
