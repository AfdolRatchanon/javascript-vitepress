# 15.2 Role-based Access Control — ซ่อน/แสดง UI ตาม Role

> *"The principle of least privilege: give users only the access they need, nothing more."*
> — **Cybersecurity Best Practice**

## เปรียบเทียบให้เห็นภาพ

🏛️ **Role-based Access เหมือนระบบการ์ดเข้าออกของโรงพยาบาล** — บัตรพนักงานทั่วไปเปิดได้แค่ห้องทำงานตัวเอง บัตรหัวหน้าแผนกเปิดได้ทุกห้องในแผนก บัตร Admin เปิดได้ทุกห้องในโรงพยาบาล — ในโลก Software เราก็แบ่ง Role แบบเดียวกัน: `user`, `editor`, `admin` แต่ละ Role มีสิทธิ์ต่างกัน

## Role-based Access ใน React ทำอย่างไร?

> 📖 **อ่านเพิ่มเติม:** [OWASP — Access Control](https://owasp.org/www-project-access-control-testing/)

มี 2 ระดับที่ต้องควบคุม:

1. **Route Level** — ป้องกันไม่ให้เข้า Page ที่ไม่มีสิทธิ์
2. **UI Level** — ซ่อน/แสดง Component ตาม Role (เช่น ซ่อนปุ่ม Delete จาก User ทั่วไป)

> ⚠️ **สำคัญมาก:** การซ่อน UI ฝั่ง Client เป็นแค่ UX เท่านั้น ไม่ใช่ Security จริง — ต้องป้องกันใน Backend API ด้วยเสมอ!

## สร้าง RoleRoute Component

```jsx
// src/components/RoleRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function RoleRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <LoadingScreen />

  // ต้อง Login ก่อน
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // ตรวจสอบ Role
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
    // หรือแสดงหน้า 403 Forbidden
  }

  return children
}

export default RoleRoute
```

ใช้งานใน Router:

```jsx
// src/App.jsx
<Routes>
  {/* ทุกคนที่ Login แล้วเข้าได้ */}
  <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

  {/* เฉพาะ Editor และ Admin */}
  <Route
    path="/articles/new"
    element={
      <RoleRoute allowedRoles={['editor', 'admin']}>
        <NewArticlePage />
      </RoleRoute>
    }
  />

  {/* เฉพาะ Admin */}
  <Route
    path="/admin"
    element={
      <RoleRoute allowedRoles={['admin']}>
        <AdminPage />
      </RoleRoute>
    }
  />

  {/* หน้าแจ้งว่าไม่มีสิทธิ์ */}
  <Route path="/unauthorized" element={<UnauthorizedPage />} />
</Routes>
```

## usePermission Hook — ตรวจสอบสิทธิ์ใน Component

สร้าง Custom Hook เพื่อเช็คสิทธิ์ได้สะดวก:

```jsx
// src/hooks/usePermission.js
import { useAuth } from '../contexts/AuthContext'

// ใช้ตรวจสอบ Role
export function usePermission() {
  const { user, isAuthenticated } = useAuth()

  function hasRole(role) {
    if (!isAuthenticated) return false
    return user?.role === role
  }

  function hasAnyRole(roles) {
    if (!isAuthenticated) return false
    return roles.includes(user?.role)
  }

  function hasPermission(permission) {
    // กำหนด Permission ตาม Role
    const rolePermissions = {
      admin: ['read', 'write', 'delete', 'manage_users'],
      editor: ['read', 'write'],
      user: ['read'],
    }
    const userPerms = rolePermissions[user?.role] || []
    return userPerms.includes(permission)
  }

  return {
    isAdmin: hasRole('admin'),
    isEditor: hasAnyRole(['editor', 'admin']),
    hasRole,
    hasAnyRole,
    hasPermission,
  }
}
```

## ซ่อน/แสดง UI ตาม Role

```jsx
// src/pages/ArticlePage.jsx
import { usePermission } from '../hooks/usePermission'
import { useAuth } from '../contexts/AuthContext'

function ArticlePage({ article }) {
  const { isAdmin, isEditor, hasPermission } = usePermission()
  const { user } = useAuth()

  const isOwner = article.authorId === user?.id

  return (
    <article>
      <h1>{article.title}</h1>
      <p>{article.content}</p>

      {/* แสดงเฉพาะ Editor, Admin, หรือเจ้าของบทความ */}
      {(isEditor || isOwner) && (
        <button onClick={() => navigate(`/articles/${article.id}/edit`)}>
          ✏️ แก้ไข
        </button>
      )}

      {/* แสดงเฉพาะ Admin */}
      {isAdmin && (
        <button
          onClick={() => handleDelete(article.id)}
          style={{ color: 'red' }}
        >
          🗑️ ลบ (Admin Only)
        </button>
      )}

      {/* ใช้ hasPermission */}
      {hasPermission('manage_users') && (
        <button onClick={() => navigate('/admin/users')}>
          👥 จัดการผู้ใช้
        </button>
      )}

      {/* แสดงข้อมูล Debug เฉพาะ Admin */}
      {isAdmin && (
        <details>
          <summary>🔧 Debug Info (Admin Only)</summary>
          <pre>{JSON.stringify(article, null, 2)}</pre>
        </details>
      )}
    </article>
  )
}
```

## Decode JWT เพื่ออ่าน Role บน Client

บาง Backend ส่ง Role ไว้ใน JWT Payload ซึ่งอ่านได้บน Client (แต่ไม่ Verify ฝั่ง Client):

```javascript
// src/utils/jwt.js
// ⚠️ นี่คือ Decode เท่านั้น ไม่ใช่ Verify!
// Backend ต้องเป็นคน Verify เสมอ

export function decodeJWT(token) {
  try {
    // JWT มี 3 ส่วนคั่นด้วย .
    // ส่วนที่ 2 คือ Payload (Base64 encoded)
    const base64Payload = token.split('.')[1]
    const payload = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(payload)
  } catch {
    return null
  }
}

// ตัวอย่าง JWT Payload:
// {
//   "sub": "123",           ← User ID
//   "name": "สมชาย",
//   "email": "somchai@test.com",
//   "role": "admin",        ← Role ของผู้ใช้
//   "iat": 1234567890,      ← Issued At
//   "exp": 1234654290       ← Expires At
// }

// ใช้ใน AuthContext:
useEffect(() => {
  const token = localStorage.getItem('token')
  if (token) {
    const payload = decodeJWT(token)
    if (payload && payload.exp * 1000 > Date.now()) {
      setUser(payload)  // ใช้ข้อมูลจาก JWT โดยตรง
    } else {
      // Token หมดอายุ
      localStorage.removeItem('token')
    }
  }
  setIsLoading(false)
}, [])
```

## ตัวอย่าง Real-World: Admin Dashboard Sidebar

```jsx
// src/components/Sidebar.jsx
import { NavLink } from 'react-router-dom'
import { usePermission } from '../hooks/usePermission'

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['user', 'editor', 'admin'] },
  { path: '/articles', label: 'บทความ', icon: '📝', roles: ['user', 'editor', 'admin'] },
  { path: '/articles/new', label: 'เขียนบทความ', icon: '✍️', roles: ['editor', 'admin'] },
  { path: '/admin/users', label: 'จัดการผู้ใช้', icon: '👥', roles: ['admin'] },
  { path: '/admin/settings', label: 'การตั้งค่า', icon: '⚙️', roles: ['admin'] },
]

function Sidebar() {
  const { hasAnyRole } = usePermission()

  // กรองเฉพาะ Menu ที่ผู้ใช้มีสิทธิ์
  const visibleItems = menuItems.filter(item => hasAnyRole(item.roles))

  return (
    <nav style={{
      width: 240,
      backgroundColor: '#1a202c',
      minHeight: '100vh',
      padding: 16,
    }}>
      {visibleItems.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            borderRadius: 8,
            color: isActive ? 'white' : '#A0AEC0',
            backgroundColor: isActive ? '#4299E1' : 'transparent',
            textDecoration: 'none',
            marginBottom: 4,
            transition: 'all 0.15s',
          })}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
```

## Unauthorized Page

```jsx
// src/pages/UnauthorizedPage.jsx
import { useNavigate } from 'react-router-dom'

function UnauthorizedPage() {
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16 }}>
      <span style={{ fontSize: '4rem' }}>🚫</span>
      <h1>403 — ไม่มีสิทธิ์เข้าถึง</h1>
      <p style={{ color: '#718096' }}>คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => navigate(-1)}>← ย้อนกลับ</button>
        <button onClick={() => navigate('/dashboard')}>ไปหน้าหลัก</button>
      </div>
    </div>
  )
}
```

## Challenges

### Challenge 1: CanDo Component
สร้าง `<CanDo>` Component ที่ wrap เนื้อหาและซ่อนถ้าไม่มีสิทธิ์:

```jsx
// การใช้งาน:
<CanDo roles={['admin', 'editor']}>
  <button>แก้ไข</button>
</CanDo>
```

::: details ดูเฉลย
```jsx
function CanDo({ roles, permission, children, fallback = null }) {
  const { hasAnyRole, hasPermission } = usePermission()

  let hasAccess = true

  if (roles) hasAccess = hasAnyRole(roles)
  if (permission) hasAccess = hasPermission(permission)

  return hasAccess ? children : fallback
}

// ใช้งาน
<CanDo roles={['admin']}>
  <button>ลบ (Admin Only)</button>
</CanDo>

<CanDo permission="write" fallback={<p>ไม่มีสิทธิ์แก้ไข</p>}>
  <EditForm />
</CanDo>
```
:::

### Challenge 2: Token Expiry Check
เขียน Function ที่ตรวจสอบว่า JWT Token หมดอายุหรือยัง:

::: details ดูเฉลย
```javascript
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    // exp เป็น Unix timestamp (วินาที) ต้องคูณ 1000 เป็น ms
    return payload.exp * 1000 < Date.now()
  } catch {
    return true  // ถ้า parse ไม่ได้ถือว่า expired
  }
}

// ใช้ใน AuthContext
const token = localStorage.getItem('token')
if (token && !isTokenExpired(token)) {
  // Token ยังใช้ได้
  setUser(JSON.parse(localStorage.getItem('user')))
} else {
  // Token หมดอายุ
  localStorage.clear()
}
```
:::

### Challenge 3: Multi-level Roles
ออกแบบระบบ Role ที่ Admin สืบทอดสิทธิ์ทุกอย่างของ Editor และ Editor สืบทอดสิทธิ์ทุกอย่างของ User:

::: details ดูเฉลย
```javascript
const ROLE_HIERARCHY = {
  admin: ['admin', 'editor', 'user'],
  editor: ['editor', 'user'],
  user: ['user'],
}

function hasRole(userRole, requiredRole) {
  const allowedRoles = ROLE_HIERARCHY[userRole] || []
  return allowedRoles.includes(requiredRole)
}

// Admin สามารถทำทุกอย่างที่ editor และ user ทำได้
console.log(hasRole('admin', 'user'))    // true
console.log(hasRole('admin', 'editor'))  // true
console.log(hasRole('editor', 'admin'))  // false
```
:::

### Challenge 4: Client vs Server Security
อธิบายว่าทำไมการซ่อน UI ฝั่ง Client เพียงอย่างเดียวไม่เพียงพอสำหรับ Security จริงๆ?

::: details ดูเฉลย
**เพราะ Client-side Code แก้ไขได้:**
1. User เปิด Browser DevTools → แก้ไข React State → ปุ่มที่ซ่อนอยู่ก็ปรากฏขึ้น
2. User ใช้ Postman หรือ curl → ส่ง API Request โดยตรง → ข้ามหน้า UI ทั้งหมด

**ดังนั้น Backend ต้องตรวจสอบสิทธิ์เสมอ:**
```javascript
// Node.js Backend — ต้องมีเสมอ
app.delete('/api/articles/:id', verifyToken, requireRole('admin'), async (req, res) => {
  // ตรวจสอบ Token และ Role ก่อนทำงาน
  await Article.findByIdAndDelete(req.params.id)
  res.json({ success: true })
})
```

Client-side Role check = เพื่อ UX (ไม่แสดงปุ่มที่ใช้ไม่ได้)
Server-side Role check = เพื่อ Security จริงๆ
:::

### Challenge 5: Audit Log UI
สร้าง Component แสดง Audit Log (ว่า Admin ทำอะไรบ้าง) ที่แสดงเฉพาะ Role `admin`:

::: details ดูเฉลย
```jsx
function AuditLogPage() {
  const { isAdmin } = usePermission()

  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />
  }

  return (
    <div>
      <h1>🔍 Audit Log</h1>
      <table>
        <thead>
          <tr>
            <th>เวลา</th>
            <th>ผู้ใช้</th>
            <th>การกระทำ</th>
            <th>รายละเอียด</th>
          </tr>
        </thead>
        <tbody>
          {auditLogs.map(log => (
            <tr key={log.id}>
              <td>{new Date(log.timestamp).toLocaleString('th-TH')}</td>
              <td>{log.userName}</td>
              <td>{log.action}</td>
              <td>{log.details}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```
:::

## 📖 Glossary

| คำศัพท์ | ความหมาย |
|:--------|:---------|
| **RBAC** | Role-Based Access Control — ระบบควบคุมสิทธิ์ตาม Role |
| **Role** | บทบาทของผู้ใช้ เช่น admin, editor, user |
| **Permission** | สิทธิ์เฉพาะ เช่น read, write, delete |
| **Principle of Least Privilege** | ให้สิทธิ์น้อยที่สุดที่จำเป็น |
| **Decode JWT** | อ่าน Payload ของ JWT (ไม่ใช่ Verify) |
| **403 Forbidden** | HTTP Status — Login แล้วแต่ไม่มีสิทธิ์ |
| **401 Unauthorized** | HTTP Status — ยังไม่ได้ Login |
| **Client-side Guard** | ซ่อน UI ฝั่ง Client — เพื่อ UX เท่านั้น |
| **Server-side Guard** | ตรวจสอบสิทธิ์ที่ API — เพื่อ Security จริง |
| **Role Hierarchy** | Role ระดับสูงสืบทอดสิทธิ์ของ Role ระดับต่ำ |
| **Audit Log** | บันทึกการกระทำของผู้ใช้ในระบบ |

👉 ไปต่อ: [🛡️ Project 15: Admin Dashboard](/react/15-project-admin-dashboard)
