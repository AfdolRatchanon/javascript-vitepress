# 14.1 Auth Flow Frontend — เชื่อมต่อ Login กับ Node.js Backend

> *"Authentication is the process of verifying who you are. Authorization is the process of verifying what you have access to."*
> — **Scott Hanselman**, Microsoft Developer Advocate

## เปรียบเทียบให้เห็นภาพ

🏢 **Auth Flow เหมือนระบบเข้า-ออกอาคารสำนักงาน** — พนักงานใหม่ต้องไป HR เพื่อ ลงทะเบียน (Register) รับบัตรพนักงาน (JWT Token) จากนั้นทุกครั้งที่จะเข้าประตู ก็แค่แสดงบัตร (ส่ง Token) รปภ.ตรวจบัตร (Server verify JWT) ถ้าบัตรถูกต้องก็เข้าได้ ถ้าบัตรหมดอายุก็ต้องขอใหม่ที่ HR (Refresh Token)

## JWT Flow ภาพรวม

> 📖 **อ่านเพิ่มเติม:** [JWT.io — Introduction](https://jwt.io/introduction)

การ Authentication แบบ JWT (JSON Web Token) ที่ใช้กับ React + Node.js มีขั้นตอนดังนี้:

```
1. User กรอก email + password → กด Login
2. React ส่ง POST /api/auth/login ไปที่ Node.js Backend
3. Backend ตรวจสอบ password (bcrypt.compare)
4. ถ้าถูกต้อง → Backend สร้าง JWT Token และส่งกลับมา
5. React เก็บ Token ไว้ใน localStorage หรือ Cookie
6. ทุก Request ต่อไป → React แนบ Token ใน Authorization Header
7. Backend ตรวจสอบ Token ทุกครั้ง
```

```
Frontend (React)              Backend (Node.js)
      │                              │
      │  POST /api/auth/login        │
      │  { email, password }         │
      │ ──────────────────────────> │
      │                              │  ตรวจสอบ password
      │  { token, user }             │  สร้าง JWT
      │ <────────────────────────── │
      │                              │
      │  เก็บ token ใน storage      │
      │                              │
      │  GET /api/profile            │
      │  Authorization: Bearer token │
      │ ──────────────────────────> │
      │                              │  ตรวจสอบ JWT
      │  { user data }               │
      │ <────────────────────────── │
```

## JWT Token เก็บที่ไหน? localStorage vs Cookie

> 📖 **อ่านเพิ่มเติม:** [OWASP — Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

นี่คือ debate ที่ถกเถียงกันมาก ทั้ง 2 วิธีมีข้อดีข้อเสีย:

| | localStorage | HttpOnly Cookie |
|:---|:---|:---|
| **ความง่าย** | ✅ อ่าน/เขียนง่ายจาก JS | ❌ ต้องตั้งค่าฝั่ง Server |
| **XSS Attack** | ❌ JS อื่นอ่านได้ถ้า XSS สำเร็จ | ✅ JS อ่านไม่ได้เลย (HttpOnly) |
| **CSRF Attack** | ✅ Cookie CSRF ไม่โจมตีได้ | ❌ ต้องใช้ CSRF Token |
| **Auto-send** | ❌ ต้องแนบ Header เอง | ✅ Browser ส่งอัตโนมัติ |
| **Mobile App** | ✅ ใช้ได้ดี | ❌ ซับซ้อนกว่า |
| **คอร์สนี้ใช้** | ✅ ใช้สำหรับความเรียบง่าย | — |

**สำหรับคอร์สนี้ใช้ localStorage เพราะเรียบง่ายและเห็นกระบวนการชัดเจน** ในโปรเจกต์ Production ที่ต้องการ Security สูงควรพิจารณา HttpOnly Cookie ร่วมกับ CSRF Protection

## สร้าง AuthContext — จัดการ Auth State

วิธีที่ดีที่สุดคือเก็บ Auth State ไว้ใน Context เพื่อให้ทุก Component เข้าถึงได้:

```jsx
// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

// สร้าง Context
const AuthContext = createContext(null)

// Provider — ครอบทั้งแอป
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)  // ตรวจสอบ token ตอน start

  // ตอน Mount — ตรวจสอบว่ามี Token ที่ยังใช้ได้อยู่ไหม
  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  // Login Function
  async function login(email, password) {
    const data = await authService.login(email, password)
    // เก็บ token และ user ใน localStorage
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  // Register Function
  async function register(userData) {
    const data = await authService.register(userData)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  // Logout Function
  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom Hook สำหรับใช้ Context
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth ต้องใช้ภายใน AuthProvider')
  return context
}
```

## authService — แยก API Calls ออกจาก Component

```javascript
// src/services/authService.js
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const authService = {
  // Login — ส่งข้อมูลไป Backend และรับ Token กลับมา
  async login(email, password) {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      password,
    })
    return response.data  // { token, user }
  },

  // Register — สมัครสมาชิกใหม่
  async register(userData) {
    const response = await axios.post(`${API_URL}/api/auth/register`, userData)
    return response.data  // { token, user }
  },

  // Get Profile — ดึงข้อมูลผู้ใช้ปัจจุบัน (ต้องส่ง Token)
  async getProfile() {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  },
}
```

## หน้า Login Component

```jsx
// src/pages/LoginPage.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')  // ไปหน้า Dashboard หลัง Login สำเร็จ
    } catch (err) {
      // Backend ส่ง Error message มา
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f7fafc' }}>
      <form
        onSubmit={handleSubmit}
        style={{ backgroundColor: 'white', padding: 32, borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '100%', maxWidth: 400 }}
      >
        <h1 style={{ textAlign: 'center', marginBottom: 24 }}>🔐 เข้าสู่ระบบ</h1>

        {/* Error Message */}
        {error && (
          <div style={{ backgroundColor: '#FED7D7', color: '#C53030', padding: '10px 16px', borderRadius: 6, marginBottom: 16, fontSize: '0.9rem' }}>
            ❌ {error}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>อีเมล</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #E2E8F0', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>รหัสผ่าน</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #E2E8F0', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%', padding: '12px', borderRadius: 6, border: 'none',
            backgroundColor: isLoading ? '#a0aec0' : '#4299E1',
            color: 'white', fontSize: '1rem', fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? '⏳ กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 16, color: '#718096' }}>
          ยังไม่มีบัญชี? <Link to="/register">สมัครสมาชิก</Link>
        </p>
      </form>
    </div>
  )
}
```

## เชื่อมทุกอย่างเข้าด้วยกันใน App

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { ProtectedRoute } from './components/ProtectedRoute'  // จะเรียนใน M15

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
```

> 💡 **เชื่อมกับ Node.js Course:** Backend API ที่ใช้ในโมดูลนี้สร้างจาก [Node.js Module 8: JWT Authentication](/node/08-01-jwt-auth) และ [Module 10: CORS & Security](/node/10-01-cors)

## ตัวอย่าง Real-World: Navbar ที่แสดงข้อมูลตาม Auth State

```jsx
// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 24px', backgroundColor: '#1a202c', color: 'white',
    }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem' }}>
        ⚛️ MyApp
      </Link>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {isAuthenticated ? (
          /* แสดงเมื่อ Login แล้ว */
          <>
            <span style={{ color: '#CBD5E0' }}>
              สวัสดี, {user.name} {user.role === 'admin' && '👑'}
            </span>
            <Link to="/dashboard" style={{ color: '#63B3ED' }}>Dashboard</Link>
            <button
              onClick={handleLogout}
              style={{ padding: '6px 16px', backgroundColor: '#E53E3E', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
            >
              ออกจากระบบ
            </button>
          </>
        ) : (
          /* แสดงเมื่อยังไม่ Login */
          <>
            <Link to="/login" style={{ color: '#63B3ED' }}>เข้าสู่ระบบ</Link>
            <Link to="/register" style={{ padding: '6px 16px', backgroundColor: '#4299E1', color: 'white', borderRadius: 4, textDecoration: 'none' }}>
              สมัครสมาชิก
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
```

## Challenges

### Challenge 1: Register Page
สร้างหน้า Register ที่รับ name, email, password, confirmPassword แล้วเรียก `authService.register()` ต้องมี validation ก่อน submit:

::: details ดูเฉลย
```jsx
export function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError('รหัสผ่านไม่ตรงกัน')
      return
    }
    setError('')
    setIsLoading(true)
    try {
      await register({ name: form.name, email: form.email, password: form.password })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'สมัครสมาชิกไม่สำเร็จ')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input name="name" value={form.name} onChange={handleChange} placeholder="ชื่อ" required />
      <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="อีเมล" required />
      <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="รหัสผ่าน" required />
      <input name="confirm" type="password" value={form.confirm} onChange={handleChange} placeholder="ยืนยันรหัสผ่าน" required />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
      </button>
    </form>
  )
}
```
:::

### Challenge 2: Persistent Login
เมื่อผู้ใช้ Refresh หน้า ควรยังคง Login อยู่ถ้า Token ยังไม่หมดอายุ อธิบายว่า AuthProvider ทำสิ่งนี้ได้อย่างไร?

::: details ดูเฉลย
ใน `AuthProvider` มี `useEffect` ที่ทำงานเมื่อ Mount:
```jsx
useEffect(() => {
  const token = localStorage.getItem('token')
  const savedUser = localStorage.getItem('user')
  if (token && savedUser) {
    setUser(JSON.parse(savedUser))  // Restore user จาก localStorage
  }
  setIsLoading(false)
}, [])
```
และมี `isLoading` state เพื่อป้องกัน Flash ของ "ยังไม่ Login" ก่อนตรวจสอบ Token เสร็จ ระหว่างที่ `isLoading = true` ให้แสดง Loading spinner แทน
:::

### Challenge 3: Auto Logout เมื่อ Token หมดอายุ
ถ้า Backend ส่งกลับมา 401 Unauthorized (เช่น Token หมดอายุ) React ควรทำอะไร? แนะนำวิธีจัดการ:

::: details ดูเฉลย
ใช้ **Axios Interceptor** (จะเรียนในบทถัดไป) เพื่อดักจับ Response 401 แล้วเรียก `logout()` อัตโนมัติ:

```javascript
// ใน axiosInstance.js
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token หมดอายุหรือ invalid
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'  // Redirect ไป Login
    }
    return Promise.reject(error)
  }
)
```
:::

### Challenge 4: Environment Variables
ทำไมถึงใช้ `import.meta.env.VITE_API_URL` แทนที่จะ hardcode URL ตรงๆ?

::: details ดูเฉลย
เพราะ URL ของ API ต่างกันในแต่ละ Environment:
- **Development:** `http://localhost:3000`
- **Production:** `https://api.myapp.com`

