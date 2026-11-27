// import { useState, useEffect } from 'react'
// import LoadingOverlay from './components/LoadingOverlay'
// import { Link, useNavigate } from '@/routes/router'
// import { useAuth } from '@/contexts/AuthContext'
// import logo from '@/assets/pea-logo.png'
// import phone from '@/assets/phone.svg'
// import './login.css'

// export default function LoginPage() {
//   const navigate = useNavigate();
//   const { login, user, isAuthenticated } = useAuth();

//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);

//   const [errors, setErrors] = useState({});
//   const [apiError, setApiError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     if (isAuthenticated && user) {
//       navigate(getRedirectPath(user.role), { replace: true });
//     }
//   }, [isAuthenticated, user, navigate]);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     if (isLoading) return;

//     const trimmedUsername = username.trim();
//     const nextErrors = {};
//     if (!trimmedUsername) nextErrors.username = 'Username is required';
//     if (!password) nextErrors.password = 'Password is required';

//     setErrors(nextErrors);
//     if (Object.keys(nextErrors).length) return;

//     try {
//       setIsLoading(true);
//       setApiError('');

//       const data = await login({
//         username: trimmedUsername,
//         password,
//         rememberMe,
//       });

//       navigate(getRedirectPath(data?.user?.role), { replace: true });
//     } catch (err) {
//       let msg = err.message
//       if (msg === 'invalid credentials') {
//         msg = lang === 'TH' ? 'ชื่อผู้ใช้งาน/อีเมล หรือรหัสผ่านไม่ถูกต้อง' : 'Invalid username/email or password'
//       } else if (msg === 'account is deactivated') {
//         msg = lang === 'TH' ? 'บัญชีผู้ใช้นี้ถูกปิดการใช้งาน (Deactivated)' : 'Account is deactivated'
//       }
//       setApiError(msg || (lang === 'TH' ? 'รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง' : 'Invalid credentials'))
//       setLoading(false)
//       setLoginStatus('loading')
//     }
//   };

//   return (
//     <div className="login-container">
//       <style>{`
//         .login-container * {
//           box-sizing: border-box;
//           margin: 0;
//           padding: 0;
//         }

//         .login-container {
//           position: relative;
//           min-height: 100vh;
//           min-height: 100dvh;
//           width: 100%;
//           overflow-x: hidden;
//           overflow-y: auto;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           padding: 20px;
//           background: linear-gradient(180deg, #660059 0%, #9c0985 50%, #e615c0 100%);
//           font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Prompt', sans-serif;
//           color: #ffffff;
//         }

//         .bg-layer {
//           position: fixed;
//           inset: 0;
//           pointer-events: none;
//           overflow: hidden;
//           z-index: 0;
//         }

//         .world-map-bg {
//           position: absolute;
//           inset: 0;
//           opacity: 0.3;
//           background-image: url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg');
//           background-position: center;
//           background-size: cover;
//           background-repeat: no-repeat;
//           mix-blend-mode: screen;
//           filter: invert(1) brightness(1.8);
//         }

//         .scanlines-bg {
//           position: absolute;
//           inset: 0;
//           opacity: 0.2;
//           background-image: repeating-linear-gradient(
//             to bottom,
//             transparent,
//             transparent 2px,
//             #ffffff 2px,
//             #ffffff 3px
//           );
//         }

//         /* Dark Frosted Glass Card */
//         .glass-card {
//           position: relative;
//           z-index: 10;
//           width: 100%;
//           max-width: 430px;
//           margin: auto;
//           border-radius: 28px;
//           background: rgba(16, 3, 18, 0.74);
//           backdrop-filter: blur(24px);
//           -webkit-backdrop-filter: blur(24px);
//           border: 1px solid rgba(255, 255, 255, 0.18);
//           box-shadow:
//             0 32px 64px -12px rgba(0, 0, 0, 0.6),
//             inset 0 1px 0 0 rgba(255, 255, 255, 0.24);
//           padding: 40px 28px 36px;
//           display: flex;
//           flex-direction: column;
//           justify-content: center;
//           transition: all 0.25s ease;
//         }

