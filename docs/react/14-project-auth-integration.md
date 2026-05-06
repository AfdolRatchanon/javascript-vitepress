# 🔐 Project 14: Auth System UI

> **โปรเจกต์นี้ฝึก:** AuthContext, Axios Interceptors, Login/Register Forms, Protected Routes preview, Auto Logout

## โจทย์

สร้างระบบ Auth UI ที่สมบูรณ์พร้อมใช้งานได้จริง ประกอบด้วย:

1. **Login Page** — ฟอร์ม Login พร้อม Error handling
2. **Register Page** — ฟอร์มสมัครสมาชิก
3. **Dashboard Page** — หน้าหลังจาก Login (แสดงข้อมูล User)
4. **Navbar** — แสดงชื่อผู้ใช้และปุ่ม Logout
5. **Auto Logout** — Logout อัตโนมัติเมื่อ Token หมดอายุ

## Setup

```bash
npm create vite@latest auth-demo -- --template react
cd auth-demo
npm install axios react-router-dom
```

สร้างไฟล์ `.env`:
```env
VITE_API_URL=http://localhost:3000
```

## โครงสร้างโปรเจกต์

```
src/
├── contexts/
│   └── AuthContext.jsx
├── lib/
│   └── axiosInstance.js
├── services/
│   └── authService.js
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   └── DashboardPage.jsx
├── components/
│   ├── Navbar.jsx
│   └── ProtectedRoute.jsx   ← จะสร้างในบทนี้อย่างง่าย
└── App.jsx
```

## งานที่ต้องทำ

### Task 1: axiosInstance.js + AuthContext.jsx
สร้างจากโค้ดในบท 14.1 และ 14.2

### Task 2: Login Page ที่มี Features เพิ่มเติม
- Show/Hide Password toggle
- "จำฉันไว้" checkbox (เก็บ email ใน localStorage)
- Link ไปหน้า Register
- Loading state ระหว่าง API Call

### Task 3: Register Page
- Validate: name ≥ 2 ตัว, email ถูกรูปแบบ, password ≥ 8 ตัว, confirm ตรงกัน
- แสดง Error inline แต่ละ field

### Task 4: Dashboard Page
- แสดงข้อมูล User จาก `useAuth().user`
- แสดงเวลา Login ล่าสุด
- ปุ่ม Edit Profile (Placeholder)

### Task 5: Simple Protected Route
```jsx
// ProtectedRoute อย่างง่าย — ถ้าไม่ Login Redirect ไป /login
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <div>กำลังโหลด...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}
```

## Solution

::: details ดูเฉลยฉบับสมบูรณ์

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Navbar } from './components/Navbar'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>⏳ กำลังตรวจสอบ...</p>
    </div>
  )
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
```

```jsx
// src/pages/LoginPage.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function LoginPage() {
  const [email, setEmail] = useState(localStorage.getItem('rememberedEmail') || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(!!localStorage.getItem('rememberedEmail'))
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (remember) localStorage.setItem('rememberedEmail', email)
    else localStorage.removeItem('rememberedEmail')

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 16px', backgroundColor: '#f7fafc', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ backgroundColor: 'white', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 40 }}>
          <h1 style={{ textAlign: 'center', marginBottom: 8, fontSize: '1.8rem' }}>🔐 เข้าสู่ระบบ</h1>
          <p style={{ textAlign: 'center', color: '#718096', marginBottom: 32 }}>ยินดีต้อนรับกลับมา!</p>

          {error && (
            <div style={{ backgroundColor: '#FED7D7', border: '1px solid #FC8181', color: '#C53030', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: '0.9rem' }}>
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>อีเมล</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: '1rem', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>รหัสผ่าน</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: '1rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #E2E8F0', backgroundColor: 'white', cursor: 'pointer' }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem' }}>
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
              จำฉันไว้ในอุปกรณ์นี้
            </label>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '12px', borderRadius: 8, border: 'none',
                backgroundColor: isLoading ? '#A0AEC0' : '#4299E1',
                color: 'white', fontSize: '1rem', fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
              }}
            >
              {isLoading ? '⏳ กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, color: '#718096', fontSize: '0.9rem' }}>
            ยังไม่มีบัญชี? <Link to="/register" style={{ color: '#4299E1', fontWeight: 600 }}>สมัครสมาชิก</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
```

```jsx
// src/pages/DashboardPage.jsx
import { useAuth } from '../contexts/AuthContext'

export function DashboardPage() {
  const { user } = useAuth()

  const loginTime = new Date().toLocaleString('th-TH')

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 16px' }}>
      <div style={{ backgroundColor: 'white', borderRadius: 12, padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            backgroundColor: '#4299E1', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 'bold',
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ margin: 0 }}>สวัสดี, {user?.name}! 👋</h1>
            <p style={{ margin: 0, color: '#718096' }}>{user?.email}</p>
            {user?.role === 'admin' && <span style={{ backgroundColor: '#553C9A', color: 'white', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem' }}>👑 Admin</span>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { label: 'บัญชีผู้ใช้', value: `#${user?.id}`, icon: '🆔' },
            { label: 'สถานะ', value: 'Active', icon: '✅' },
            { label: 'Login ล่าสุด', value: loginTime, icon: '🕐' },
          ].map(item => (
            <div key={item.label} style={{ backgroundColor: '#F7FAFC', borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{item.icon}</div>
              <div style={{ fontSize: '0.8rem', color: '#718096' }}>{item.label}</div>
              <div style={{ fontWeight: 600, marginTop: 2 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ backgroundColor: '#EBF8FF', borderRadius: 12, padding: 24, border: '1px solid #BEE3F8' }}>
        <h3 style={{ margin: '0 0 8px' }}>🎉 คุณ Login สำเร็จแล้ว!</h3>
        <p style={{ margin: 0, color: '#2B6CB0' }}>
          Token ถูกเก็บใน localStorage และ Axios Interceptors จะแนบไปกับทุก API Request อัตโนมัติ
        </p>
      </div>
    </div>
  )
}
```
:::

## เกณฑ์การประเมิน

| เกณฑ์ | คะแนน |
|:------|:------:|
| Login Form ทำงานได้ (เชื่อม API หรือ Mock) | 25 |
| Register Form มี Validation ครบ | 25 |
| AuthContext เก็บและ restore user ได้ | 20 |
| Axios Instance มี Interceptors | 15 |
| Protected Route ทำงาน redirect ได้ | 15 |
| **รวม** | **100** |

## Mock Backend (ถ้าไม่มี Node.js Backend)

ถ้ายังไม่มี Backend ให้ Mock ใน AuthContext:

```javascript
async function login(email, password) {
  // Mock — ตรวจสอบในฝั่ง Client (ใช้แค่สำหรับทดสอบ!)
  await new Promise(resolve => setTimeout(resolve, 800))  // จำลองความล่าช้า

  if (email === 'admin@test.com' && password === '1234') {
    const fakeToken = 'fake-jwt-token-' + Date.now()
    const fakeUser = { id: 1, name: 'Admin User', email, role: 'admin' }
    localStorage.setItem('token', fakeToken)
    localStorage.setItem('user', JSON.stringify(fakeUser))
    setUser(fakeUser)
    return { token: fakeToken, user: fakeUser }
  }

  throw { response: { data: { message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' } } }
}
```

👉 ไปต่อ: [Module 15: Protected Routes & Security](/react/15-01-route-guards)
