import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/app/App'
import { AuthProvider } from '@/contexts/AuthContext'
import '@/styles/global.css'
import '@/styles/auth.css'
import '@/styles/welcome.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
