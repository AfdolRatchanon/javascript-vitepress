# 16.1 Code Splitting — โหลดโค้ดเฉพาะที่จำเป็น

> *"Premature optimization is the root of all evil — but that doesn't mean we should be naive."*
> — **Donald Knuth** (ต้องรู้ว่าเมื่อไหร่และตรงไหนที่ควร Optimize)

## เปรียบเทียบให้เห็นภาพ

📦 **ลองนึกภาพสั่งพิซซ่าจากร้าน** — ถ้าสั่งพิซซ่าทุกหน้าในเมนูมากินก่อนแล้วค่อยดูว่าอยากกินอะไร นั่นคือ Bundle แบบไม่ Split ทุก JavaScript ถูก Download มาหมดตั้งแต่เปิดหน้าเว็บ Code Splitting คือการสั่งเฉพาะที่ต้องการ — โหลด Code สำหรับ Dashboard เมื่อผู้ใช้ไปหน้า Dashboard ไม่ใช่ตั้งแต่แรก

## ปัญหาของ Bundle ก้อนเดียว

> 📖 **อ่านเพิ่มเติม:** [React — Code Splitting](https://react.dev/reference/react/lazy)

เมื่อ `npm run build` โดยไม่มี Code Splitting จะได้ JavaScript ไฟล์เดียวขนาดใหญ่ที่ต้อง Download ทั้งหมดก่อนเว็บจะแสดงได้:

```
dist/
└── assets/
    └── index-ABC123.js   ← 2MB! ผู้ใช้ต้องรอโหลดทั้งหมดก่อนเห็นอะไร
```

ผลกระทบ:
- **First Load ช้า** — ต้อง Download JavaScript ทั้งหมดก่อน
- **Parse Time สูง** — Browser ต้องแปลง JS ขนาดใหญ่
- **ผู้ใช้บน 3G** — รอนาน 10-20 วินาที กด Back ทิ้งแล้ว

หลัง Code Splitting:
```
dist/
└── assets/
    ├── index-ABC123.js     ← 200KB (เฉพาะ Core)
    ├── dashboard-DEF456.js ← 300KB (โหลดเมื่อไปหน้า Dashboard)
    ├── admin-GHI789.js     ← 400KB (โหลดเมื่อ Admin เข้าหน้า Admin)
    └── charts-JKL012.js    ← 500KB (โหลดเมื่อต้องแสดง Chart)
```

## React.lazy + Suspense

`React.lazy()` ทำให้ Import Component แบบ Dynamic (โหลดเมื่อต้องการ) ใช้คู่กับ `<Suspense>` ที่แสดง Fallback ระหว่างรอโหลด:

```jsx
// src/App.jsx
import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

// ❌ Import แบบปกติ — โหลดทั้งหมดตั้งแต่แรก
// import DashboardPage from './pages/DashboardPage'
// import AdminPage from './pages/AdminPage'

// ✅ Dynamic Import — โหลดเฉพาะเมื่อ Route นั้นถูกเยี่ยมชม
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))

// Loading Component
function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: 12,
    }}>
      <div style={{
        width: 32,
        height: 32,
        border: '3px solid #E2E8F0',
        borderTop: '3px solid #4299E1',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ color: '#718096' }}>กำลังโหลดหน้า...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

function App() {
  return (
    // Suspense ครอบ Routes ทั้งหมด — แสดง Fallback ระหว่าง Lazy Load
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<HomePage />} />   {/* โหลดทันที */}
        <Route path="/dashboard" element={<DashboardPage />} />  {/* Lazy */}
        <Route path="/admin" element={<AdminPage />} />          {/* Lazy */}
        <Route path="/profile" element={<ProfilePage />} />      {/* Lazy */}
        <Route path="/analytics" element={<AnalyticsPage />} />  {/* Lazy */}
      </Routes>
    </Suspense>
  )
}
```

## Multiple Suspense Boundaries

ใช้ `<Suspense>` หลายจุดเพื่อ UX ที่ดีกว่า:

```jsx
function DashboardPage() {
  // Lazy load Chart Library (ขนาดใหญ่มาก!)
  const SalesChart = lazy(() => import('../components/SalesChart'))
  const RevenueChart = lazy(() => import('../components/RevenueChart'))

  return (
    <div>
      <h1>Dashboard</h1>

      {/* แสดง Stats ก่อนทันที (ไม่ต้องรอ Chart) */}
      <StatsGrid />

      {/* Chart โหลดแยก — แสดง Skeleton ระหว่างรอ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Suspense fallback={<ChartSkeleton />}>
          <SalesChart />
        </Suspense>

        <Suspense fallback={<ChartSkeleton />}>
          <RevenueChart />
        </Suspense>
      </div>
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div style={{
      height: 300,
      backgroundColor: '#F7FAFC',
      borderRadius: 8,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'pulse 1.5s ease-in-out infinite',
    }}>
      <span style={{ color: '#CBD5E0' }}>📊 กำลังโหลดกราฟ...</span>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }`}</style>
    </div>
  )
}
```

## Prefetching — โหลดล่วงหน้า

บางครั้งต้องการโหลด Chunk ล่วงหน้าก่อนที่ User จะไปถึง เพื่อให้ไม่มี Loading เลย:

```jsx
// Prefetch เมื่อ User Hover บน Link
function NavLink({ to, children }) {
  const handleMouseEnter = () => {
    // Dynamic Import ล่วงหน้าเมื่อ Hover — Browser จะ Cache ไว้
    import(`../pages/${to}Page`)
  }

  return (
    <Link to={`/${to}`} onMouseEnter={handleMouseEnter}>
      {children}
    </Link>
  )
}

