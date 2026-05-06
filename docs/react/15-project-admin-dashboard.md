# 🛡️ Project 15: Admin Dashboard

> **โปรเจกต์นี้ฝึก:** Protected Routes, Role-based Access, RoleRoute, ProtectedRoute, usePermission, Unauthorized Page

## โจทย์

สร้าง **Admin Dashboard** ที่มีระบบ Auth และ Role ครบจบ:

1. **3 Roles**: `user`, `editor`, `admin`
2. **Sidebar** ที่แสดงเมนูตาม Role
3. **Dashboard Page** — ทุกคนที่ Login เข้าได้
4. **Content Page** — เฉพาะ Editor และ Admin
5. **Admin Panel** — เฉพาะ Admin

## Setup และ Mock Data

```jsx
// src/contexts/AuthContext.jsx
// ใช้ Mock Authentication (ไม่ต้อง Backend จริงๆ)

const MOCK_USERS = {
  'user@test.com': { id: 1, name: 'ผู้ใช้ทั่วไป', role: 'user', email: 'user@test.com' },
  'editor@test.com': { id: 2, name: 'บรรณาธิการ', role: 'editor', email: 'editor@test.com' },
  'admin@test.com': { id: 3, name: 'ผู้ดูแลระบบ', role: 'admin', email: 'admin@test.com' },
}

// รหัสผ่านทุกคน: 1234
async function login(email, password) {
  await new Promise(r => setTimeout(r, 600))  // Simulate network
  if (MOCK_USERS[email] && password === '1234') {
    const user = MOCK_USERS[email]
    const token = btoa(JSON.stringify({ ...user, exp: Date.now() + 3600000 }))
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
    return { token, user }
  }
  throw { response: { data: { message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' } } }
}
```

## Route Structure

```
/login              → Public Only
/dashboard          → Protected (user, editor, admin)
/content            → RoleRoute (editor, admin)
/content/new        → RoleRoute (editor, admin)
/admin              → RoleRoute (admin)
/admin/users        → RoleRoute (admin)
/unauthorized       → Public
```

## Solution

::: details ดูเฉลยฉบับสมบูรณ์

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'

// ─── Auth Context ────────────────────────────────────────────────────
const AuthContext = createContext(null)

const MOCK_USERS = {
  'user@test.com': { id: 1, name: 'ผู้ใช้ทั่วไป', role: 'user', email: 'user@test.com' },
  'editor@test.com': { id: 2, name: 'บรรณาธิการ', role: 'editor', email: 'editor@test.com' },
  'admin@test.com': { id: 3, name: 'ผู้ดูแลระบบ', role: 'admin', email: 'admin@test.com' },
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('user')
    if (saved) setUser(JSON.parse(saved))
    setIsLoading(false)
  }, [])

  async function login(email, password) {
    await new Promise(r => setTimeout(r, 600))
    if (MOCK_USERS[email] && password === '1234') {
      const u = MOCK_USERS[email]
      localStorage.setItem('user', JSON.stringify(u))
      setUser(u)
      return u
    }
    throw { response: { data: { message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' } } }
  }

  function logout() {
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuth() { return useContext(AuthContext) }

function usePermission() {
  const { user } = useAuth()
  const hierarchy = { admin: ['admin', 'editor', 'user'], editor: ['editor', 'user'], user: ['user'] }
  const hasAnyRole = (roles) => roles.some(r => (hierarchy[user?.role] || []).includes(r))
  return {
    isAdmin: user?.role === 'admin',
    isEditor: hasAnyRole(['editor', 'admin']),
    hasAnyRole,
  }
}

// ─── Route Guards ─────────────────────────────────────────────────────
function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>⏳ กำลังโหลด...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 24, backgroundColor: '#F7FAFC' }}>
        <Outlet />
      </main>
    </div>
  )
}