//         .card-inner {
//           width: 100%;
//           max-width: 420px;
//           margin: 0 auto;
//         }

//         .card-header {
//           text-align: center;
//           margin-bottom: 28px;
//         }

//         .avatar-ring {
//           width: 78px;
//           height: 78px;
//           margin: 0 auto 16px;
//           border-radius: 50%;
//           background: linear-gradient(145deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.04));
//           border: 1px solid rgba(255, 255, 255, 0.26);
//           box-shadow:
//             0 10px 25px rgba(0, 0, 0, 0.32),
//             inset 0 1px 0 rgba(255, 255, 255, 0.3);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: #ffffff;
//         }

//         .avatar-icon {
//           width: 34px;
//           height: 34px;
//         }

//         .card-title {
//           font-size: 24px;
//           font-weight: 700;
//           letter-spacing: -0.02em;
//           color: #ffffff;
//         }

//         .card-subtitle {
//           font-size: 14px;
//           color: rgba(255, 255, 255, 0.68);
//           margin-top: 6px;
//         }

//         .error-banner {
//           padding: 11px 14px;
//           margin-bottom: 18px;
//           border-radius: 12px;
//           background: rgba(239, 68, 68, 0.18);
//           border: 1px solid rgba(248, 113, 113, 0.45);
//           color: #fecaca;
//           font-size: 13px;
//           text-align: center;
//         }

//         .field-group {
//           margin-bottom: 18px;
//         }

//         .field-label {
//           display: block;
//           font-size: 13.5px;
//           font-weight: 500;
//           color: rgba(255, 255, 255, 0.88);
//           margin-bottom: 7px;
//         }

//         .glass-input {
//           width: 100%;
//           height: 46px;
//           padding: 0 16px;
//           border-radius: 12px;
//           border: 1px solid rgba(255, 255, 255, 0.18);
//           background: rgba(255, 255, 255, 0.08);
//           color: #ffffff;
//           font-size: 14.5px;
//           transition: border-color 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease;
//         }

//         .glass-input::placeholder {
//           color: rgba(255, 255, 255, 0.38);
//         }

//         .glass-input:focus {
//           outline: none;
//           background: rgba(255, 255, 255, 0.12);
//           border-color: #f472b6;
//           box-shadow: 0 0 0 3px rgba(230, 21, 192, 0.25);
//         }

//         .glass-input.has-error {
//           border-color: #f87171;
//           background: rgba(239, 68, 68, 0.1);
//         }

//         /* ป้องกัน Chrome Autofill เปลี่ยนพื้นหลังช่องเป็นสีขาวทึบ */
//         .glass-input:-webkit-autofill,
//         .glass-input:-webkit-autofill:hover,
//         .glass-input:-webkit-autofill:focus {
//           -webkit-text-fill-color: #ffffff;
//           -webkit-box-shadow: 0 0 0px 1000px #260929 inset;
//           transition: background-color 5000s ease-in-out 0s;
//         }

//         .password-wrapper {
//           position: relative;
//         }

//         .password-wrapper .glass-input {
//           padding-right: 46px;
//         }

//         .eye-btn {
//           position: absolute;
//           right: 14px;
//           top: 50%;
//           transform: translateY(-50%);
//           background: none;
//           border: none;
//           color: rgba(255, 255, 255, 0.52);
//           cursor: pointer;
//           display: flex;
//           align-items: center;
//           padding: 4px;
//           transition: color 0.15s ease;
//         }

//         .eye-btn:hover {
//           color: #ffffff;
//         }

//         .field-error {
//           display: block;
//           font-size: 12px;
//           color: #fca5a5;
//           margin-top: 6px;
//         }

//         .form-options {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           margin-top: 4px;
//           margin-bottom: 26px;
//           font-size: 13.5px;
//         }