// หรือใช้ Vite's import() with magic comments
const AdminPage = lazy(() =>
  import(/* webpackPrefetch: true */ './pages/AdminPage')
)
```

## Route-based vs Component-based Splitting

| | Route-based | Component-based |
|:---|:---|:---|
| **แบ่งตาม** | หน้า (Route) | Component ขนาดใหญ่ |
| **ง่ายต่อการใช้** | ✅ มากกว่า | ❌ ต้องวางแผนมากกว่า |
| **เหมาะกับ** | ส่วนใหญ่ของแอป | Chart Library, Editor, Modal ซับซ้อน |
| **ตัวอย่าง** | `/dashboard`, `/admin` | `<RichTextEditor>`, `<DataTable>` |

```jsx
// Route-based (แนะนำสำหรับ React Router)
const DashboardPage = lazy(() => import('./pages/DashboardPage'))

// Component-based (เฉพาะ Component ที่ใช้ Library ขนาดใหญ่)
const RichTextEditor = lazy(() => import('./components/RichTextEditor'))
// เมื่อ Editor ไม่ได้ใช้ทุกหน้า — โหลดเฉพาะหน้าที่ต้องการ
```

## วัดผล Bundle Size

```bash
# Build แล้วดูขนาด
npm run build

# ใช้ vite-bundle-visualizer เพื่อดูกราฟ
npm install --save-dev rollup-plugin-visualizer

# vite.config.js
import { visualizer } from 'rollup-plugin-visualizer'

export default {
  plugins: [visualizer({ open: true })]
}
```

## ตัวอย่าง Real-World: App ที่ Optimize แล้ว

```jsx
// src/App.jsx — ตัวอย่าง Production-ready
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'

// Pages ที่ใช้บ่อย — โหลดทันที
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'

// Pages หนักๆ — Lazy Load
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