function RoleGuard({ allowedRoles, children }) {
  const { user, isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />
  return children
}

// ─── Sidebar ──────────────────────────────────────────────────────────
const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['user', 'editor', 'admin'] },
  { path: '/content', label: 'เนื้อหา', icon: '📝', roles: ['editor', 'admin'] },
  { path: '/admin', label: 'Admin Panel', icon: '⚙️', roles: ['admin'] },
  { path: '/admin/users', label: 'จัดการผู้ใช้', icon: '👥', roles: ['admin'] },
]

function Sidebar() {
  const { user, logout } = useAuth()
  const { hasAnyRole } = usePermission()
  const navigate = useNavigate()
  const visible = navItems.filter(item => hasAnyRole(item.roles))

  const roleColors = { admin: '#553C9A', editor: '#276749', user: '#2B6CB0' }
  const roleLabels = { admin: '👑 Admin', editor: '✍️ Editor', user: '👤 User' }

  return (
    <aside style={{ width: 240, backgroundColor: '#1A202C', color: 'white', display: 'flex', flexDirection: 'column', padding: 16 }}>
      <div style={{ padding: '16px 0 24px', borderBottom: '1px solid #2D3748' }}>
        <h2 style={{ margin: 0, fontSize: '1.1rem' }}>⚛️ Admin System</h2>
      </div>

      <nav style={{ flex: 1, paddingTop: 16 }}>
        {visible.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              color: isActive ? 'white' : '#A0AEC0',
              backgroundColor: isActive ? '#4299E1' : 'transparent',
              textDecoration: 'none',
              marginBottom: 4,
              fontSize: '0.9rem',
            })}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ borderTop: '1px solid #2D3748', paddingTop: 16 }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name}</div>
          <span style={{
            backgroundColor: roleColors[user?.role],
            color: 'white',
            padding: '1px 8px',
            borderRadius: 4,
            fontSize: '0.7rem',
          }}>
            {roleLabels[user?.role]}
          </span>
        </div>
        <button
          onClick={() => { logout(); navigate('/login') }}
          style={{ width: '100%', padding: '8px 0', backgroundColor: '#E53E3E', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem' }}
        >
          ออกจากระบบ
        </button>
      </div>
    </aside>
  )
}