//         .remember-label {
//           display: inline-flex;
//           align-items: center;
//           gap: 8px;
//           color: rgba(255, 255, 255, 0.78);
//           cursor: pointer;
//           user-select: none;
//         }

//         .remember-checkbox {
//           width: 16px;
//           height: 16px;
//           accent-color: #e615c0;
//           cursor: pointer;
//         }

//         .forgot-link {
//           color: #f9a8d4;
//           text-decoration: none;
//           font-weight: 500;
//           transition: color 0.15s ease;
//         }

//         .forgot-link:hover {
//           color: #ffffff;
//           text-decoration: underline;
//         }

//         .submit-btn {
//           width: 100%;
//           height: 48px;
//           border-radius: 12px;
//           border: none;
//           background: #ffffff;
//           color: #240020;
//           font-size: 15.5px;
//           font-weight: 700;
//           cursor: pointer;
//           display: inline-flex;
//           align-items: center;
//           justify-content: center;
//           gap: 8px;
//           box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
//           transition: transform 0.12s ease, box-shadow 0.18s ease, background-color 0.18s ease;
//         }

//         .submit-btn:hover:not(:disabled) {
//           background: #fdf2fa;
//           transform: translateY(-1px);
//           box-shadow: 0 12px 28px rgba(230, 21, 192, 0.38);
//         }

//         .submit-btn:active:not(:disabled) {
//           transform: translateY(0);
//         }

//         .submit-btn:disabled {
//           opacity: 0.65;
//           cursor: not-allowed;
//         }

//         .btn-spinner {
//           width: 18px;
//           height: 18px;
//           border-radius: 50%;
//           border: 2.5px solid rgba(102, 0, 89, 0.25);
//           border-top-color: #660059;
//           animation: spin 0.8s linear infinite;
//         }

//         @keyframes spin {
//           to {
//             transform: rotate(360deg);
//           }
//         }

//         /* =========================================
//            Tablet (หน้าจอกลาง >= 640px)
//            ========================================= */
//         @media (min-width: 640px) and (min-height: 561px) {
//           .login-container {
//             padding: 28px;
//           }

//           .glass-card {
//             max-width: 540px;
//             padding: 48px 48px;
//           }
//         }

//         /* =========================================
//            Desktop (หน้าจอใหญ่ >= 768px)
//            ========================================= */
//         @media (min-width: 768px) and (min-height: 561px) {
//           .login-container {
//             padding: 36px;
//           }

//           .glass-card {
//             max-width: 740px;
//             min-height: 550px;
//             border-radius: 32px;
//             padding: 56px 72px;
//           }

//           .card-header {
//             margin-bottom: 32px;
//           }

//           .avatar-ring {
//             width: 104px;
//             height: 104px;
//             margin-bottom: 20px;
//           }

//           .avatar-icon {
//             width: 46px;
//             height: 46px;
//           }

//           .card-title {
//             font-size: 28px;
//           }

//           .card-subtitle {
//             font-size: 15px;
//           }

//           .field-group {
//             margin-bottom: 20px;
//           }

//           .field-label {
//             font-size: 14px;
//           }

//           .glass-input {
//             height: 50px;
//             font-size: 15px;
//           }

//           .form-options {
//             font-size: 14px;
//             margin-bottom: 28px;
//           }

//           .submit-btn {
//             height: 50px;
//             font-size: 16px;
//           }
//         }

//         /* =========================================
//            มือถือแนวนอน / หน้าจอเตี้ย
//            ========================================= */
//         @media (max-height: 560px) {
//           .login-container {
//             padding: 12px;
//           }
//           .glass-card {
//             max-width: 480px;
//             padding: 22px 28px;
//           }
//           .card-header {
//             margin-bottom: 14px;
//           }
//           .avatar-ring {
//             width: 48px;
//             height: 48px;
//             margin-bottom: 8px;
//           }
//           .avatar-icon {
//             width: 24px;
//             height: 24px;
//           }
//           .field-group {
//             margin-bottom: 12px;
//           }
//           .form-options {
//             margin-bottom: 14px;
//           }
//         }
//       `}</style>

