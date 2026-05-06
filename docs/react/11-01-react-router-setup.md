# 11.1 - React Router Setup

> "A URL is the most powerful user interface element on the web — it's a shareable, bookmarkable, history-aware state machine."
> — Ryan Florence, Co-creator of React Router

## เปรียบเหมือนอะไร? 🗺️

ลองนึกภาพว่าเว็บแอปพลิเคชันของคุณเหมือน **ห้างสรรพสินค้าขนาดใหญ่** แต่ละชั้นและแผนกคือ "หน้า" ต่าง ๆ ของเว็บ React Router ทำหน้าที่เหมือน **ป้ายบอกทางและลิฟต์** ในห้างนั้น เมื่อผู้ใช้พิมพ์ URL หรือกดปุ่ม ระบบจะพาพวกเขาไปยัง "แผนก" ที่ถูกต้องโดยอัตโนมัติ โดยไม่ต้องโหลดหน้าเว็บใหม่ทั้งหมด (ไม่ต้องออกจากห้างและกลับเข้ามาใหม่)

---

## ทำไมต้องใช้ React Router?

React โดยตัวมันเองนั้นเป็นแค่ **UI Library** ไม่มีระบบ routing ในตัว หมายความว่าถ้าคุณต้องการให้เว็บมีหลายหน้า เช่น `/home`, `/about`, `/contact` คุณต้องจัดการเองทั้งหมด React Router ช่วยแก้ปัญหานี้โดยการ:

- ซิงค์ URL ของเบราว์เซอร์กับ UI ของ React
- ทำให้ปุ่มย้อนกลับ/ไปข้างหน้าของเบราว์เซอร์ทำงานได้
- รองรับการแชร์ลิงก์และ bookmarking
- จัดการ nested layouts ได้อย่างมีประสิทธิภาพ