// ─── Pages ────────────────────────────────────────────────────────────
function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#EBF8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: 'white', borderRadius: 12, padding: 40, width: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
        <h1 style={{ textAlign: 'center' }}>🔐 เข้าสู่ระบบ</h1>
        <div style={{ backgroundColor: '#EBF8FF', padding: 12, borderRadius: 8, marginBottom: 20, fontSize: '0.85rem' }}>
          <strong>Test Accounts:</strong><br />
          user@test.com / 1234 (User)<br />
          editor@test.com / 1234 (Editor)<br />
          admin@test.com / 1234 (Admin)
        </div>
        {error && <div style={{ backgroundColor: '#FED7D7', color: '#C53030', padding: 12, borderRadius: 6, marginBottom: 16 }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="อีเมล" required style={{ padding: 10, borderRadius: 6, border: '1px solid #E2E8F0' }} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="รหัสผ่าน (1234)" required style={{ padding: 10, borderRadius: 6, border: '1px solid #E2E8F0' }} />
          <button type="submit" disabled={loading} style={{ padding: 12, backgroundColor: '#4299E1', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
            {loading ? '⏳ กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  )
}

function DashboardPage() {
  const { user } = useAuth()
  const stats = [
    { label: 'บทความทั้งหมด', value: 142, icon: '📝' },
    { label: 'ผู้ใช้ทั้งหมด', value: 1205, icon: '👥' },
    { label: 'ยอดเข้าชมวันนี้', value: 8547, icon: '👀' },
    { label: 'Revenue', value: '฿52,400', icon: '💰' },
  ]

  return (
    <div>
      <h1>สวัสดี, {user?.name}! 👋</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} style={{ backgroundColor: 'white', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{s.value}</div>
            <div style={{ color: '#718096', fontSize: '0.85rem' }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ backgroundColor: '#F0FFF4', border: '1px solid #9AE6B4', borderRadius: 8, padding: 16 }}>
        <strong>Role ปัจจุบัน: {user?.role}</strong>
        <p style={{ margin: '4px 0 0', color: '#276749' }}>เมนูในหน้า Sidebar แสดงตามสิทธิ์ของคุณ</p>
      </div>
    </div>
  )
}

function ContentPage() {
  const { isAdmin } = usePermission()
  const articles = [
    { id: 1, title: 'บทความ React', author: 'สมชาย', status: 'published' },
    { id: 2, title: 'บทความ Node.js', author: 'มาลี', status: 'draft' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>📝 จัดการเนื้อหา</h1>
        <button style={{ padding: '8px 16px', backgroundColor: '#4299E1', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>+ เขียนบทความใหม่</button>
      </div>
      <div style={{ backgroundColor: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#F7FAFC' }}>
            <tr>
              {['ID', 'หัวข้อ', 'ผู้เขียน', 'สถานะ', 'การกระทำ'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', color: '#4A5568' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {articles.map(a => (
              <tr key={a.id} style={{ borderTop: '1px solid #EDF2F7' }}>
                <td style={{ padding: '12px 16px', color: '#718096' }}>{a.id}</td>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{a.title}</td>
                <td style={{ padding: '12px 16px', color: '#718096' }}>{a.author}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ backgroundColor: a.status === 'published' ? '#C6F6D5' : '#FEF3C7', color: a.status === 'published' ? '#276749' : '#92400E', padding: '2px 8px', borderRadius: 4, fontSize: '0.8rem' }}>
                    {a.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button style={{ marginRight: 8, padding: '4px 10px', border: '1px solid #E2E8F0', borderRadius: 4, cursor: 'pointer' }}>แก้ไข</button>
                  {isAdmin && <button style={{ padding: '4px 10px', backgroundColor: '#FED7D7', color: '#C53030', border: 'none', borderRadius: 4, cursor: 'pointer' }}>ลบ</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AdminPage() {
  return (
    <div>
      <h1>⚙️ Admin Panel</h1>
      <div style={{ backgroundColor: '#FFF5F7', border: '1px solid #FED7E2', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <strong>⚠️ เขตหวงห้าม</strong> — หน้านี้เข้าได้เฉพาะ Admin เท่านั้น
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {[
          { title: 'จัดการผู้ใช้', icon: '👥', path: '/admin/users' },
          { title: 'การตั้งค่าระบบ', icon: '🔧', path: '/admin/settings' },
          { title: 'Audit Log', icon: '📋', path: '/admin/logs' },
        ].map(item => (
          <div key={item.title} style={{ backgroundColor: 'white', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>{item.icon}</div>
            <div style={{ fontWeight: 600 }}>{item.title}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function UnauthorizedPage() {
  const navigate = useNavigate()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16 }}>
      <span style={{ fontSize: '5rem' }}>🚫</span>
      <h1>403 — ไม่มีสิทธิ์</h1>
      <p style={{ color: '#718096' }}>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
      <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 24px', backgroundColor: '#4299E1', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
        กลับหน้าหลัก
      </button>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/content" element={
              <RoleGuard allowedRoles={['editor', 'admin']}><ContentPage /></RoleGuard>
            } />
            <Route path="/admin" element={
              <RoleGuard allowedRoles={['admin']}><AdminPage /></RoleGuard>
            } />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
```
:::

## เกณฑ์การประเมิน

| เกณฑ์ | คะแนน |
|:------|:------:|
| Login ด้วย 3 Account ต่างกัน Role ได้ | 20 |
| Sidebar แสดงเมนูถูกต้องตาม Role | 25 |
| Admin Page ไม่ให้ User/Editor เข้าได้ | 25 |
| Content Page ไม่ให้ User เข้าได้ | 15 |
| Unauthorized Page แสดงเมื่อไม่มีสิทธิ์ | 15 |
| **รวม** | **100** |

👉 ไปต่อ: [Module 16: Performance Optimization](/react/16-01-code-splitting)