// Fallback Loading
function AppLoader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: '3rem', animation: 'spin 1s linear infinite' }}>⚛️</div>
      <p style={{ color: '#718096' }}>กำลังโหลด...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<AppLoader />}>
          <Routes>
            {/* Eager Load — Core Pages */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Lazy Load — Feature Pages */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/admin/*" element={<AdminPage />} />
            <Route path="/settings/*" element={<SettingsPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
```

## Challenges

### Challenge 1: แปลง Import
แปลง Import ด้านล่างให้เป็น Lazy Loading และเพิ่ม Suspense:

```jsx
import Dashboard from './pages/Dashboard'
import Reports from './pages/Reports'
import UserManagement from './pages/UserManagement'

function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/users" element={<UserManagement />} />
    </Routes>
  )
}
```

::: details ดูเฉลย
```jsx
import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Reports = lazy(() => import('./pages/Reports'))
const UserManagement = lazy(() => import('./pages/UserManagement'))

function LoadingFallback() {
  return <div>กำลังโหลด...</div>
}

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/users" element={<UserManagement />} />
      </Routes>
    </Suspense>
  )
}
```
:::

### Challenge 2: Skeleton UI
สร้าง `<PageSkeleton>` Component ที่แสดง Placeholder ขณะโหลดหน้า (สวยงามกว่าแค่ "Loading..."):

::: details ดูเฉลย
```jsx
function PageSkeleton() {
  const shimmer = {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  }

  return (
    <div style={{ padding: 24 }}>
      <style>{`@keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }`}</style>
      {/* Header skeleton */}
      <div style={{ ...shimmer, height: 32, width: '40%', borderRadius: 4, marginBottom: 24 }} />
      {/* Cards skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ ...shimmer, height: 100, borderRadius: 8 }} />
        ))}
      </div>
      {/* Content skeleton */}
      {[...Array(3)].map((_, i) => (
        <div key={i} style={{ ...shimmer, height: 20, borderRadius: 4, marginBottom: 12, width: `${90 - i * 10}%` }} />
      ))}
    </div>
  )
}
```
:::

### Challenge 3: เมื่อไหร่ควร Lazy Load?
จากรายการด้านล่าง อันไหนควร Lazy Load และอันไหนไม่ควร?

```
1. Login Page (เปิดมาหน้าแรก)
2. Admin Settings (เข้าถึงได้แค่ Admin)
3. Navbar Component
4. PDF Export Modal (ใช้ Library ขนาดใหญ่)
5. Error Boundary Component
6. Analytics Dashboard
```

::: details ดูเฉลย
| Component | Lazy? | เหตุผล |
|:----------|:------|:--------|
| Login Page | ❌ (หรือ ✅ แล้วแต่) | ถ้าเป็น Entry Point หลักอาจ Eager Load ได้ แต่ถ้าแอปเริ่มที่ Dashboard ก็ Lazy ได้ |
| Admin Settings | ✅ ควร | เข้าได้แค่ Admin — ไม่จำเป็นสำหรับ User ทั่วไป |
| Navbar | ❌ ไม่ควร | แสดงทุกหน้า ควร Eager Load |
| PDF Export Modal | ✅ ควร | Library หนัก ใช้แค่ตอน Export |
| Error Boundary | ❌ ไม่ควร | ต้องพร้อมทันทีเมื่อเกิด Error |
| Analytics Dashboard | ✅ ควร | หน้าหนัก ใช้ Chart Library |
:::

### Challenge 4: Error ใน Lazy Component
ถ้า Network ขาดระหว่าง Load Lazy Component จะเกิดอะไร? และแก้ไขอย่างไร?

::: details ดูเฉลย
จะเกิด JavaScript Error → ทำให้ App พัง (Crash) ต้องใช้ **Error Boundary**:

```jsx
import { Component } from 'react'

class LazyErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <p>❌ โหลดหน้าไม่สำเร็จ ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต</p>
          <button onClick={() => window.location.reload()}>🔄 โหลดใหม่</button>
        </div>
      )
    }
    return this.props.children
  }
}

// ใช้งาน
<LazyErrorBoundary>
  <Suspense fallback={<PageLoader />}>
    <LazyPage />
  </Suspense>
</LazyErrorBoundary>
```
:::

### Challenge 5: ผลลัพธ์ของ Code Splitting
ถ้าแอปมี 5 หน้า แต่ละหน้า 200KB หลังจาก Code Splitting ขนาด Bundle ที่โหลดครั้งแรกจะเปลี่ยนอย่างไร?

::: details ดูเฉลย
- **ก่อน Code Splitting:** โหลด 5 × 200KB = **1MB** ตั้งแต่เปิดเว็บ
- **หลัง Code Splitting:** โหลดแค่หน้าแรก ≈ **200KB** + Core Bundle (~50KB)

ผู้ใช้รอน้อยลง 80%! ส่วนที่เหลือ (800KB) โหลดเมื่อผู้ใช้เข้าหน้านั้นจริงๆ ซึ่งระหว่างนั้นก็มี Suspense แสดง Loading ให้ UX ดีอยู่
:::

## 📖 Glossary

| คำศัพท์ | ความหมาย |
|:--------|:---------|
| **Code Splitting** | แบ่ง JavaScript Bundle ออกเป็น Chunk ย่อยๆ |
| **Lazy Loading** | โหลด Resource เมื่อต้องการ ไม่ใช่ตั้งแต่แรก |
| **React.lazy** | Function สำหรับ Import Component แบบ Dynamic |
| **Suspense** | Component ที่แสดง Fallback ระหว่าง Lazy Load |
| **Dynamic Import** | `import()` แบบ Function — โหลดตอน Runtime |
| **Chunk** | ส่วนของ JavaScript ที่แบ่งออกจาก Bundle หลัก |
| **Bundle** | JavaScript ทั้งหมดที่รวมเป็นไฟล์เดียว |
| **Eager Loading** | โหลดทันทีตั้งแต่เริ่มต้น (ปกติ) |
| **Prefetching** | โหลดล่วงหน้าก่อนที่จะต้องการ |
| **Skeleton** | Placeholder UI ระหว่างรอ Content โหลด |
| **Error Boundary** | Component ที่ดัก Error ใน Child Component Tree |
| **First Load** | ขนาด JS ที่โหลดครั้งแรก — ยิ่งน้อยยิ่งดี |

👉 ไปต่อ: [16.2 Memoization — useMemo, useCallback, React.memo](/react/16-02-memoization)