ถ้า hardcode จะต้องแก้โค้ดทุกครั้งที่ Deploy ใช้ `.env` แทน:

```env
# .env.development
VITE_API_URL=http://localhost:3000

# .env.production
VITE_API_URL=https://api.myapp.com
```

Vite ต้องการ prefix `VITE_` เพื่อให้ตัวแปร expose ออกไปใน Client-side code (ตัวแปรที่ไม่มี VITE_ จะถูกซ่อน)
:::

### Challenge 5: JWT Decode
JWT Token มี 3 ส่วนคืออะไร? และทำไมถึงไม่ควร Decode ด้วยตัวเองบนฝั่ง Client เพื่อตรวจสอบว่า Token ถูกต้องไหม?

::: details ดูเฉลย
JWT แบ่งเป็น 3 ส่วนคั่นด้วย `.`:
1. **Header** — Algorithm และ Token type (`{"alg":"HS256","typ":"JWT"}`)
2. **Payload** — ข้อมูล (user id, role, exp) — **เป็น Base64 ไม่ใช่ Encrypted!**
3. **Signature** — Hash ของ Header+Payload ด้วย Secret Key

ไม่ควร Decode บน Client เพื่อ "ตรวจสอบความถูกต้อง" เพราะ Payload อ่านได้โดยไม่ต้องรู้ Secret Key แต่การ verify ว่า Signature ถูกต้องจริงต้องใช้ Secret Key ซึ่งอยู่แค่ที่ Server!