::: tip React Router Docs
อ่านเอกสารทางการได้ที่ [reactrouter.com/en/main](https://reactrouter.com/en/main) — มีตัวอย่างและ API reference ครบครัน
:::

---

## 1. ติดตั้ง React Router v6

ก่อนอื่นเราต้องติดตั้ง package `react-router-dom` ซึ่งเป็น version สำหรับเว็บ (มี `react-router-native` สำหรับ React Native แยกต่างหาก)

```bash
# ติดตั้ง react-router-dom version 6 ล่าสุด
npm install react-router-dom

# ตรวจสอบ version ที่ติดตั้ง
npm list react-router-dom
# output: react-router-dom@6.x.x
```

::: warning ระวัง Version!
บทเรียนนี้ใช้ **React Router v6** ซึ่งมีการเปลี่ยนแปลง API จาก v5 อย่างมาก ถ้าคุณเจอโค้ดตัวอย่างเก่าที่ใช้ `<Switch>` หรือ `component={...}` แสดงว่าเป็น v5 ซึ่งไม่สามารถใช้งานร่วมกับ v6 ได้โดยตรง
:::

---

## 2. การตั้งค่า BrowserRouter และโครงสร้าง Routes

### BrowserRouter คืออะไร?

`BrowserRouter` เป็น component ที่ห่อหุ้มแอปทั้งหมด ทำให้ React Router รู้ว่ากำลังรันบนเบราว์เซอร์และควรใช้ History API ของเบราว์เซอร์จัดการ URL

เราควรใส่ `BrowserRouter` ให้ห่อหุ้ม component สูงสุดของแอป (ส่วนใหญ่คือใน `main.jsx` หรือ `index.jsx`) เพื่อให้ทุก component ลูกสามารถเข้าถึง routing context ได้

```jsx
// main.jsx - จุดเริ่มต้นของแอป
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'  // import BrowserRouter
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* BrowserRouter ห่อหุ้ม App ทั้งหมด */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
```

### โครงสร้าง Routes และ Route

ใน `App.jsx` เราจะกำหนด "แผนที่" ของเว็บทั้งหมด โดยใช้ `Routes` และ `Route`:

- `<Routes>` — container ที่บอกว่า "นี่คือพื้นที่สำหรับกำหนด routes ทั้งหมด"
- `<Route path="..." element={...} />` — แต่ละ route บอกว่า "ถ้า URL ตรงกับ path นี้ ให้แสดง element นี้"

```jsx
// App.jsx - กำหนด routes ทั้งหมดของแอป
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Products from './pages/Products'
import NotFound from './pages/NotFound'
import Navbar from './components/Navbar'

function App() {
  return (
    <div>
      {/* Navbar แสดงตลอดเวลา ไม่ว่าจะอยู่หน้าไหน */}
      <Navbar />

      {/* Routes จะ render เฉพาะ Route ที่ตรงกับ URL ปัจจุบัน */}
      <Routes>
        <Route path="/" element={<Home />} />           {/* หน้าแรก */}
        <Route path="/about" element={<About />} />     {/* หน้าเกี่ยวกับเรา */}
        <Route path="/products" element={<Products />} /> {/* หน้าสินค้า */}
        <Route path="*" element={<NotFound />} />       {/* 404 - ไม่พบหน้า */}
      </Routes>
    </div>
  )
}

export default App
```

---

## 3. Index Routes — หน้าเริ่มต้นของ Layout

Index Route คือ route พิเศษที่จะแสดงเมื่อ URL ตรงกับ parent route พอดี แต่ไม่มี path เพิ่มเติม มักใช้ร่วมกับ nested routes

สมมติว่าเราต้องการ Layout ที่มี Navbar และ Sidebar คงที่ แต่ content ด้านในเปลี่ยนตาม route:

```jsx
// App.jsx - ตัวอย่าง Index Route ร่วมกับ Layout Route
import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <Routes>
      {/* MainLayout เป็น parent route */}
      <Route path="/" element={<MainLayout />}>
        {/* index route — แสดงเมื่อ URL เป็น "/" พอดี */}
        <Route index element={<Home />} />

        {/* child routes — แสดงเมื่อ URL เป็น "/dashboard" */}
        <Route path="dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  )
}
```

```jsx
// layouts/MainLayout.jsx
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

function MainLayout() {
  return (
    <div>
      <Navbar />
      <main>
        {/* Outlet คือจุดที่ child routes จะถูก render */}
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
```

---

## 4. `<Link>` vs `<NavLink>` — การนำทางใน React

### ทำไมไม่ใช้แท็ก `<a>` ธรรมดา?

ใน HTML ทั่วไปเราใช้ `<a href="/about">` เพื่อนำทาง แต่ใน React Router เราต้องใช้ `<Link>` แทน เพราะ:

- `<a>` จะโหลดหน้าเว็บใหม่ทั้งหมด ทำให้ React state หายไปหมด
- `<Link>` จะ update URL โดยไม่โหลดหน้าใหม่ รักษา state ไว้ได้

**เปรียบเหมือน**: `<a>` คือการออกจากห้างแล้วกลับเข้ามาใหม่ ส่วน `<Link>` คือการเดินภายในห้างโดยไม่ต้องผ่านประตูทางเข้า

```jsx
// components/Navbar.jsx
import { Link, NavLink } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="navbar">
      {/* Link — ใช้สำหรับการนำทางทั่วไป */}
      <Link to="/">โลโก้</Link>

      {/* NavLink — เหมือน Link แต่มี active state */}
      {/* จะเพิ่ม class "active" อัตโนมัติเมื่อ URL ตรงกัน */}
      <NavLink to="/" end>หน้าแรก</NavLink>
      <NavLink to="/about">เกี่ยวกับเรา</NavLink>
      <NavLink to="/products">สินค้า</NavLink>
    </nav>
  )
}
```

### NavLink กับ Active Styling แบบ Custom

NavLink รองรับ `className` และ `style` แบบ function ที่รับ `{ isActive }` เป็น parameter ทำให้เราควบคุม style ได้อย่างยืดหยุ่น:

```jsx
// components/Navbar.jsx - NavLink แบบ Custom Styling
import { NavLink } from 'react-router-dom'

function Navbar() {
  // กำหนด style function สำหรับ NavLink
  const getNavLinkClass = ({ isActive }) => {
    return isActive
      ? 'nav-link nav-link--active'  // เมื่อ active ใส่ class พิเศษ
      : 'nav-link'
  }

  return (
    <nav>
      <NavLink to="/" end className={getNavLinkClass}>
        หน้าแรก
      </NavLink>

      <NavLink to="/products" className={getNavLinkClass}>
        สินค้า
      </NavLink>

      {/* ใช้ style function แทน className ก็ได้ */}
      <NavLink
        to="/about"
        style={({ isActive }) => ({
          color: isActive ? '#e63946' : '#333',      // สีแดงเมื่อ active
          fontWeight: isActive ? 'bold' : 'normal',  // ตัวหนาเมื่อ active
          textDecoration: 'none'
        })}
      >
        เกี่ยวกับเรา
      </NavLink>
    </nav>
  )
}
```

```css
/* styles/navbar.css */
.nav-link {
  padding: 8px 16px;
  color: #333;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background-color: #f0f0f0;
}

.nav-link--active {
  background-color: #e63946;
  color: white;
  font-weight: bold;
}
```

### ความแตกต่างระหว่าง `end` prop

`end` prop ใน NavLink บอกว่า "ให้ตรวจสอบ path แบบ exact match" ถ้าไม่ใส่ `end` ที่ `/` จะ active ตลอดเวลาเพราะ path ทุกอันเริ่มต้นด้วย `/`

```jsx
{/* ปัญหา: "/" จะ active ตลอดเวลา เพราะ "/about" ก็เริ่มต้นด้วย "/" */}
<NavLink to="/">หน้าแรก</NavLink>  {/* ไม่ดี */}

{/* วิธีแก้: ใส่ end prop */}
<NavLink to="/" end>หน้าแรก</NavLink>  {/* ดี — active เฉพาะเมื่อ URL เป็น "/" พอดี */}
```

---

## 5. หน้า 404 Not Found

ใน React Router v6 เราใช้ `path="*"` เพื่อจับ URL ทุกอย่างที่ไม่ตรงกับ route อื่น ๆ วาง route นี้ไว้ท้ายสุดเสมอ:

```jsx
// pages/NotFound.jsx
import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="not-found">
      <h1>404 - ไม่พบหน้าที่คุณต้องการ</h1>
      <p>URL ที่คุณเข้ามาอาจถูกลบหรือพิมพ์ผิด</p>
      {/* ใช้ Link เพื่อกลับหน้าแรก */}
      <Link to="/">กลับหน้าแรก</Link>
    </div>
  )
}

export default NotFound
```

```jsx
// App.jsx - วาง route "*" ไว้ท้ายสุดเสมอ
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
  <Route path="/products" element={<Products />} />
  {/* route นี้จะ match ก็ต่อเมื่อไม่มี route ข้างบนตรงกัน */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

---

## 6. ตารางเปรียบเทียบ: React Router v5 vs v6

| Feature | v5 (เก่า) | v6 (ใหม่) |
|---------|-----------|-----------|
| Container | `<Switch>` | `<Routes>` |
| Route syntax | `<Route component={Page} />` | `<Route element={<Page />} />` |
| Exact match | ต้องใส่ `exact` prop | Default คือ exact match |
| Nested routes | ต้องกำหนดใน child component | กำหนดได้ใน parent `<Routes>` |
| Active link class | ต้องใช้ `activeClassName` | รองรับ function `({ isActive })` |
| useHistory | `useHistory()` | `useNavigate()` |
| Redirect | `<Redirect to="..." />` | `<Navigate to="..." />` |
| 404 route | `<Route path="*" />` | `<Route path="*" />` (เหมือนกัน) |

---

## 7. Real-world Use Case: E-commerce Site Navigation

### สถานการณ์จริง

สมมติว่าคุณกำลังสร้างเว็บ e-commerce คล้าย Shopee หรือ Lazada ที่ต้องมีหลายหน้า เช่น หน้าแรก, หน้าหมวดหมู่สินค้า, หน้าสินค้า, ตะกร้าสินค้า และหน้า checkout

```jsx
// App.jsx - E-commerce routing structure
import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Category from './pages/Category'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* หน้าแรกของร้าน */}
        <Route index element={<Home />} />

        {/* หมวดหมู่สินค้า เช่น /category/electronics */}
        <Route path="category/:categorySlug" element={<Category />} />

        {/* หน้ารายละเอียดสินค้า เช่น /product/iphone-15 */}
        <Route path="product/:productSlug" element={<ProductDetail />} />

        {/* ตะกร้าสินค้า */}
        <Route path="cart" element={<Cart />} />

        {/* หน้า checkout */}
        <Route path="checkout" element={<Checkout />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
```

```jsx
// components/MainNavbar.jsx - Navbar ของร้านค้า
import { Link, NavLink } from 'react-router-dom'

function MainNavbar() {
  return (
    <header className="header">
      {/* โลโก้ร้าน */}
      <Link to="/" className="logo">
        <img src="/logo.svg" alt="ShopReact" />
      </Link>

      {/* เมนูหลัก */}
      <nav className="main-nav">
        <NavLink to="/" end className={({ isActive }) =>
          isActive ? 'nav-item active' : 'nav-item'
        }>
          หน้าแรก
        </NavLink>

        <NavLink to="/category/all" className={({ isActive }) =>
          isActive ? 'nav-item active' : 'nav-item'
        }>
          สินค้าทั้งหมด
        </NavLink>

        <NavLink to="/category/electronics" className={({ isActive }) =>
          isActive ? 'nav-item active' : 'nav-item'
        }>
          อิเล็กทรอนิกส์
        </NavLink>
      </nav>

      {/* ไอคอนตะกร้า */}
      <Link to="/cart" className="cart-icon">
        🛒 <span className="cart-badge">3</span>
      </Link>
    </header>
  )
}

export default MainNavbar
```

::: tip ผลลัพธ์ที่ได้
เมื่อผู้ใช้กดที่เมนู "อิเล็กทรอนิกส์" URL จะเปลี่ยนเป็น `/category/electronics` โดยไม่โหลดหน้าใหม่ และ NavLink จะ highlight เมนูนั้นโดยอัตโนมัติ
:::

---

## แบบฝึกหัดที่ 1: ตั้งค่า Routes พื้นฐาน

**โจทย์**: สร้าง React app ที่มี 4 หน้า: Home, About, Services, Contact พร้อม Navbar ที่ใช้ NavLink แสดง active state ด้วย underline สีแดง

::: details ✨ ดูเฉลย

```jsx
// main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
```

```jsx
// App.jsx
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

function App() {
  return (
    <>
      <Navbar />
      <main style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  )
}

export default App
```

```jsx
// components/Navbar.jsx
import { NavLink } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  const linkClass = ({ isActive }) =>
    isActive ? 'nav-link nav-link--active' : 'nav-link'

  return (
    <nav className="navbar">
      <NavLink to="/" end className={linkClass}>Home</NavLink>
      <NavLink to="/about" className={linkClass}>About</NavLink>
      <NavLink to="/services" className={linkClass}>Services</NavLink>
      <NavLink to="/contact" className={linkClass}>Contact</NavLink>
    </nav>
  )
}