//       <div className="bg-layer">
//         <div className="world-map-bg" />
//         <div className="scanlines-bg" />
//       </div>

//       <div className="glass-card">
//         <div className="card-inner">
//           <div className="card-header">
//             <div className="avatar-ring">
//               <User className="avatar-icon" strokeWidth={1.7} />
//             </div>
//             <h1 className="card-title">Sign in</h1>
//             <p className="card-subtitle">Enter your credentials to continue</p>
//           </div>

//           {apiError && (
//             <div className="error-banner" role="alert">
//               {apiError}
//             </div>
//           )}

//           <form onSubmit={handleLogin} noValidate>
//             <div className="field-group">
//               <label htmlFor="username" className="field-label">
//                 Username
//               </label>
//               <input
//                 id="username"
//                 type="text"
//                 autoComplete="username"
//                 placeholder="Enter your username"
//                 value={username}
//                 onChange={(e) => {
//                   setUsername(e.target.value);
//                   setErrors((prev) => ({ ...prev, username: '' }));
//                   setApiError('');
//                 }}
//                 className={`glass-input ${errors.username ? 'has-error' : ''}`}
//               />
//               {errors.username && <span className="field-error">{errors.username}</span>}
//             </div>

//             <div className="field-group">
//               <label htmlFor="password" className="field-label">
//                 Password
//               </label>
//               <div className="password-wrapper">
//                 <input
//                   id="password"
//                   type={showPassword ? 'text' : 'password'}
//                   autoComplete="current-password"
//                   placeholder="Enter your password"
//                   value={password}
//                   onChange={(e) => {
//                     setPassword(e.target.value);
//                     setErrors((prev) => ({ ...prev, password: '' }));
//                     setApiError('');
//                   }}
//                   className={`glass-input ${errors.password ? 'has-error' : ''}`}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   aria-label={showPassword ? 'Hide password' : 'Show password'}
//                   className="eye-btn"
//                 >
//                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>
//               {errors.password && <span className="field-error">{errors.password}</span>}
//             </div>

//             <div className="form-options">
//               <label className="remember-label">
//                 <input
//                   type="checkbox"
//                   checked={rememberMe}
//                   onChange={(e) => setRememberMe(e.target.checked)}
//                   className="remember-checkbox"
//                 />
//                 <span>Remember me</span>
//               </label>

//               <Link to="/reset-password" className="forgot-link">
//                 Forgot password?
//               </Link>
//             </div>

