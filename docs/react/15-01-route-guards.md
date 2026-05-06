# 15.1 Route Guards — Protected Routes ใน React

> *"Security is not a product, but a process."*
> — **Bruce Schneier**, Security Technologist

## เปรียบเทียบให้เห็นภาพ

🏰 **Protected Route เหมือนประตูปราสาทที่มี Drawbridge** — คนทั่วไปเข้าได้แค่ถึงสะพาน แต่จะข้ามเข้าปราสาทได้ต้องแสดงตราประทับ (Token) ถ้าไม่มีจะถูก Redirect ไปที่ประตูรับรอง (Login Page) โดยอัตโนมัติ และหลังจาก Login สำเร็จจะถูกพาไปยังหน้าที่ต้องการในตอนแรก

## Protected Route คืออะไร?

> 📖 **อ่านเพิ่มเติม:** [React Router — Auth Tutorial](https://reactrouter.com/6.28.0/start/tutorial)

**Protected Route** (หรือ Route Guard) คือ Component ที่ตรวจสอบว่าผู้ใช้ Login หรือยัง ก่อนอนุญาตให้เข้าถึงหน้านั้น ถ้ายังไม่ Login จะ Redirect ไปหน้า Login ทันที

ปัญหาที่แก้: ถ้าไม่มี Protected Route ผู้ใช้สามารถพิมพ์ URL ตรงๆ เพื่อข้ามการ Login ได้:

```
ผู้ใช้พิมพ์: http://localhost:5173/admin
→ ถ้าไม่มี Guard: เข้าได้เลย! 😱
→ ถ้ามี Guard: Redirect ไป /login ✅
```

## สร้าง ProtectedRoute Component

```jsx
// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()  // จำ Path ปัจจุบัน

  // ระหว่างตรวจสอบ Token — แสดง Loading แทน Redirect ทันที
  // (ป้องกัน Flash ของหน้า Login ก่อนรู้ว่า User Login อยู่จริงๆ)
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>⏳ กำลังตรวจสอบสิทธิ์...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Redirect ไป Login พร้อมบันทึก Path ที่ต้องการ
    // เมื่อ Login สำเร็จจะ Redirect กลับมาที่นี่
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
```

## กลับไปหน้าที่ต้องการหลัง Login

เมื่อส่ง <code v-pre>state={{ from: location }}</code> ไปกับ `<Navigate>` เราสามารถอ่านค่านั้นใน LoginPage เพื่อ Redirect กลับ:

```jsx
// src/pages/LoginPage.jsx
import { useNavigate, useLocation } from 'react-router-dom'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  // location.state?.from คือ path ที่ผู้ใช้ต้องการก่อน Redirect
  const from = location.state?.from?.pathname || '/dashboard'

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await login(email, password)
      // Redirect กลับไปหน้าที่ต้องการ แทนที่จะไป /dashboard เสมอ
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ')
    }
  }

  // ... rest of component
}
```

ตัวอย่างการทำงาน:
```
1. User ไม่ Login → พิมพ์ URL: /admin/users
2. ProtectedRoute Redirect ไป /login
   (พร้อม state: { from: { pathname: '/admin/users' } })
3. User Login สำเร็จ
4. LoginPage อ่าน state.from → Redirect กลับไป /admin/users ✅
```

## การใช้งานใน App Router

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes — ทุกคนเข้าได้ */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes — ต้อง Login */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Protected + Role Routes — จะเรียนในบทถัดไป */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
```

## Layout Route กับ Protected Routes

วิธีที่ Elegant กว่าคือใช้ **Layout Route** เพื่อครอบ Protected Routes ทั้งหมด:

```jsx
// src/components/AuthLayout.jsx — Layout สำหรับหน้าที่ต้อง Login
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: 24 }}>
          <Outlet />  {/* หน้า Child จะ Render ที่นี่ */}
        </main>
      </div>
    </div>
  )
}

// ใช้งานใน App
function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes — ครอบด้วย AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
```

## Public-Only Routes (Redirect ถ้า Login แล้ว)

บางหน้าอย่าง Login, Register ถ้า Login แล้วไม่ควรเข้าได้:

```jsx
// src/components/PublicOnlyRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function PublicOnlyRoute({ children, redirectTo = '/dashboard' }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return null

  // ถ้า Login แล้ว Redirect ไปหน้าหลัก
  if (isAuthenticated) return <Navigate to={redirectTo} replace />

  return children
}

// ใช้งาน
<Route
  path="/login"
  element={
    <PublicOnlyRoute>
      <LoginPage />
    </PublicOnlyRoute>
  }
/>
```

## ตัวอย่าง Real-World: Route Config แบบ Declarative

```jsx
// src/router/routeConfig.js
// ประกาศ Route ทั้งหมดเป็น Config (แยกออกจาก JSX)
export const routes = [
  // Public
  { path: '/', element: <HomePage />, public: true },
  { path: '/login', element: <LoginPage />, publicOnly: true },
  { path: '/register', element: <RegisterPage />, publicOnly: true },

  // Protected
  { path: '/dashboard', element: <DashboardPage />, protected: true },
  { path: '/profile', element: <ProfilePage />, protected: true },

  // Admin Only
  { path: '/admin', element: <AdminPage />, protected: true, roles: ['admin'] },
]