export default Navbar
```

```css
/* Navbar.css */
.navbar {
  display: flex;
  gap: 20px;
  padding: 16px 24px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nav-link {
  text-decoration: none;
  color: #333;
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
  transition: border-color 0.2s;
}

.nav-link--active {
  border-bottom: 2px solid #e63946;
  color: #e63946;
  font-weight: bold;
}
```
:::

---

## แบบฝึกหัดที่ 2: Index Route และ Layout

**โจทย์**: สร้าง Layout component ที่มี Sidebar และ Content area โดยใช้ Index Route แสดง dashboard เป็นหน้าแรก

::: details ✨ ดูเฉลย

```jsx
// layouts/DashboardLayout.jsx
import { Outlet, NavLink } from 'react-router-dom'

function DashboardLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ width: '200px', background: '#f5f5f5', padding: '20px' }}>
        <h3>เมนู</h3>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <NavLink to="/dashboard" end
            style={({ isActive }) => ({ color: isActive ? '#e63946' : '#333' })}>
            ภาพรวม
          </NavLink>
          <NavLink to="/dashboard/users"
            style={({ isActive }) => ({ color: isActive ? '#e63946' : '#333' })}>
            ผู้ใช้
          </NavLink>
          <NavLink to="/dashboard/settings"
            style={({ isActive }) => ({ color: isActive ? '#e63946' : '#333' })}>
            ตั้งค่า
          </NavLink>
        </nav>
      </aside>

      {/* Content Area */}
      <main style={{ flex: 1, padding: '20px' }}>
        <Outlet /> {/* child routes render ที่นี่ */}
      </main>
    </div>
  )
}

