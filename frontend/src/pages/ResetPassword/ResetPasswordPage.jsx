// import { useState } from 'react'
// import AuthShell from '@/components/ui/AuthShell'
// import TextField, { PasswordField } from '@/components/ui/TextField'
// import { Link } from '@/routes/router'

// const MIN_PASSWORD = 8

// export default function ResetPasswordPage() {
//   const [values, setValues] = useState({ username: '', email: '', password: '', confirm: '' })
//   const [errors, setErrors] = useState({})

//   const onChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }))

//   const onSubmit = (e) => {
//     e.preventDefault()
//     const next = {}
//     if (!values.username.trim()) next.username = 'กรุณากรอกชื่อผู้ใช้'
//     if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) next.email = 'อีเมลไม่ถูกต้อง'
//     if (values.password.length < MIN_PASSWORD) next.password = `รหัสผ่านต้องมีอย่างน้อย ${MIN_PASSWORD} ตัวอักษร`
//     if (values.confirm !== values.password) next.confirm = 'รหัสผ่านไม่ตรงกัน'
//     setErrors(next)
//     if (Object.keys(next).length) return

//     // TODO: เชื่อม backend เมื่อ API พร้อม เช่น
//     // apiPost('/auth/reset-password', { username, email, password })
//   }

//   return (
//     <AuthShell title="Reset Password">
//       <form className="auth-form" onSubmit={onSubmit} noValidate>
//         <TextField
//           id="username"
//           label="Username"
//           placeholder="Username"
//           autoComplete="username"
//           value={values.username}
//           onChange={onChange}
//           error={errors.username}
//         />
//         <TextField
//           id="email"
//           type="email"
//           label="Email"
//           placeholder="name@example.com"
//           autoComplete="email"
//           value={values.email}
//           onChange={onChange}
//           error={errors.email}
//         />
//         <PasswordField
//           id="password"
//           label="New Password"
//           placeholder="new password"
//           autoComplete="new-password"
//           value={values.password}
//           onChange={onChange}
//           error={errors.password}
//         />
//         <PasswordField
//           id="confirm"
//           label="Confirm New Password"
//           placeholder="confirm new password"
//           autoComplete="new-password"
//           value={values.confirm}
//           onChange={onChange}
//           error={errors.confirm}
//         />
//         <button type="submit" className="btn btn-gold auth-btn">
//           Reset Password
//         </button>
//         <Link className="auth-link" to="/login">
//           Back to Log In
//         </Link>
//       </form>
//     </AuthShell>
//   )
// }
import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  MailCheck,
  ShieldCheck,
} from 'lucide-react';
import { Link, useNavigate } from '@/routes/router';

const MIN_PASSWORD = 8;
const OTP_LENGTH = 6;

