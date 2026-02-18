# 9.1 React Router

> *"Single Page Applications (SPAs) don't reload the page. They just swap components."*

## 🧭 What is React Router?
React ไม่ได้แถมระบบ Router มาให้ (ต่างจาก Next.js) เราจึงต้องลง Library เพิ่มเติม
`react-router-dom` คือมาตรฐานในการทำ Routing ครับ

```bash
npm install react-router-dom
```


## 🛣️ Basic Setup

เราต้องห่อหุ้ม App ทั้งหมดด้วย `<BrowserRouter>` และกำหนด `<Routes>`

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import About from './About';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        {/* 404 Not Found */}
        <Route path="*" element={<h1>Page Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
```


## 🔗 Navigation with `<Link>`

ห้ามใช้ `<a href="...">` เด็ดขาด! เพราะมันจะทำให้เว็บโหลดใหม่ (Refresh)
ให้ใช้ `<Link to="...">` แทน

```jsx
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <Link to="/">Home</Link> | <Link to="/about">About</Link>
    </nav>
  );
}
```


## 📦 Dynamic Routes (Params)

ถ้าเราอยากได้ URL แบบ `/user/123`, `/product/99` เราใช้ `:` (colon) ใน path

### 1. Define Route
```jsx
<Route path="/user/:id" element={<UserProfile />} />
```

### 2. Get Params (`useParams`)
ใน Component ปลายทาง (`UserProfile`) เราดึงค่าออกมาได้

```jsx
import { useParams } from 'react-router-dom';

function UserProfile() {
  const { id } = useParams(); // id = "123"
  return <h1>User ID: {id}</h1>;
}
```


## 🚦 Programmatic Navigation (`useNavigate`)

ถ้าอยากเปลี่ยนหน้าด้วยโค้ด (เช่น หลัง Login เสร็จ)

```jsx
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // ... logic login ...
    navigate('/dashboard'); // เปลี่ยนหน้าทันที
  };

  return <button onClick={handleLogin}>Log In</button>;
}
```


##  boxer Challenges

### Level 1: Active Link
ใช้ `<NavLink>` แทน `<Link>` เพื่อเปลี่ยนสีเมนูเมื่อเราอยู่ที่หน้านั้น (มันจะเติม class `active` ให้เอง)

::: details ✨ เฉลย
```jsx
import { NavLink } from 'react-router-dom';

<NavLink 
  to="/about"
  style={({ isActive }) => ({ color: isActive ? 'red' : 'blue' })}
>
  About
</NavLink>
```
:::


> 👉 **ไปต่อ: [Project 9: Multi-page Portfolio](/react/09-project-portfolio)**