export default DashboardLayout
```

```jsx
// App.jsx
import { Routes, Route } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import DashboardHome from './pages/DashboardHome'
import Users from './pages/Users'
import Settings from './pages/Settings'

function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="users" element={<Users />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
```
:::

---

## Glossary — คำศัพท์สำคัญ

| คำศัพท์ | ความหมาย |
|---------|----------|
| **Router** | ระบบที่จัดการการนำทางระหว่างหน้าในแอปพลิเคชัน |
| **BrowserRouter** | Component ที่ใช้ History API ของเบราว์เซอร์จัดการ URL |
| **Routes** | Container ที่ห่อหุ้ม Route ทั้งหมด และ render เฉพาะ Route ที่ตรงกับ URL |
| **Route** | การกำหนดว่า URL path ใดควรแสดง component ใด |
| **Link** | Component สำหรับนำทางแบบ client-side (ไม่โหลดหน้าใหม่) |
| **NavLink** | Link พิเศษที่มี active state สำหรับทำ active styling |
| **Index Route** | Route ที่แสดงเมื่อ URL ตรงกับ parent path พอดี |
| **Outlet** | Component ที่กำหนดตำแหน่งที่ child routes จะถูก render |
| **isActive** | Property ใน NavLink callback ที่บอกว่า link นั้น active อยู่หรือไม่ |
| **path="*"** | Pattern พิเศษที่ match กับ URL ทุกอย่างที่ไม่มี route อื่นตรง (ใช้สำหรับ 404) |
| **Client-side Routing** | การจัดการ navigation ใน browser โดยไม่ต้องส่ง request ไปยัง server |
| **History API** | Web API ที่ช่วยให้ JavaScript สามารถ update URL โดยไม่โหลดหน้าใหม่ |

---

👉 ไปต่อ: [11.2 - Dynamic Routing](/react/11-02-dynamic-routing)