//             <button type="submit" className="submit-btn" disabled={isLoading}>
//               {isLoading && <span className="btn-spinner" />}
//               {isLoading ? 'Signing in...' : 'Sign in'}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from 'react'
import { User, Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from '@/routes/router'
import { useAuth } from '@/contexts/AuthContext'
import './login.css'

// กำหนดเส้นทางหลังล็อกอินตาม role (ปรับแก้ path ให้ตรงกับระบบของคุณได้)
function getRedirectPath(role) {
  if (role === 'admin') return '/admin'
  return '/cases'
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, user, isAuthenticated } = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getRedirectPath(user.role), { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    if (isLoading) return

    const trimmedUsername = username.trim()
    const nextErrors = {}
    if (!trimmedUsername) nextErrors.username = 'Username is required'
    if (!password) nextErrors.password = 'Password is required'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    try {
      setIsLoading(true)
      setApiError('')

      const data = await login({
        username: trimmedUsername,
        password,
        rememberMe,
      })

      navigate(getRedirectPath(data?.user?.role), { replace: true })
    } catch (err) {
      let msg = err?.message || ''
      if (msg === 'invalid credentials') {
        msg = 'Invalid username/email or password'
      } else if (msg === 'account is deactivated') {
        msg = 'Account is deactivated'
      }
      setApiError(msg || 'Invalid username/email or password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <style>{`
        .login-container * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .login-container {
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
          padding: 40px 28px 36px;
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

        .card-header {
          text-align: center;
          margin-bottom: 28px;
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
        }

        .field-group {
          margin-bottom: 18px;
        }

        .field-label {
          display: block;
          font-size: 13.5px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.88);
          margin-bottom: 7px;
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

        .glass-input:-webkit-autofill,
        .glass-input:-webkit-autofill:hover,
        .glass-input:-webkit-autofill:focus {
          -webkit-text-fill-color: #ffffff;
          -webkit-box-shadow: 0 0 0px 1000px #260929 inset;
          transition: background-color 5000s ease-in-out 0s;
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

        .form-options {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 4px;
          margin-bottom: 26px;
          font-size: 13.5px;
        }

        .remember-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.78);
          cursor: pointer;
          user-select: none;
        }

        .remember-checkbox {
          width: 16px;
          height: 16px;
          accent-color: #e615c0;
          cursor: pointer;
        }

        .forgot-link {
          color: #f9a8d4;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.15s ease;
        }

        .forgot-link:hover {
          color: #ffffff;
          text-decoration: underline;
        }

        .submit-btn {
          width: 100%;
          height: 48px;
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

        @media (min-width: 640px) and (min-height: 561px) {
          .login-container {
            padding: 28px;
          }

          .glass-card {
            max-width: 540px;
            padding: 48px 48px;
          }
        }

        @media (min-width: 768px) and (min-height: 561px) {
          .login-container {
            padding: 36px;
          }

          .glass-card {
            max-width: 740px;
            min-height: 550px;
            border-radius: 32px;
            padding: 56px 72px;
          }

          .card-header {
            margin-bottom: 32px;
          }

          .avatar-ring {
            width: 104px;
            height: 104px;
            margin-bottom: 20px;
          }

          .avatar-icon {
            width: 46px;
            height: 46px;
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

          .form-options {
            font-size: 14px;
            margin-bottom: 28px;
          }

          .submit-btn {
            height: 50px;
            font-size: 16px;
          }
        }

        @media (max-height: 560px) {
          .login-container {
            padding: 12px;
          }
          .glass-card {
            max-width: 480px;
            padding: 22px 28px;
          }
          .card-header {
            margin-bottom: 14px;
          }
          .avatar-ring {
            width: 48px;
            height: 48px;
            margin-bottom: 8px;
          }
          .avatar-icon {
            width: 24px;
            height: 24px;
          }
          .field-group {
            margin-bottom: 12px;
          }
          .form-options {
            margin-bottom: 14px;
          }
        }
      `}</style>

      <div className="bg-layer">
        <div className="world-map-bg" />
        <div className="scanlines-bg" />
      </div>

      <div className="glass-card">
        <div className="card-inner">
          <div className="card-header">
            <div className="avatar-ring">
              <User className="avatar-icon" strokeWidth={1.7} />
            </div>
            <h1 className="card-title">Sign in</h1>
            <p className="card-subtitle">Enter your credentials to continue</p>
          </div>

          {apiError && (
            <div className="error-banner" role="alert">
              {apiError}
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>
            <div className="field-group">
              <label htmlFor="username" className="field-label">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setErrors((prev) => ({ ...prev, username: '' }))
                  setApiError('')
                }}
                className={`glass-input ${errors.username ? 'has-error' : ''}`}
              />
              {errors.username && <span className="field-error">{errors.username}</span>}
            </div>

            <div className="field-group">
              <label htmlFor="password" className="field-label">
                Password
              </label>
              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setErrors((prev) => ({ ...prev, password: '' }))
                    setApiError('')
                  }}
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

            <div className="form-options">
              <label className="remember-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="remember-checkbox"
                />
                <span>Remember me</span>
              </label>

              <Link to="/reset-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading && <span className="btn-spinner" />}
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}