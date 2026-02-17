# ⚛️ React.js Frontend Course

> **28 ไฟล์เนื้อหา (12 Module)** — สอนสร้าง Web App สมัยใหม่ด้วย React.js (Hooks & Functional Components)

### 🗺️ React Module Outline (หัวข้อย่อย)

#### Module 1: Introduction & JSX (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `01-01-what-is-react.md` | React คืออะไร, SPA vs MPA, Virtual DOM, Setup (Vite/CRA), Project Structure, First Component |
| `01-02-jsx-deep-dive.md` | JSX Syntax, 5 กฎเหล็กของ JSX, Expressions in JSX, Conditional Rendering, Rendering Lists, Fragments |
| 🎨 `01-project-jsx-art.md` | JSX Art Gallery: Components แรก, Dynamic Background |

#### Module 2: Components & Props (1 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `02-01-components-props.md` | Creating Components, Props, Destructuring Props, Children Props, HTML Attributes vs React Props |
| 👤 `02-project-user-profile.md` | User Profile Card: Reusable component, Props passing |

#### Module 3: State & Events (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `03-01-event-handling.md` | onClick, onChange, onSubmit, Synthetic Events, Event Object, Passing Arguments, Prevent Default |
| `03-02-usestate-hook.md` | useState Hook, State vs Props, Update from Previous Value, Multiple States, Object/Array State, Lifting State Up |
| 🔢 `03-project-counter-toggler.md` | Counter & Toggler: State management, Toggle visibility |

#### Module 4: Lists & Keys (1 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `04-01-lists-keys.md` | Rendering Multiple Components (.map), Importance of Keys, Filter & Map |
| 📝 `04-project-simple-todo.md` | Simple Todo List: Add/Delete/Toggle items |

#### Module 5: Forms (1 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `05-01-forms.md` | Controlled Components, Multiple Inputs, Form Submission, Select/Checkbox/Radio |
| 📋 `05-project-registration-form.md` | Registration Form: Multi-field validation, Submit handling |

#### Module 6: Effects & Lifecycle (1 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `06-01-effects-lifecycle.md` | Side Effects, useEffect Hook, Dependency Array, Cleanup Function |
| ⏱️ `06-project-digital-clock.md` | Digital Clock: setInterval + cleanup, Hex Clock challenge |

#### Module 7: API Integration (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `07-01-fetch-useeffect.md` | Fetch API + useEffect Pattern, JSON Parsing, Async Function in useEffect, AbortController (Cleanup) |
| `07-02-loading-error-axios.md` | Loading/Error/Success States, Skeleton UI, Error Boundaries, Axios Setup (interceptors, baseURL, instance) |
| 📉 `07-project-crypto-tracker.md` | Crypto Price Tracker: Real-time API, Auto-refresh |

#### Module 8: Context API (1 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `08-01-context-api.md` | Prop Drilling Problem, createContext, Provider, useContext, When to use |
| 🌙 `08-project-theme-context.md` | Theme Switcher: Dark/Light mode with Context |

#### Module 9: React Router (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `09-01-basic-routing.md` | React Router Setup (BrowserRouter), Route & Routes, `<Link>` vs `<NavLink>`, Outlet, 404 Page |
| `09-02-advanced-routing.md` | Dynamic Routes (useParams), Nested Routes, useNavigate, useLocation, Route Guards (Protected Routes), Search Params |
| 🌏 `09-project-portfolio.md` | Multi-page Portfolio: Home/About/Projects pages, Nested Routes |

#### Module 10: Deployment (1 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `10-01-deployment.md` | Build for Production, Hosting Options (Vercel/Netlify), Router Issue fix |
| 🚀 `10-project-hosting.md` | Deploy to Vercel/Netlify: CI/CD Pipeline setup |

#### Module 11: Performance Optimization (1 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `11-01-performance.md` | Code Splitting (React.lazy), useMemo, useCallback, React.memo |
| ⚡ `11-project-optimization.md` | Optimization Challenge: Before/After comparison |

#### Module 12: Capstone (1 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `12-01-capstone.md` | Project Architecture, Stack & Tools, Development Plan |
| 🛒 `12-project-ecommerce.md` | Mini E-Commerce Shop: Cart Context, Product List, Cart Page |

### 📌 Status: 🟡 EXPANDING

- [x] กำหนด Module Outline
- [x] สร้าง Landing Page (`docs/react/index.md`)
- [x] อัปเดต Nav & Sidebar
- [x] สร้างเนื้อหา Module 1-12 ครบ (24 ไฟล์ — ฉบับ v1)
- [ ] แยก sub chapters Module 1, 3, 7, 9 (เพิ่ม 4 ไฟล์ใหม่ → รวม 28 ไฟล์)
