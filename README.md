# 📘 JavaScript Zero to Hero

> **เรียน JavaScript จากศูนย์สู่เซียน** — คอร์ส JavaScript ภาษาไทย-อังกฤษ แบบครบจบในที่เดียว

[![VitePress](https://img.shields.io/badge/Built%20with-VitePress-646CFF?logo=vite)](https://vitepress.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📖 โปรเจกต์นี้คืออะไร?

**JavaScript Zero to Hero** คือเว็บไซต์คอร์สเรียน JavaScript แบบ **Bilingual (ไทย-อังกฤษ)** ที่สร้างด้วย [VitePress](https://vitepress.dev) เหมาะสำหรับ:

- 🆕 **ผู้เริ่มต้น** ที่ไม่เคยเขียนโค้ดมาก่อน
- 🎓 **นักศึกษา** ที่ต้องการเสริมพื้นฐาน JavaScript
- 🔁 **นักพัฒนา** ที่ต้องการทบทวน Concept สำคัญ

### ✨ จุดเด่น

| Feature | รายละเอียด |
|:--------|:----------|
| **Zero to Hero** | เริ่มจากศูนย์ ไม่ต้องมีพื้นฐาน |
| **Bilingual** | คำศัพท์เทคนิคภาษาอังกฤษ + คำอธิบายภาษาไทย |
| **Project Based** | ทุก Module มี Guided Project ให้ลงมือทำ |
| **MDN Referenced** | อ้างอิง MDN Web Docs เป็นหลัก |
| **Progressive** | เรียงจากง่ายไปยาก เรียนตามลำดับได้เลย |

---

## 🗺️ 📘 JavaScript Course — เนื้อหาในคอร์ส

> **33 บทเรียน + 13 โปรเจกต์** เรียงจากง่ายไปยาก ครอบคลุม JavaScript ครบทุกด้าน

### Module 0: Setup Environment

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `00-setup.md` | Install Node.js, VS Code, สร้างโปรเจกต์แรก |

### Module 1: Introduction (3 บทเรียน + 2 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `01-01-history.md` | กำเนิด JS (1995), Browser Wars, ECMA Standards, Java vs JavaScript, V8 Engine, JS Today |
| `01-02-hello-world.md` | console.log Deep Dive, Console Methods (10+), Where JS Runs, String Basics, Semicolons & ASI |
| `01-03-syntax-basics.md` | Comments, Blocks, Case Sensitivity, Expression vs Statement, ASI Bug, Code Formatting |
| 🎨 `01-project-artist.md` | Console ASCII Art, Styled Console (%c), Template Literals |
| 📜 `01-project-bio.md` | Digital Bio Card, Escape Characters, Template Literals upgrade |

### Module 2: Variables & Data Types (4 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `02-01-variables.md` | var/let/const, Naming Rules, Declaration vs Initialization, Hoisting & TDZ (preview), const กับ Object |
| `02-02-data-types.md` | Primitive vs Reference, String/Number/Boolean/null/undefined, Stack vs Heap (preview), Dynamic Typing, typeof |
| `02-03-type-conversion.md` | Explicit Conversion (Number/String/Boolean), Falsy vs Truthy, Implicit Coercion, Best Practices |
| `02-04-operators.md` | Arithmetic, Precedence, Assignment, Comparison (== vs ===), Logical, Nullish Coalescing, Optional Chaining |
| ⚖️ `02-project-bmi.md` | BMI Calculator, toFixed(), Ternary Category, Template Literal output |

### Module 3: Control Flow (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `03-01-conditionals.md` | if/else if/else, Ternary, switch, Guard Clauses, Short-Circuit Evaluation |
| `03-02-loops.md` | for, while, do...while, for...of, for...in, break/continue, Infinite Loops, Nested Loops |
| 🐝 `03-project-fizzbuzz.md` | FizzBuzz Classic, ลำดับเงื่อนไข, String Concatenation approach, Custom FizzBuzz |

### Module 4: Functions & Scope (3 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `04-01-functions.md` | Declaration vs Expression, Arrow Functions, First-Class Citizens, Recursion, IIFE |
| `04-02-data-flow.md` | Parameters vs Arguments, Default/Rest Parameters, return, Pass-by-Value vs Reference |
| `04-03-scope-closures.md` | Global/Function/Block Scope, Scope Chain, var Problem, Closures, Module Pattern |
| 🧮 `04-project-calculator.md` | Modular Calculator, switch Controller, Higher-Order Pattern, History feature |

### Module 5: Arrays & Objects (3 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `05-01-arrays.md` | Creating, Accessing, Mutating Methods (push/pop/splice), Non-Mutating (map/filter/reduce), Chaining, Destructuring |
| `05-02-objects.md` | Creation, Dot vs Bracket, CRUD Properties, Methods & this, Checking Keys, Iteration, Destructuring & Spread |
| `05-03-reference-vs-value.md` | Copy by Value, Copy by Reference, const Gotcha, Equality, Shallow vs Deep Copy, structuredClone() |
| ✅ `05-project-todo.md` | Console Todo List: CRUD operations, Array manipulation |

### Module 6: DOM Manipulation (3 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `06-01-dom-basics.md` | What is DOM, Selecting Elements (querySelector), Reading/Changing Content, Attributes, Styling, Traversing |
| `06-02-dom-events.md` | addEventListener, Event Types (click/input/submit), Event Object, Keyboard Events, Form Events, Bubbling & Delegation |
| `06-03-dom-manipulation.md` | createElement, Inserting (append/prepend/before/after), Removing, Cloning, DocumentFragment, innerHTML vs createElement |
| 🎴 `06-project-interactive-card.md` | Interactive Profile Card: HTML/CSS/JS integration |

### Module 7: Async JavaScript (3 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `07-01-async-concepts.md` | Sync vs Async, Event Loop, Callbacks, setTimeout/setInterval, Microtasks vs Macrotasks |
| `07-02-promises.md` | Promise States, .then/.catch/.finally, Chaining, Promise.all/race/allSettled, Error Handling |
| `07-03-async-await.md` | async/await Basics, try/catch, Fetch API, Parallel vs Sequential, Common Mistakes |
| 🌤️ `07-project-weather-app.md` | Weather App: Fetch API, DOM rendering, Error handling |

### Module 8: ES6+ Modern Features (3 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `08-01-destructuring.md` | Object Destructuring, Array Destructuring, Destructuring in Functions, Nested Destructuring |
| `08-02-spread-rest.md` | Spread Array/Object/Function, Rest Parameters/Destructuring, Gotchas (Shallow Copy), Immutable Update |
| `08-03-modules.md` | Named Export/Import, Default Export, Module in Browser, Barrel Export, Dynamic Import, Common Mistakes |
| 👨‍🎓 `08-project-student-manager.md` | Student Manager: ES6 Modules, Destructuring, Spread/Rest |

### Module 9: OOP (3 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `09-01-classes.md` | Class Basics (constructor/methods), Getters & Setters, Static Methods, Private Fields (#) |
| `09-02-inheritance.md` | extends, super(), Method Overriding, instanceof, UI Component Hierarchy |
| `09-03-prototypes.md` | Prototype Chain, Class = Prototype Sugar, Object.create(), hasOwnProperty vs in |
| ⚔️ `09-project-rpg-game.md` | RPG Game: Class hierarchy, Inheritance, Polymorphism |

### Module 10: Error Handling & Debugging (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `10-01-error-handling.md` | try/catch/finally, Error Types (7 ชนิด), throw & Custom Error, Patterns (safeFetch) |
| `10-02-debugging.md` | Console Methods (10+), Chrome DevTools, Breakpoints, Strategies (Binary Search, Rubber Duck), Common Bugs |
| 📋 `10-project-form-validator.md` | Form Validator: Custom validation, Error display, DOM integration |

### Module 11: Web Storage & Browser APIs (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `11-01-web-storage.md` | localStorage (CRUD), sessionStorage, JSON stringify/parse, Storage Helper Functions, Storage Event |
| `11-02-browser-apis.md` | Geolocation, Clipboard, Notification, IntersectionObserver, URL & Location API |
| 📝 `11-project-note-app.md` | Note App: localStorage CRUD, DOM rendering, Search |

### Module 12: Capstone Project

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| 🏆 `12-capstone-project.md` | Task Manager App: รวมทุก Module, Full CRUD, localStorage, DOM |

---

## 📗 Node.js Backend Course

> **36 ไฟล์เนื้อหา (12 Module)** — สอน Backend Development ด้วย Node.js + Express.js + MySQL + MongoDB

### 🏗️ สถาปัตยกรรม (Single Site, Triple Section)

ทุก Course อยู่ใน **VitePress เดียวกัน** แยกเป็น Section ใน Sidebar:

```
JavaScript/docs/
├── javascript/              ← 📘 JavaScript Section
├── node/                    ← 📗 Node.js Section
└── react/                   ← ⚛️ React Section
```

### 🗺️ Node.js Module Outline (หัวข้อย่อย)

#### Module 1: Node.js Introduction (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `01-01-what-is-node.md` | JavaScript Runtime, V8 Engine, ติดตั้ง Node.js, REPL, รันไฟล์ .js ตัวแรก |
| `01-02-npm-basics.md` | npm คืออะไร, package.json, ติดตั้ง/ลบ Package, dependencies vs devDependencies, Scripts |
| 🎯 `01-project-cli-tool.md` | CLI Tool App: process.argv, readline, สร้างเครื่องมือ Command Line |

#### Module 2: Modules System (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `02-01-commonjs-esm.md` | CommonJS (require/exports), ESM (import/export), เปรียบเทียบ CJS vs ESM, Built-in Modules, Module Resolution |
| `02-02-npm-packages.md` | หา Package อย่างไร, dotenv, dayjs, uuid, จัดการ Package (update/remove/audit) |
| 📦 `02-project-utility-package.md` | Utility Package: String/Number/Array/Date Utils, สร้าง Package ของตัวเอง |

#### Module 3: File System & Path (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `03-01-filesystem.md` | Sync vs Async, Read/Write Files, Directories (mkdir/readdir), Metadata, fs.access() |
| `03-02-path-streams.md` | path module (join/resolve/extname), Buffer, Streams (Readable/Writable/Transform/Pipeline) |
| 📁 `03-project-file-manager.md` | File Manager CLI: list/copy/move/delete, Directory operations |

#### Module 4: HTTP & Server Basics (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `04-01-http-basics.md` | Web Server คืออะไร, HTTP Protocol, สร้าง Server ด้วย `http` module, req/res, Status Codes, Content-Type |
| `04-02-basic-routing.md` | Manual Routing, URL Object (pathname/searchParams), Serving HTML Files, HTTP Methods (GET/POST/PUT/DELETE) |
| 🌐 `04-project-simple-api.md` | RESTful API Server: MVC Pattern, JSON CRUD, Error handling |

#### Module 5: Express.js Basics (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `05-01-express-setup.md` | ทำไมต้อง Express, Hello Express, Basic Routing, req/res enhancements, Route Parameters, Static Files |
| `05-02-middleware.md` | Middleware Concept, App-Level Middleware, Built-in (json/urlencoded/static), Error Handling Middleware, Third-Party (cors/morgan/helmet) |
| 🛣️ `05-project-rest-api.md` | Express CRUD API: Service Layer, Controller, Validation Middleware, Router |

#### Module 6: REST API Design (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `06-01-rest-api-concepts.md` | REST คืออะไร, HTTP Methods, Resource Naming, Status Codes, JSON Structure |
| `06-02-api-design-best-practices.md` | API Versioning, Filtering/Sorting/Pagination, Logical Nesting, Error Response Standards, Security Checklist |
| 📡 `06-project-memory-api.md` | In-Memory Todo API: CRUD + Filtering + Pagination |

#### Module 7: MySQL (3 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `07-01-sql-fundamentals.md` | ฐานข้อมูลคืออะไร, SQL vs NoSQL, CREATE TABLE, Data Types, SELECT/INSERT/UPDATE/DELETE |
| `07-02-node-mysql.md` | mysql2 library, Connection Pool, Parameterized Queries, Async/Await pattern, Error Handling |
| `07-03-advanced-sql.md` | WHERE & Operators, JOIN (INNER/LEFT/RIGHT), Transactions (ACID), Indexing, Aggregation (COUNT/SUM/AVG) |
| 🗃️ `07-project-student-db.md` | Student Management DB: Express + MySQL CRUD, Parameterized queries |

#### Module 8: MongoDB (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `08-01-nosql-mongodb.md` | NoSQL Concept, Document Model, Collections, MongoDB Atlas Setup, mongosh Shell, CRUD ด้วย Native Driver |
| `08-02-mongoose-odm.md` | Mongoose Setup, Schema & Model, Validation, CRUD Operations, Virtuals, Population (JOIN), Middleware (pre/post hooks) |
| 📘 `08-project-blog-api.md` | Blog API: Mongoose Models, Nested Comments, Express + MongoDB |

#### Module 9: Authentication (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `09-01-password-security.md` | Hashing vs Encryption, bcrypt (salt rounds, compare), Password Policy, Storing Passwords Safely |
| `09-02-jwt-auth.md` | JWT Structure (Header/Payload/Signature), sign & verify, Token Lifecycle, Refresh Tokens, Auth Middleware, Protected Routes |
| 🔐 `09-project-auth-system.md` | Auth System: Register/Login, JWT Middleware, Protected Endpoints |

#### Module 10: File Upload & Validation (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `10-01-file-upload.md` | Multer Setup, diskStorage vs memoryStorage, File Filtering (type/size), Multiple Files, Serving Static Uploads |
| `10-02-input-validation.md` | express-validator (body/param/query), Validation Chains, Custom Validators, Sanitization (trim/escape), Error Formatting |
| 📤 `10-project-upload-api.md` | Image Upload API: Multer, File type validation, Static serving |

#### Module 11: Security (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `11-01-security-fundamentals.md` | OWASP Top 10, XSS (Reflected/Stored/DOM), SQL Injection, CSRF, Directory Traversal, Security Headers |
| `11-02-security-tools.md` | Helmet.js, CORS Configuration, Rate Limiting (express-rate-limit), Input Sanitization, Logging (morgan/winston), Environment Variables |
| 🛡️ `11-project-secure-api.md` | Secure API: All security middleware combined |

#### Module 12: Capstone (1 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย |
|:-----|:----------|
| `12-01-capstone.md` | Project Overview, Tech Stack, Database Schema Design |
| 🏆 `12-project-ecommerce-api.md` | E-Commerce API: Products + Orders + Auth + File Upload |

### 🛠️ Tech Stack

| เทคโนโลยี | ใช้ทำอะไร |
|:----------|:---------|
| Node.js + Express.js | Server & Web Framework |
| MySQL (`mysql2`) | SQL Database |
| MongoDB + Mongoose | NoSQL Database |
| JWT + bcrypt | Authentication & Password Hashing |
| Multer + express-validator | File Upload & Input Validation |
| Helmet + cors + morgan | Security & Logging |

### 📌 Status: 🟡 EXPANDING

- [x] กำหนด Module Outline
- [x] เลือก Tech Stack & Database Strategy
- [x] สร้างเนื้อหา Module 1-12 ครบ (30 ไฟล์ — ฉบับ v1)
- [x] แยก sub chapters Module 7-11 (เพิ่ม 6 ไฟล์ใหม่ → รวม 36 ไฟล์)

---

## ⚛️ React.js Frontend Course

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

---

## 🚀 การเริ่มต้นใช้งาน (Getting Started)

### ข้อกำหนดเบื้องต้น (Prerequisites)

- [Node.js](https://nodejs.org/) v18 ขึ้นไป
- [npm](https://www.npmjs.com/) (มาพร้อม Node.js)
- Code Editor เช่น [VS Code](https://code.visualstudio.com/)

### ติดตั้ง (Installation)

```bash
# 1. Clone โปรเจกต์
git clone <repository-url>
cd JavaScript

# 2. ติดตั้ง Dependencies
npm install

# 3. รันเว็บไซต์ (Development Mode)
npm run docs:dev
```

เปิดเบราว์เซอร์ไปที่ `http://localhost:5173` ก็พร้อมใช้งาน!

### คำสั่งที่ใช้ได้ (Available Scripts)

| คำสั่ง | ใช้ทำอะไร |
|:-------|:---------|
| `npm run docs:dev` | รันเว็บไซต์ในโหมด Development (Hot Reload) |
| `npm run docs:build` | Build เว็บไซต์สำหรับ Production |
| `npm run docs:preview` | Preview เว็บไซต์ที่ Build แล้ว |

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```
JavaScript/
├── docs/                           # 📄 เนื้อหาบทเรียนทั้งหมด
│   ├── .vitepress/
│   │   └── config.mts              # ⚙️ Config VitePress (Sidebar, Nav)
│   ├── index.md                    # 🏠 Main Portal (ทางเข้าหลัก)
│   ├── javascript/                 # 📘 เนื้อหา JavaScript (33 บทเรียน + 13 โปรเจกต์)
│   ├── node/                       # 📗 เนื้อหา Node.js (18 บทเรียน + 12 โปรเจกต์)
│   └── react/                      # ⚛️ เนื้อหา React (12 บทเรียน + 12 โปรเจกต์)
├── package.json
├── .gitignore
└── README.md                       # 📘 ไฟล์นี้!
```

### การตั้งชื่อไฟล์ (Naming Convention)

| Pattern | ใช้สำหรับ | ตัวอย่าง |
|:--------|:---------|:--------|
| `XX-YY-topic.md` | บทเรียน | `07-02-promises.md` |
| `XX-project-name.md` | โปรเจกต์ | `07-project-weather-app.md` |
| `XX-sol.md` | เฉลย | `solutions/03-sol.md` |

- `XX` = หมายเลข Module (01-12)
- `YY` = หมายเลขบทเรียนใน Module (01-03)

---

## ✏️ การแก้ไขและเพิ่มเนื้อหา (Contributing Guide)

### เพิ่มบทเรียนใหม่

1. **สร้างไฟล์** `.md` ใน `docs/` ตาม Naming Convention
2. **แก้ Sidebar** ใน `docs/.vitepress/config.mts` — เพิ่มลิงก์ในส่วน `sidebar`
3. **แก้ Roadmap** ใน `docs/roadmap.md` — เพิ่มลิงก์ในสารบัญ
4. **ตรวจสอบ** ด้วย `npm run docs:dev` ก่อน Commit

### 🏅 Gold Standard — มาตรฐานเนื้อหา (Content Quality Standards)

ทุกบทเรียนต้องผ่านเกณฑ์คุณภาพเพื่อให้ผู้เรียน **เข้าใจได้จริง** ไม่ใช่แค่ดูโค้ดตัวอย่าง

#### 📐 เกณฑ์ขั้นต่ำ (Minimum Requirements)

เกณฑ์ความยาวแยกตามประเภทไฟล์ — เน้นความครบถ้วนขององค์ประกอบมากกว่าจำนวนบรรทัด:

| ประเภทไฟล์ | ความยาวขั้นต่ำ | ต้องครบ 10 องค์ประกอบ | ตัวอย่าง |
|:-----------|:-------------:|:--------------------:|:---------|
| **บทเรียนหลัก** | **≥ 300 บรรทัด** | ✅ ต้องครบทุกข้อ | `02-01-variables.md` |
| **บทโปรเจกต์** | **≥ 150 บรรทัด** | ⚠️ ครบตามที่เหมาะสม | `05-project-todo.md` |
| **Setup / Index** | ไม่บังคับ | ❌ ไม่บังคับ | `00-setup.md`, `index.md` |

| เกณฑ์เพิ่มเติม | รายละเอียด | เป้าหมาย |
|:---------------|:----------|:---------|
| **สัดส่วน Prose:Code** | คำอธิบาย vs โค้ดตัวอย่าง | **≥ 40% Prose** |
| **Challenges** | จำนวนโจทย์ท้าทายท้ายบท | **≥ 1 ข้อ/หัวข้อย่อย** (เช่น 6 หัวข้อ = ≥ 6 challenges) |
| **Glossary** | จำนวนคำศัพท์เทคนิค | **≥ 8 คำ** (บทเรียนหลัก) |

#### 📝 องค์ประกอบที่ต้องมี — 10 ข้อ (Required Components)

| # | องค์ประกอบ | รายละเอียด |
|:-:|:----------|:----------|
| 1 | **Quote** | คำคมเปิดบท (ภาษาอังกฤษ) พร้อมชื่อผู้พูด |
| 2 | **Analogy** | เปรียบเทียบ Concept กับสิ่งที่คุ้นเคย (Emoji + ภาษาไทย) |
| 3 | **MDN Reference** | ลิงก์ไป MDN Web Docs ทุก Section หลัก |
| 4 | **คำอธิบายก่อนโค้ด** | ทุก Code Block ต้องมี **คำอธิบายภาษาไทย** ก่อนเสมอ — บอกว่า "ทำไม" "เมื่อไหร่ใช้" "แก้ปัญหาอะไร" |
| 5 | **Code Examples** | ตัวอย่างโค้ดพร้อม Comments + Output |
| 6 | **Comparison Table** | ตารางเปรียบเทียบ ≥ 1 ตาราง (เช่น `==` vs `===`) |
| 7 | **Real-World Use Case** | ตัวอย่างการใช้งานจริง ≥ 1 กรณี |
| 8 | **Challenges (ตามหัวข้อย่อย)** | โจทย์ ≥ 1 ข้อ/หัวข้อย่อย พร้อมเฉลยซ่อนใน `::: details` |
| 9 | **Glossary** | คำศัพท์เทคนิค 8-12 คำ พร้อมคำอธิบายไทยสั้นๆ |
| 10 | **Navigation** | ลิงก์ `👉 ไปต่อ: ...` ท้ายบท |

#### 🚫 หลัก No Duplication — สอนครั้งเดียว อ้างอิงข้ามบท

หัวข้อที่ซับซ้อนจะถูก **สอนเต็มรูปแบบในบทเดียว** เท่านั้น บทอื่นที่เกี่ยวข้องให้เขียนแค่ **preview สั้นๆ (5-15 บรรทัด)** แล้วลิงก์ไปบทหลัก:

| หัวข้อ | Preview สั้นๆ ที่ | เจาะลึกเต็มที่ |
|:-------|:-----------------|:--------------|
| Hoisting & TDZ | `02-01` Variables | **`04-03` Scope & Closures** |
| Stack vs Heap / Reference vs Value | `02-02` Data Types | **`05-03` Reference vs Value** |

วิธีเขียน Preview:

```markdown
## หัวข้อ
คำอธิบายสั้นๆ 2-3 ประโยค + ตัวอย่างโค้ดสั้น 1 อัน

::: tip ⚡ เจาะลึกเรื่องนี้ในบท X.X
คำอธิบายว่าจะเรียนอะไรเพิ่ม + [ลิงก์ไปบทหลัก](/javascript/XX-XX-topic)
:::
```

> **หลักการ:** ถ้าเนื้อหาเดียวกันปรากฏในมากกว่า 1 บท = ต้อง refactor ให้เหลือบทเดียว + preview

#### ❌ สิ่งที่ต้องหลีกเลี่ยง

- ❌ **Code Dump** — โค้ดยาวๆ ติดกันไม่มีคำอธิบาย
- ❌ **ภาษาอังกฤษล้วน** — คำอธิบายหลักต้องเป็นภาษาไทย
- ❌ **ขาด Context** — โค้ดที่ไม่บอกว่า "ใช้เมื่อไหร่" "ทำไมต้องทำ"
- ❌ **Challenge ไม่ครบหัวข้อ** — ต้องมี ≥ 1 ข้อ/หัวข้อย่อยเสมอ (เช่น บทมี 5 หัวข้อ → ≥ 5 challenges)
- ❌ **เนื้อหาซ้ำซ้อนข้ามบท** — ห้ามอธิบายหัวข้อเดียวกันเต็มรูปแบบใน 2 บท
- ❌ **Padding เพื่อให้ถึงเกณฑ์** — ห้ามเพิ่มเนื้อหาที่ไม่จำเป็นแค่เพื่อนับบรรทัด
- ❌ **Challenge Header ซ้ำ** — แต่ละบทต้องมี `## Challenges` เพียง 1 ครั้งเท่านั้น

#### ✅ ตัวอย่างรูปแบบที่ดี

```markdown
## Section Title

คำอธิบายภาษาไทยว่า Concept นี้คืออะไร ทำไมสำคัญ ใช้เมื่อไหร่...

[MDN Reference Link]

\`\`\`javascript
// ตัวอย่างโค้ดพร้อม Comments
\`\`\`

> 💡 **เกร็ดเพิ่มเติม / ข้อควรระวัง**

### 📊 Comparison Table
| ... | ... |

### ตัวอย่าง Real-World: ...
```

### เพิ่ม Module ใหม่

1. สร้างไฟล์เนื้อหา + ไฟล์โปรเจกต์ตาม Pattern ข้างบน
2. เพิ่ม Module ใน `docs/.vitepress/config.mts`:
   ```typescript
   {
       text: 'Module XX: Topic Name',
       items: [
           { text: 'X.1 - Subtopic', link: '/XX-01-subtopic' },
           { text: '🎯 Project: Name', link: '/XX-project-name' }
       ]
   }
   ```
3. เพิ่มใน `docs/roadmap.md`
4. อัปเดตตาราง Module ใน `README.md` นี้

### การใช้ VitePress Features

```markdown
<!-- ซ่อน/แสดงเนื้อหา (Collapsible) -->
::: details ✨ ดูเฉลย
เนื้อหาที่ซ่อนอยู่
:::

<!-- Tips / Warnings -->
::: tip 💡 เกร็ดความรู้
ข้อมูลเสริม
:::

::: warning ⚠️ ข้อควรระวัง
สิ่งที่ต้องระวัง
:::

<!-- MathJax (สูตรคณิตศาสตร์) -->
$$E = mc^2$$
```

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

| เทคโนโลยี | เวอร์ชัน | ใช้ทำอะไร |
|:----------|:--------:|:---------|
| [VitePress](https://vitepress.dev) | 1.6.4 | Static Site Generator |
| [Vue.js](https://vuejs.org) | 3.x | Frontend Framework (VitePress core) |
| [markdown-it-mathjax3](https://github.com/tani/markdown-it-mathjax3) | 4.3.2 | สูตรคณิตศาสตร์ใน Markdown |

---

## 📌 สิ่งที่ควรปรับปรุงในอนาคต (Future Improvements)

### 🔴 Priority (ควรทำเร็วๆ นี้)

- [ ] **เพิ่มเฉลยโปรเจกต์** — สร้าง `solutions/` folder + ไฟล์ Solution สำหรับทุก Project
- [ ] **Deploy** — Deploy ขึ้น GitHub Pages / Vercel / Netlify
- [ ] **ตรวจ Gold Standard Node.js & React** — ตรวจสอบเนื้อหา Node.js / React ตาม 10 องค์ประกอบเดียวกับ JS Course
- [ ] **Quiz System** — เพิ่มแบบทดสอบท้ายบทด้วย Vue Component

### 🟡 Nice-to-have (ทำเมื่อพร้อม)

- [ ] **Interactive Code Playground** — ฝัง Code Editor ให้ทดลองโค้ดได้เลยในหน้าเว็บ (เช่น [Sandpack](https://sandpack.codesandbox.io/))
- [ ] **Search Enhancement** — ปรับปรุงระบบค้นหาให้รองรับภาษาไทย
- [ ] **Dark Mode Toggle** — ปรับ Theme ให้รองรับ Dark/Light อย่างสมบูรณ์
- [ ] **Progressive Web App** — ทำให้เว็บเปิดได้ Offline
- [ ] **i18n** — แยก Version ภาษาไทยกับภาษาอังกฤษ

---

## 🔗 แหล่งข้อมูลอ้างอิง (References)

| แหล่งข้อมูล | ใช้ทำอะไร |
|:-----------|:---------|
| [MDN Web Docs — JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) | อ้างอิงหลักทุกบทเรียน |
| [JavaScript.info](https://javascript.info/) | คำอธิบายเชิงลึกเพิ่มเติม |
| [ECMAScript Specification](https://tc39.es/ecma262/) | รายละเอียด Spec ระดับภาษา |
| [Can I Use](https://caniuse.com/) | ตรวจสอบ Browser Support |
| [Web.dev by Google](https://web.dev/) | Best Practices & Performance |

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  Made with ❤️ for JavaScript learners everywhere
</p>