Decode Client-side ได้เพื่อ **อ่านข้อมูล** (เช่น user id, role) แต่ให้ Server เป็นคนตรวจสอบความถูกต้องเสมอ
:::

## 📖 Glossary

| คำศัพท์ | ความหมาย |
|:--------|:---------|
| **JWT** | JSON Web Token — Token ที่เก็บข้อมูลแบบ Signed |
| **Authentication** | ตรวจสอบว่าคุณเป็นใคร (Login) |
| **Authorization** | ตรวจสอบว่าคุณมีสิทธิ์ทำอะไร |
| **Bearer Token** | รูปแบบ Authorization Header: `Bearer <token>` |
| **localStorage** | Browser Storage สำหรับเก็บข้อมูลแบบ Persistent |
| **HttpOnly Cookie** | Cookie ที่ JS อ่านไม่ได้ ปลอดภัยจาก XSS |
| **XSS** | Cross-Site Scripting — โจมตีด้วยการฝัง JS อันตรายในหน้าเว็บ |
| **CSRF** | Cross-Site Request Forgery — หลอกให้ Browser ส่ง Request โดยไม่รู้ตัว |
| **Payload** | ส่วนของ JWT ที่เก็บข้อมูล (Base64 encoded ไม่ encrypted) |
| **Signature** | Hash ที่ใช้ตรวจสอบว่า Token ไม่ถูกแก้ไข |
| **AuthContext** | Context สำหรับเก็บและแชร์ Auth State ทั่วแอป |
| **Persistent Login** | ยัง Login อยู่แม้ Refresh หน้า ด้วย localStorage |

👉 ไปต่อ: [14.2 Axios Interceptors — แนบ Token อัตโนมัติ](/react/14-02-axios-interceptors)
