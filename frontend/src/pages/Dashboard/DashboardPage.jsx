import { useAuth } from '@/contexts/AuthContext'
import { Link } from '@/routes/router'

const card = {
  background: 'rgba(255,255,255,0.08)',
  borderRadius: 16,
  padding: '28px 32px',
  backdropFilter: 'blur(8px)',
}

const badge = (color) => ({
  display: 'inline-block',
  padding: '4px 14px',
  borderRadius: 20,
  fontSize: '0.85rem',
  fontWeight: 600,
  background: color,
  color: '#fff',
})

const roleBadgeColor = {
  user: 'var(--gold)',
  admin: 'var(--magenta, #c60da0)',
  superadmin: 'var(--purple-dark)',
}

export default function DashboardPage() {
  const { user, isAdminOrAbove, isSuperadmin, logout, logoutAll } = useAuth()

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>
        Dashboard
      </h1>
      <p style={{ opacity: 0.8, marginBottom: 32 }}>
        ยินดีต้อนรับ, {user?.username}!
      </p>

      {/* Profile Card */}
      <div style={card}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: 0, marginBottom: 20 }}>
          ข้อมูลผู้ใช้
        </h2>
        <div style={{ display: 'grid', gap: 12 }}>
          <InfoRow label="Username" value={user?.username} />
          <InfoRow label="Email" value={user?.email} />
          <InfoRow
            label="Role"
            value={
              <span style={badge(roleBadgeColor[user?.role] || 'var(--gold)')}>
                {user?.role}
              </span>
            }
          />
          <InfoRow label="สถานะ" value={user?.isActive ? '✅ Active' : '❌ Inactive'} />
          <InfoRow
            label="สมัครเมื่อ"
            value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('th-TH') : '-'}
          />
        </div>
      </div>

      {/* Quick Links */}
      <div style={{ ...card, marginTop: 20 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: 0, marginBottom: 16 }}>
          เมนูลัด
        </h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/live-map" style={linkBtn}>Live Map</Link>
          <Link to="/risk-reports" style={linkBtn}>Risk Reports</Link>
          {isAdminOrAbove && <Link to="/admin" style={linkBtn}>Admin Panel</Link>}
          {isSuperadmin && <Link to="/superadmin" style={linkBtn}>Super Admin</Link>}
        </div>
      </div>

      {/* Actions */}
      <div style={{ ...card, marginTop: 20 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: 0, marginBottom: 16 }}>
          การดำเนินการ
        </h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button onClick={logout} style={actionBtn}>
            Log Out
          </button>
          <button onClick={logoutAll} style={{ ...actionBtn, background: '#b8044e' }}>
            Log Out ทุกอุปกรณ์
          </button>
        </div>
      </div>
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

const linkBtn = {
  display: 'inline-block',
  padding: '8px 20px',
  background: 'var(--gold)',
  color: '#fff',
  borderRadius: 10,
  fontWeight: 600,
  fontSize: '0.9rem',
  textDecoration: 'none',
}

const actionBtn = {
  padding: '8px 20px',
  background: 'var(--purple-dark)',
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  fontWeight: 600,
  fontSize: '0.9rem',
  cursor: 'pointer',
  fontFamily: 'var(--font)',
}
