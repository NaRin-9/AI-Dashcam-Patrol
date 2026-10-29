import { useState } from 'react'
import logo from '@/assets/pea-logo.png'
import { routes } from '@/routes'
import { Link, usePath } from '@/routes/router'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const path = usePath()
  const links = routes.filter((r) => r.showInNav)

  return (
    <header className="nav">
      <Link className="brand" to="/">
        <img className="logo" src={logo} alt="การไฟฟ้าส่วนภูมิภาค" />
        <span className="brand-name">ตรวจจับความเสี่ยง ก่อนเกิดปัญหา</span>
      </Link>

      <button
        className="nav-toggle"
        aria-expanded={open}
        aria-controls="nav-menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="sr-only">{open ? 'ปิดเมนู' : 'เปิดเมนู'}</span>
        <span className="bars" aria-hidden="true" />
      </button>

      <nav id="nav-menu" className={`nav-menu ${open ? 'is-open' : ''}`}>
        <ul>
          {links.map((l) => (
            <li key={l.path}>
              <Link
                to={l.path}
                aria-current={path === l.path ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <span className="nav-divider" aria-hidden="true" />
        <Link className="btn btn-gold btn-sm" to="/login" onClick={() => setOpen(false)}>
          Log In
        </Link>
      </nav>
    </header>
  )
}
