import { useState } from 'react'

// ช่องกรอกข้อความ: label + input + ข้อความ error (ใช้ trailing ใส่ปุ่มท้ายช่องได้)
export default function TextField({ id, label, error, trailing, ...input }) {
  const errorId = error ? `${id}-error` : undefined
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="field-box">
        <input
          id={id}
          name={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          {...input}
        />
        {trailing}
      </div>
      {error && (
        <p className="field-error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// ช่องรหัสผ่าน + ปุ่มตาแสดง/ซ่อนรหัส
export function PasswordField(props) {
  const [show, setShow] = useState(false)
  return (
    <TextField
      {...props}
      type={show ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          className="field-eye"
          aria-label={show ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
          aria-pressed={show}
          onClick={() => setShow((v) => !v)}
        >
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M1.5 12S5.5 4.5 12 4.5 22.5 12 22.5 12 18.5 19.5 12 19.5 1.5 12 1.5 12Z" />
            <circle cx="12" cy="12" r="3.2" />
            {!show && <path d="M4 20 20 4" />}
          </svg>
        </button>
      }
    />
  )
}