// src/App.jsx
function App() {
  return (
    <Routes>
      {routes.map(({ path, element, ...flags }) => {
        let wrappedElement = element

        if (flags.roles) {
          wrappedElement = <RoleRoute roles={flags.roles}>{element}</RoleRoute>
        } else if (flags.protected) {
          wrappedElement = <ProtectedRoute>{element}</ProtectedRoute>
        } else if (flags.publicOnly) {
          wrappedElement = <PublicOnlyRoute>{element}</PublicOnlyRoute>
        }

        return <Route key={path} path={path} element={wrappedElement} />
      })}
    </Routes>
  )
}
```

## Challenges

### Challenge 1: สร้าง ProtectedRoute
ทำไม ProtectedRoute ต้องมี `isLoading` check ก่อน `isAuthenticated` check?

::: details ดูเฉลย
ถ้าไม่มี `isLoading` check: เมื่อหน้าเว็บ Refresh, AuthProvider จะเริ่ม `isAuthenticated = false` ก่อน (ค่า default) ในขณะที่กำลังอ่านจาก localStorage

ทำให้เกิด **Flash** — ProtectedRoute เห็น `isAuthenticated = false` → Redirect ไป Login ทันที แต่แล้ว localStorage ก็อ่านเสร็จ user กลับมา แต่สายเกินไปแล้ว!

`isLoading = true` ในระหว่างตรวจสอบ ทำให้ ProtectedRoute รอก่อน ไม่ Redirect จนกว่าจะรู้แน่ว่า Login หรือเปล่า
:::

### Challenge 2: Nested Protected Routes
เพิ่ม Route `/settings/profile` และ `/settings/security` ที่ต้อง Login ทั้งคู่ ให้ใช้ Layout Route แทนการครอบแยกทีละ Route:

::: details ดูเฉลย
```jsx
<Routes>
  <Route element={<ProtectedLayout />}>
    <Route path="/settings" element={<SettingsPage />}>
      <Route path="profile" element={<ProfileSettings />} />
      <Route path="security" element={<SecuritySettings />} />
      <Route index element={<Navigate to="profile" replace />} />
    </Route>
  </Route>
</Routes>

function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}
```
:::

### Challenge 3: Remember Me + Redirect
เมื่อ Login สำเร็จ ให้ Redirect กลับไปหน้าที่ผู้ใช้ต้องการ (ใช้ `useLocation().state?.from`):

::: details ดูเฉลย
```jsx
function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  async function handleLogin(email, password) {
    await login(email, password)
    navigate(from, { replace: true })
  }
}
```
:::

### Challenge 4: Loading Screen
สร้าง `<LoadingScreen>` ที่สวยงามแสดง Spinner + ข้อความ "กำลังตรวจสอบ..."

::: details ดูเฉลย
```jsx
function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: 16,
    }}>
      <div style={{
        width: 48,
        height: 48,
        border: '4px solid #e2e8f0',
        borderTop: '4px solid #4299E1',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: '#718096' }}>กำลังตรวจสอบสิทธิ์...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
```
:::

### Challenge 5: useRequireAuth Custom Hook
สร้าง Custom Hook `useRequireAuth` ที่เรียกใน Component แล้ว Redirect ถ้าไม่ Login:

::: details ดูเฉลย
```jsx
// src/hooks/useRequireAuth.js
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function useRequireAuth(redirectTo = '/login') {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo])

  return { isAuthenticated, isLoading }
}

// ใช้งาน
function DashboardPage() {
  const { isLoading } = useRequireAuth()
  if (isLoading) return <LoadingScreen />
  return <div>Dashboard</div>
}
```
:::

## 📖 Glossary

| คำศัพท์ | ความหมาย |
|:--------|:---------|
| **Protected Route** | Route ที่ต้อง Login ถึงจะเข้าได้ |
| **Route Guard** | อีกชื่อหนึ่งของ Protected Route |
| **Navigate** | Component ใน React Router สำหรับ Redirect |
| **replace** | `navigate(..., { replace: true })` — ไม่เพิ่มใน History Stack |
| **useLocation** | Hook สำหรับอ่านข้อมูล URL ปัจจุบัน (path, state, search) |
| **location.state** | ข้อมูลที่ส่งไปพร้อม Redirect ด้วย `state` prop |
| **Flash** | ภาพที่กระพริบชั่วขณะก่อนที่ React ตรวจสอบ Auth เสร็จ |
| **isLoading** | State ที่บอกว่ากำลัง Check Auth อยู่ (ป้องกัน Flash) |
| **Layout Route** | Route ที่ใช้ `<Outlet>` ให้ Child Routes Render ข้างใน |
| **Outlet** | จุดที่ Child Routes จะ Render ใน Layout Route |
| **publicOnly** | Route ที่ Login แล้วไม่ควรเข้า (เช่น Login Page) |

👉 ไปต่อ: [15.2 Role-based Access Control](/react/15-02-role-based-access)
