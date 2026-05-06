# ⚛️ React.js Frontend Course

> **39 บทเรียน + 19 โปรเจกต์** (19 Module) — สอนสร้าง Web App สมัยใหม่ด้วย React.js (Hooks & Functional Components) แบบ Zero to Hero
> ⚠️ **อ้างอิงมาตรฐาน:** ทุกไฟล์เนื้อหาต้องยึดหลัก **Gold Standard (10 องค์ประกอบ)** และกฎ **No Duplication** ตามที่ระบุใน `README.md`

### 🏗️ สถาปัตยกรรม (Single Site, Triple Section)

ทุก Course อยู่ใน **VitePress เดียวกัน** แยกเป็น Section ใน Sidebar:

\`\`\`text
JavaScript/docs/
├── javascript/              ← 📘 JavaScript Section
├── node/                    ← 📗 Node.js Section
└── react/                   ← ⚛️ React Section (คุณอยู่ที่นี่)
\`\`\`

---

### 🗺️ React Module Outline (หัวข้อย่อย)

#### Module 1: Modern React & JSX (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `01-01-modern-setup.md` | React คืออะไร, Virtual DOM, **Vite vs CRA**, Project Structure มาตรฐาน | เน้นใช้ Vite เป็นหลัก เลิกใช้ CRA |
| `01-02-jsx-deep-dive.md` | JSX Syntax, 5 กฎเหล็กของ JSX, Expressions, Fragments, Conditional Rendering | |
| 🎨 `01-project-jsx-art.md` | JSX Art Gallery: ฝึกใช้ Expression และ Conditionals สร้างงานศิลปะบนหน้าเว็บ | |

#### Module 2: Components & Props (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `02-01-thinking-in-react.md` | Component Mental Model, การแตก Component, Functional Components | |
| `02-02-props-system.md` | Props, Destructuring, Children Props, **PropTypes** (ตรวจ Type แบบไม่ง้อ TS) | ปูพื้นฐานการส่งข้อมูลระหว่างแม่ลูก |
| 👤 `02-project-user-profile.md` | User Profile Card: Reusable Component ที่รับ Props หลากหลายประเภท | |

#### Module 3: Interactivity & State (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `03-01-event-handling.md` | Synthetic Events, Event Object, Passing Arguments, `onClick`, `onChange` | |
| `03-02-usestate-basics.md` | `useState` Hook พื้นฐาน, State vs Props, Batching Updates (ทำไมค่าไม่เปลี่ยนทันที) | |
| 🔢 `03-project-interactive-counter.md` | Interactive Counter: ระบบนับจำนวนและ Toggler ซ่อน/แสดงเนื้อหา | |

#### Module 4: Rendering Lists & Complex State (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `04-01-lists-and-keys.md` | Rendering Multiple Components (`.map`), ความสำคัญของ `key` (Index vs ID) | |
| `04-02-complex-state.md` | State ที่เป็น Object/Array, Immutability (ห้ามแก้ State ตรงๆ), CRUD Operations in Memory | |
| 📝 `04-project-todo-list.md` | Todo List App: ระบบ CRUD เต็มรูปแบบ (เพิ่ม, ลบ, แก้ไข, ขีดฆ่า) โดยไม่ใช้ Database | |

#### Module 5: Forms & Validation (The Hard Way) (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `05-01-controlled-components.md` | Controlled vs Uncontrolled, Multiple Inputs Handling | สอนวิธีกระดูกแข็งก่อนไปใช้ Library |
| `05-02-manual-validation.md` | การตรวจสอบข้อมูลด้วย Regex, จัดการ Error State เอง, `onSubmit` | ให้เห็นความลำบากของการทำ Form แบบเดิม |
| 📋 `05-project-register-form.md` | Registration Form: ฟอร์มสมัครสมาชิกพร้อม Validation แบบเขียนเองทุกบรรทัด | |

#### Module 6: Side Effects, Refs & Data Fetching (The Hard Way) (3 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `06-01-useeffect-lifecycle.md` | `useEffect`, Dependency Array, Cleanup Function (ป้องกัน Memory Leak) | |
| `06-02-useref-hook.md` | **`useRef`**: DOM Access, เก็บค่า Mutable โดยไม่ Trigger Render, `forwardRef` | Hook สำคัญที่ไม่มีใน Module อื่น |
| `06-03-manual-fetching.md` | Data Fetching ด้วย `fetch`/`axios`, จัดการ Loading/Error States เอง, Race Condition | สอนให้เห็นปัญหาก่อนไปใช้ TanStack Query |
| 📉 `06-project-crypto-tracker.md` | Crypto Tracker: ดึงราคาเหรียญแบบ Real-time ด้วย useEffect และ Axios แบบเดิม | |

#### Module 7: Custom Hooks (2 บทเรียน + 1 โปรเจกต์) ✨ NEW

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `07-01-custom-hooks.md` | Rules of Hooks, การสร้าง Custom Hook (`use` Prefix), Extract Logic ออกจาก Component | ทักษะสำคัญที่ทุก React Dev ต้องมี |
| `07-02-hooks-patterns.md` | Custom Hook Patterns จริง: `useFetch`, `useLocalStorage`, `useDebounce`, `useWindowSize` | |
| 🪝 `07-project-hooks-collection.md` | Hooks Collection: สร้างชุด Custom Hooks ที่ใช้งานได้จริงในโปรเจกต์ | |

#### Module 8: Styling Evolution & UI Libraries (3 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `08-01-css-modules.md` | ปัญหาของ Global CSS, การใช้ CSS Modules (Scoped Styles) | |
| `08-02-tailwind-css.md` | **Tailwind CSS** Setup, Utility-first concept, Responsive Design, Config | พระเอกของเรา สอนละเอียด |
| `08-03-ui-libraries.md` | รู้จัก Ant Design / MUI vs **Headless UI (shadcn/ui Concept)** | แนะนำเทรนด์ Modern UI ที่ใช้ Tailwind เป็นฐาน |
| 🎨 `08-project-modern-dashboard.md` | Modern Dashboard: สร้างหน้า Dashboard สวยงามด้วย Tailwind CSS และ Reusable Components | |

#### Module 9: Modern Forms (The Smart Way) (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `09-01-react-hook-form.md` | **React Hook Form** Introduction, `register`, `handleSubmit`, Performance Benefits | แก้ปัญหา Render รัวๆ ของ Controlled Comp. |
| `09-02-zod-validation.md` | Schema Validation ด้วย **Zod**, เชื่อมต่อกับ React Hook Form (`zodResolver`) | |
| 🛒 `09-project-checkout-form.md` | Complex Checkout: ฟอร์มสั่งซื้อสินค้าที่มี Validation ซับซ้อนแต่โค้ดสั้นลง | |

#### Module 10: Modern Data Fetching (The Smart Way) (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `10-01-tanstack-query-basics.md` | **TanStack Query (React Query)** Concept, `useQuery`, DevTools | แก้ปัญหา Caching และ State Management |
| `10-02-mutations-and-cache.md` | `useMutation` (Create/Update/Delete), Invalidate Queries (Auto Refetch) | |
| 🎬 `10-project-movie-app.md` | Movie Explorer: แอปค้นหาหนังที่ใช้ React Query เต็มสูบ (Caching, Background Update) | |

#### Module 11: Routing & Navigation (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `11-01-react-router-setup.md` | React Router v6+, `BrowserRouter`, `Routes`, `Route`, `Link` vs `NavLink` | |
| `11-02-dynamic-routing.md` | Dynamic Routes (`:id`), `useParams`, `useNavigate`, Nested Routes (`Outlet`) | |
| 🌏 `11-project-portfolio.md` | Multi-page Portfolio: เว็บไซต์หลายหน้า มีหน้ารายละเอียดโปรเจกต์ (Dynamic ID) | |

#### Module 12: Global State (Context & Reducers) (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `12-01-context-api.md` | Prop Drilling Problem, `createContext`, `useContext`, Provider Pattern | |
| `12-02-usereducer-hook.md` | `useReducer` Concept (Complex State Logic), ใช้คู่กับ Context API | |
| 🌙 `12-project-theme-switcher.md` | Theme & Language Switcher: ระบบเปลี่ยนธีม Dark/Light ที่ใช้ได้ทุกหน้า | |

#### Module 13: Professional State Management (Redux) (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `13-01-redux-toolkit-basics.md` | **Redux Toolkit (RTK)** Concept, Store, Slice, `useSelector`, `useDispatch` | มาตรฐานอุตสาหกรรมสำหรับ App ขนาดใหญ่ |
| `13-02-rtk-async-thunk.md` | `createAsyncThunk` สำหรับจัดการ Async Logic ใน Redux | |
| 🛍️ `13-project-shopping-cart.md` | Shopping Cart: ระบบตะกร้าสินค้า Global State ที่ซับซ้อน (Add, Remove, Calculate Total) | |

#### Module 14: Authentication Integration (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `14-01-auth-flow-frontend.md` | เชื่อมต่อ Login/Register กับ **Node.js Backend**, การเก็บ JWT (Storage vs Cookie) | เชื่อมกับคอร์ส Node.js Module 8 & 10 |
| `14-02-axios-interceptors.md` | **Axios Interceptors**: แนบ Token ไปกับ Header ทุก Request อัตโนมัติ, Handle 401 | เทคนิคระดับโปรที่ต้องรู้ |
| 🔐 `14-project-auth-integration.md` | Auth System UI: หน้า Login/Register ที่ใช้งานได้จริง พร้อม Auto Logout | |

#### Module 15: Protected Routes & Security (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `15-01-route-guards.md` | สร้าง **Protected Route Component** (Wrapper), Redirect ถ้าไม่มี Token | |
| `15-02-role-based-access.md` | ซ่อน/แสดง UI ตาม Role (Admin vs User), การ Decode JWT ฝั่ง Client | |
| 🛡️ `15-project-admin-dashboard.md` | Admin Dashboard: หน้าจัดการที่เข้าได้เฉพาะ Admin และเด้งออกถ้า Token หมดอายุ | |

#### Module 16: Performance Optimization (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `16-01-code-splitting.md` | `React.lazy`, `Suspense`, การแยก Bundle เพื่อให้เว็บโหลดเร็ว | |
| `16-02-memoization.md` | `useMemo`, `useCallback`, `React.memo` (สอนว่าใช้เมื่อไหร่ ไม่ใช่ใช้พร่ำเพรื่อ) | |
| ⚡ `16-project-optimization-lab.md` | Optimization Lab: แก้โจทย์แอปที่ทำงานช้ากระตุก ให้ลื่นไหลด้วยเทคนิคที่เรียนมา | |

#### Module 17: Automated Testing (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `17-01-testing-setup.md` | รู้จัก **Vitest** + **React Testing Library**, Setup Test Environment | เหมือน Node.js แต่เทส UI |
| `17-02-writing-component-tests.md` | Testing Components (Render, User Interaction, Async Updates) | |
| 🧪 `17-project-test-todo.md` | Tested Todo App: เขียน Test เคสสำคัญให้ครบ (Add, Delete, Filter) | |

#### Module 18: Deployment & CI/CD (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `18-01-build-production.md` | `npm run build`, Environment Variables (`.env.production`), Preview Mode | |
| `18-02-hosting-platforms.md` | Deploy to **Vercel / Netlify**, แก้ปัญหา React Router 404 on Refresh | |
| 🚀 `18-project-deployment-lab.md` | Deployment Lab: นำโปรเจกต์ขึ้นโฮสต์จริง พร้อมตั้งค่า CI/CD เบื้องต้น | |

#### Module 19: Capstone Project (1 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `19-01-capstone-architecture.md` | Feature-based Folder Structure, Absolute Imports, วางแผนเชื่อมต่อ Backend | |
| 🏆 `19-project-ecommerce-frontend.md` | **E-Commerce Frontend:** เชื่อมต่อ API Node.js ครบวงจร (Products, Cart, Auth, Orders) | รวมทุกอย่างที่เรียนมา: Tailwind, React Query, Redux, RHF |