function formatResetError(err) {
  const message = (err?.message || '').toLowerCase();
  if (message.includes('user not found') || message.includes('invalid user')) {
    return 'No account found matching that username and email.';
  }
  if (message.includes('invalid otp') || message.includes('invalid code') || message.includes('expired')) {
    return 'The verification code is invalid or has expired.';
  }
  if (message.includes('deactivated')) {
    return 'This account has been deactivated. Please contact support.';
  }
  return err?.message || 'Unable to reset password. Please try again.';
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  // step: 1 = Request OTP, 2 = Enter OTP & New Password
  const [step, setStep] = useState(1);
  const [values, setValues] = useState({
    username: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(''));
  const otpRefs = useRef([]);

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  // จัดการการพิมพ์และวาง (Paste) รหัส OTP 6 หลัก
  const handleOtpChange = (index, rawValue) => {
    const digit = rawValue.replace(/\D/g, '').slice(-1);
    const nextDigits = [...otpDigits];
    nextDigits[index] = digit;
    setOtpDigits(nextDigits);
    setErrors((prev) => ({ ...prev, otp: '' }));
    setApiError('');

    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;

    const nextDigits = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((char, idx) => {
      nextDigits[idx] = char;
    });
    setOtpDigits(nextDigits);
    setErrors((prev) => ({ ...prev, otp: '' }));

    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    otpRefs.current[focusIndex]?.focus();
  };

  // Step 1: ขอส่งรหัส OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (isSendingOtp || cooldown > 0) return;

    const next = {};
    if (!values.username.trim()) next.username = 'Username is required';
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) next.email = 'Enter a valid email address';

    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      setIsSendingOtp(true);
      setApiError('');

      const baseUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${baseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: values.username.trim(),
          email: values.email.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || data?.error || 'Failed to send verification code');
      }

      setCooldown(60);
      setStep(2);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch (err) {
      setApiError(formatResetError(err));
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Step 2: ยืนยัน OTP และตั้งรหัสผ่านใหม่
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    const otpCode = otpDigits.join('');
    const next = {};

    if (otpCode.length < OTP_LENGTH) next.otp = 'Please enter the 6-digit verification code';
    if (values.password.length < MIN_PASSWORD) {
      next.password = `Must be at least ${MIN_PASSWORD} characters`;
    }
    if (values.confirm !== values.password) {
      next.confirm = 'Passwords do not match';
    }

    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      setIsLoading(true);
      setApiError('');

      const baseUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${baseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: values.username.trim(),
          email: values.email.trim(),
          otp: otpCode,
          password: values.password,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || data?.error || 'Password reset failed');
      }

      setIsSuccess(true);
    } catch (err) {
      setApiError(formatResetError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const hasMinLength = values.password.length >= MIN_PASSWORD;
  const isPasswordMatched = values.confirm.length > 0 && values.confirm === values.password;

  return (
    <div className="reset-container">
      <style>{`
        .reset-container * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .reset-container {
          position: relative;
          min-height: 100vh;
          min-height: 100dvh;
          width: 100%;
          overflow-x: hidden;
          overflow-y: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: linear-gradient(180deg, #660059 0%, #9c0985 50%, #e615c0 100%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Prompt', sans-serif;
          color: #ffffff;
        }

        .bg-layer {
          position: fixed;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }

        .world-map-bg {
          position: absolute;
          inset: 0;
          opacity: 0.3;
          background-image: url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg');
          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
          mix-blend-mode: screen;
          filter: invert(1) brightness(1.8);
        }

        .scanlines-bg {
          position: absolute;
          inset: 0;
          opacity: 0.2;
          background-image: repeating-linear-gradient(
            to bottom,
            transparent,
            transparent 2px,
            #ffffff 2px,
            #ffffff 3px
          );
        }

        /* Dark Frosted Glass Card (สัดส่วนเดียวกับหน้า Login) */
        .glass-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 430px;
          margin: auto;
          border-radius: 28px;
          background: rgba(16, 3, 18, 0.74);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow:
            0 32px 64px -12px rgba(0, 0, 0, 0.6),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.24);
          padding: 36px 28px 36px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          transition: all 0.25s ease;
        }

        .card-inner {
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
        }

        .card-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 22px;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13.5px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.72);
          background: none;
          border: none;
          text-decoration: none;
          cursor: pointer;
          transition: color 0.15s ease;
        }

        .back-btn:hover {
          color: #ffffff;
        }

        .step-pill {
          font-size: 12px;
          font-weight: 600;
          color: #f9a8d4;
          background: rgba(230, 21, 192, 0.16);
          border: 1px solid rgba(244, 114, 182, 0.35);
          padding: 4px 12px;
          border-radius: 999px;
        }

        .card-header {
          text-align: center;
          margin-bottom: 26px;
        }

        .avatar-ring {
          width: 78px;
          height: 78px;
          margin: 0 auto 16px;
          border-radius: 50%;
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.04));
          border: 1px solid rgba(255, 255, 255, 0.26);
          box-shadow:
            0 10px 25px rgba(0, 0, 0, 0.32),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
        }

        .avatar-ring.is-success {
          background: linear-gradient(145deg, rgba(34, 197, 94, 0.26), rgba(22, 163, 74, 0.08));
          border-color: rgba(74, 222, 128, 0.45);
          color: #4ade80;
        }

        .avatar-icon {
          width: 34px;
          height: 34px;
        }

        .card-title {
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #ffffff;
        }

        .card-subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.68);
          margin-top: 6px;
          line-height: 1.5;
        }

        .card-subtitle strong {
          color: #ffffff;
          font-weight: 600;
        }

        .error-banner {
          padding: 11px 14px;
          margin-bottom: 18px;
          border-radius: 12px;
          background: rgba(239, 68, 68, 0.18);
          border: 1px solid rgba(248, 113, 113, 0.45);
          color: #fecaca;
          font-size: 13px;
          text-align: center;
          line-height: 1.4;
        }

        .field-group {
          margin-bottom: 18px;
        }

        .field-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 7px;
        }

        .field-label {
          display: block;
          font-size: 13.5px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.88);
          margin-bottom: 7px;
        }

        .field-label-row .field-label {
          margin-bottom: 0;
        }

        .resend-link {
          font-size: 12.5px;
          font-weight: 600;
          color: #f9a8d4;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.15s ease;
        }

        .resend-link:hover:not(:disabled) {
          color: #ffffff;
          text-decoration: underline;
        }

        .resend-link:disabled {
          color: rgba(255, 255, 255, 0.38);
          cursor: not-allowed;
        }

        .glass-input {
          width: 100%;
          height: 46px;
          padding: 0 16px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
          font-size: 14.5px;
          transition: border-color 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease;
        }

        .glass-input::placeholder {
          color: rgba(255, 255, 255, 0.38);
        }

        .glass-input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.12);
          border-color: #f472b6;
          box-shadow: 0 0 0 3px rgba(230, 21, 192, 0.25);
        }

        .glass-input.has-error {
          border-color: #f87171;
          background: rgba(239, 68, 68, 0.1);
        }

        /* ป้องกัน Chrome Autofill เปลี่ยนพื้นหลังช่องเป็นสีขาวทึบ */
        .glass-input:-webkit-autofill,
        .glass-input:-webkit-autofill:hover,
        .glass-input:-webkit-autofill:focus {
          -webkit-text-fill-color: #ffffff;
          -webkit-box-shadow: 0 0 0px 1000px #260929 inset;
          transition: background-color 5000s ease-in-out 0s;
        }

        /* ช่อง OTP 6 หลัก */
        .otp-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px;
        }

        .otp-cell {
          width: 100%;
          height: 50px;
          text-align: center;
          font-size: 20px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
          transition: all 0.18s ease;
        }

        .otp-cell:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.14);
          border-color: #f472b6;
          box-shadow: 0 0 0 3px rgba(230, 21, 192, 0.25);
        }

        .otp-cell.has-error {
          border-color: #f87171;
          background: rgba(239, 68, 68, 0.12);
        }

        .password-wrapper {
          position: relative;
        }

        .password-wrapper .glass-input {
          padding-right: 46px;
        }

        .eye-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.52);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 4px;
          transition: color 0.15s ease;
        }

        .eye-btn:hover {
          color: #ffffff;
        }

        .field-error {
          display: block;
          font-size: 12px;
          color: #fca5a5;
          margin-top: 6px;
        }

        .rules-list {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin-top: 10px;
        }

        .rule-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          color: rgba(255, 255, 255, 0.52);
          transition: color 0.15s ease;
        }

        .rule-item.is-valid {
          color: #4ade80;
        }

        .submit-btn {
          width: 100%;
          height: 48px;
          margin-top: 6px;
          border-radius: 12px;
          border: none;
          background: #ffffff;
          color: #240020;
          font-size: 15.5px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          transition: transform 0.12s ease, box-shadow 0.18s ease, background-color 0.18s ease;
        }

        .submit-btn:hover:not(:disabled) {
          background: #fdf2fa;
          transform: translateY(-1px);
          box-shadow: 0 12px 28px rgba(230, 21, 192, 0.38);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .btn-spinner {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2.5px solid rgba(102, 0, 89, 0.25);
          border-top-color: #660059;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* =========================================
           Tablet (หน้าจอกลาง >= 640px)
           ========================================= */
        @media (min-width: 640px) and (min-height: 561px) {
          .reset-container {
            padding: 28px;
          }

          .glass-card {
            max-width: 540px;
            padding: 44px 48px 48px;
          }
        }

        /* =========================================
           Desktop (หน้าจอใหญ่ >= 768px)
           ========================================= */
        @media (min-width: 768px) and (min-height: 561px) {
          .reset-container {
            padding: 36px;
          }

          .glass-card {
            max-width: 740px;
            min-height: 550px;
            border-radius: 32px;
            padding: 48px 72px 56px;
          }

          .card-header {
            margin-bottom: 30px;
          }

          .avatar-ring {
            width: 100px;
            height: 100px;
            margin-bottom: 18px;
          }

          .avatar-icon {
            width: 44px;
            height: 44px;
          }

          .card-title {
            font-size: 28px;
          }

          .card-subtitle {
            font-size: 15px;
          }

          .field-group {
            margin-bottom: 20px;
          }

          .field-label {
            font-size: 14px;
          }

          .glass-input {
            height: 50px;
            font-size: 15px;
          }

          .otp-cell {
            height: 54px;
            font-size: 22px;
          }

          .submit-btn {
            height: 50px;
            font-size: 16px;
          }
        }

        /* =========================================
           มือถือแนวนอน / หน้าจอเตี้ย
           ========================================= */
        @media (max-height: 560px) {
          .reset-container {
            padding: 12px;
          }
          .glass-card {
            max-width: 500px;
            padding: 20px 28px;
          }
          .card-top-bar {
            margin-bottom: 10px;
          }
          .card-header {
            margin-bottom: 12px;
          }
          .avatar-ring {
            width: 46px;
            height: 46px;
            margin-bottom: 8px;
          }
          .avatar-icon {
            width: 22px;
            height: 22px;
          }
          .field-group {
            margin-bottom: 10px;
          }
          .otp-cell {
            height: 40px;
            font-size: 16px;
          }
        }
      `}</style>

      <div className="bg-layer">
        <div className="world-map-bg" />
        <div className="scanlines-bg" />
      </div>

      <div className="glass-card">
        <div className="card-inner">
          {!isSuccess && (
            <div className="card-top-bar">
              {step === 1 ? (
                <Link to="/login" className="back-btn">
                  <ArrowLeft size={16} />
                  <span>Back to sign in</span>
                </Link>
              ) : (
                <button
                  type="button"
                  className="back-btn"
                  onClick={() => {
                    setStep(1);
                    setApiError('');
                    setErrors({});
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>Change email</span>
                </button>
              )}
              <span className="step-pill">Step {step} of 2</span>
            </div>
          )}

          <div className="card-header">
            <div className={`avatar-ring ${isSuccess ? 'is-success' : ''}`}>
              {isSuccess ? (
                <CheckCircle2 className="avatar-icon" strokeWidth={1.8} />
              ) : step === 1 ? (
                <KeyRound className="avatar-icon" strokeWidth={1.7} />
              ) : (
                <MailCheck className="avatar-icon" strokeWidth={1.7} />
              )}
            </div>

            <h1 className="card-title">
              {isSuccess
                ? 'Password updated'
                : step === 1
                ? 'Reset your password'
                : 'Check your email'}
            </h1>

            <p className="card-subtitle">
              {isSuccess ? (
                'Your password has been changed successfully. You can now sign in with your new credentials.'
              ) : step === 1 ? (
                'Enter your username and registered email address to receive a 6-digit verification code.'
              ) : (
                <>
                  We sent a 6-digit code to <strong>{values.email}</strong>
                </>
              )}
            </p>
          </div>

          {apiError && (
            <div className="error-banner" role="alert">
              {apiError}
            </div>
          )}

          {isSuccess ? (
            <button
              type="button"
              className="submit-btn"
              onClick={() => navigate('/login', { replace: true })}
            >
              Continue to sign in
            </button>
          ) : step === 1 ? (
            <form onSubmit={handleSendOtp} noValidate>
              <div className="field-group">
                <label htmlFor="username" className="field-label">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your username"
                  value={values.username}
                  onChange={onChange}
                  className={`glass-input ${errors.username ? 'has-error' : ''}`}
                />
                {errors.username && <span className="field-error">{errors.username}</span>}
              </div>

              <div className="field-group">
                <label htmlFor="email" className="field-label">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  value={values.email}
                  onChange={onChange}
                  className={`glass-input ${errors.email ? 'has-error' : ''}`}
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <button type="submit" className="submit-btn" disabled={isSendingOtp}>
                {isSendingOtp && <span className="btn-spinner" />}
                {isSendingOtp ? 'Sending code...' : 'Send verification code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} noValidate>
              <div className="field-group">
                <div className="field-label-row">
                  <label className="field-label">Verification code</label>
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={isSendingOtp || cooldown > 0}
                    className="resend-link"
                  >
                    {isSendingOtp
                      ? 'Sending...'
                      : cooldown > 0
                      ? `Resend in ${cooldown}s`
                      : 'Resend code'}
                  </button>
                </div>

                <div className="otp-grid" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      aria-label={`Digit ${index + 1}`}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className={`otp-cell ${errors.otp ? 'has-error' : ''}`}
                    />
                  ))}
                </div>
                {errors.otp && <span className="field-error">{errors.otp}</span>}
              </div>

              <div className="field-group">
                <label htmlFor="password" className="field-label">
                  New password
                </label>
                <div className="password-wrapper">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    value={values.password}
                    onChange={onChange}
                    className={`glass-input ${errors.password ? 'has-error' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="eye-btn"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>

              <div className="field-group">
                <label htmlFor="confirm" className="field-label">
                  Confirm new password
                </label>
                <div className="password-wrapper">
                  <input
                    id="confirm"
                    name="confirm"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Re-enter new password"
                    value={values.confirm}
                    onChange={onChange}
                    className={`glass-input ${errors.confirm ? 'has-error' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    className="eye-btn"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirm && <span className="field-error">{errors.confirm}</span>}

                <div className="rules-list">
                  <span className={`rule-item ${hasMinLength ? 'is-valid' : ''}`}>
                    {hasMinLength ? <Check size={13} /> : <ShieldCheck size={13} />}
                    At least {MIN_PASSWORD} characters
                  </span>
                  <span className={`rule-item ${isPasswordMatched ? 'is-valid' : ''}`}>
                    {isPasswordMatched ? <Check size={13} /> : <ShieldCheck size={13} />}
                    Passwords match
                  </span>
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading && <span className="btn-spinner" />}
                {isLoading ? 'Updating password...' : 'Reset password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}