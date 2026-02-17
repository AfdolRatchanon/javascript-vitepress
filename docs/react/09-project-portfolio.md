# 🌏 Project 9: Multi-page Portfolio

ในบทนี้ เราจะเปลี่ยน Single Page ธรรมดา ให้กลายเป็น **Multi-page Application** ที่สมบูรณ์แบบ มีเมนูนำทางและหน้าย่อยต่างๆ

> **ความรู้ที่ใช้**: `BrowserRouter`, `Routes`, `Route`, `Link`, `useParams`

---

## 🎯 เป้าหมาย (Goal)
สร้างเว็บไซต์ Portfolio ส่วนตัว โดยมีโครงสร้างดังนี้:
1.  **Navbar**: แสดงทุกหน้า (Home, About, Projects)
2.  **Home Page**: หน้าแรก
3.  **About Page**: ประวัติส่วนตัว
4.  **Projects List Page**: รวมรายชื่อโปรเจกต์
5.  **Project Detail Page**: (`/projects/:id`) แสดงรายละเอียดเมือกดเลือกโปรเจกต์

---

## 🚀 ลงมือทำ (Step-by-Step)

### Step 1: Create Pages
สร้าง Component สำหรับแต่ละหน้าเตรียมไว้

```jsx
const Home = () => <h1>🏠 Home Page</h1>;
const About = () => <h1>👤 About Me</h1>;

const Projects = () => {
  return (
    <div>
      <h1>💼 My Projects</h1>
      <ul>
        <li><Link to="/projects/1">Project 1: Todo App</Link></li>
        <li><Link to="/projects/2">Project 2: Crypto Tracker</Link></li>
      </ul>
    </div>
  );
};

const ProjectDetail = () => {
  const { id } = useParams();
  return <h1>Showing details for Project ID: {id}</h1>;
};

const NotFound = () => <h1>❌ 404 Not Found</h1>;
```

### Step 2: Create Layout (Navbar)
ส่วนที่จะแสดงผลตลอดเวลา เช่น เมนูบาร์

```jsx
const Navbar = () => {
  return (
    <nav style={{ padding: 10, background: '#eee', marginBottom: 20 }}>
      <Link to="/" style={{ marginRight: 10 }}>Home</Link>
      <Link to="/about" style={{ marginRight: 10 }}>About</Link>
      <Link to="/projects">Projects</Link>
    </nav>
  );
};
```

### Step 3: Setup Router
รวมร่างทุกอย่างใน `App.js`

```jsx
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';

const App = () => {
  return (
    <BrowserRouter>
      <Navbar /> {/* อยู่นอก Routes จะแสดงทุกหน้า */}
      
      <div style={{ padding: 20 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};
```

---

## 🧩 Challenge: Nested Routes (Admin Panel)

ลองสร้างหน้า Admin ที่มีเมนูย่อยซ้อนอยู่ข้างใน
- `/admin/dashboard`
- `/admin/settings`

Hint: ใช้ `<Outlet />` ใน React Router v6

```jsx
const AdminLayout = () => (
  <div>
    <h2>Admin Area</h2>
    <Outlet /> {/* Child routes จะถูก render ตรงนี้ */}
  </div>
);

// Route Config
<Route path="/admin" element={<AdminLayout />}>
  <Route path="dashboard" element={<Dashboard />} />
  <Route path="settings" element={<Settings />} />
</Route>
```

---

> 👉 **ไปต่อ: [Module 10 - Deployment](/react/10-01-deployment)** (Coming Soon!)
