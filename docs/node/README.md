# 📗 Node.js Back-End Zero to Hero

> **เรียน Node.js Back-End จากศูนย์สู่เซียน** — คอร์ส Node.js ภาษาไทย-อังกฤษ สำหรับ Backend Developer

[![VitePress](https://img.shields.io/badge/Built%20with-VitePress-646CFF?logo=vite)](https://vitepress.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📖 โปรเจกต์นี้คืออะไร?

**Node.js Back-End Zero to Hero** คือ **Section เพิ่มเติม** ของเว็บไซต์ [JavaScript Zero to Hero](../JavaScript/) ที่สร้างด้วย [VitePress](https://vitepress.dev) สอน Node.js Backend Development แบบ Bilingual (ไทย-อังกฤษ) เป็นส่วนหนึ่งของ **WSA2025 Teaching Platform**

> ⚠️ **หมายเหตุสำคัญ:** Node.js content อยู่ใน **VitePress เดียวกัน** กับ JS Course โดยแยกเป็น Section ใน Sidebar ไม่ใช่เว็บแยก

### สถาปัตยกรรม (Single VitePress Site, Dual Section)

```
2_WSA2025_TP/
├── JavaScript/                    ← VitePress Project หลัก
│   ├── docs/
│   │   ├── .vitepress/config.mts  ← Sidebar: JS Section + Node.js Section
│   │   ├── 00-setup.md            ← JS Content (Module 0-12)
│   │   ├── 01-01-history.md
│   │   ├── ...
│   │   └── node/                  ← 📗 Node.js Content อยู่ที่นี่!
│   │       ├── index.md           ← Node.js Landing Page
│   │       ├── 01-01-what-is-node.md
│   │       ├── 01-02-npm-basics.md
│   │       ├── 01-project-cli-tool.md
│   │       ├── ...
│   │       └── 12-capstone-ecommerce.md
│   ├── package.json
│   └── README.md                  ← README ของ JS Course
│
└── NodeJS/
    └── README.md                  ← ⬅️ ไฟล์นี้ (Planning Doc)
```

### Sidebar Structure

```
VitePress Sidebar:
├── 📘 JavaScript (Module 0-12)       ← Section 1 ✅ เสร็จแล้ว
│   ├── Module 0: Setup
│   ├── Module 1: Introduction
│   ├── Module 2: Variables & Types
│   ├── ...
│   └── Module 12: Capstone
│
└── 📗 Node.js Backend (Module 1-12)  ← Section 2 🟡 กำลังวางแผน
    ├── Module 1: Node.js Introduction
    ├── Module 2: Modules System
    ├── ...
    └── Module 12: Capstone
```

- **Prerequisite:** ผู้เรียนควรเรียน JavaScript Zero to Hero (หรือมีพื้นฐาน JS เทียบเท่า) ก่อนเริ่ม Node.js Section
- **เนื้อหาต่อเนื่อง:** ต่อยอดจาก Concept ใน JS Course เช่น Async/Await, Modules, OOP, Error Handling

---

## 🎯 เป้าหมายของคอร์ส

สอน **Node.js Backend Development** แบบครบจบ ตั้งแต่ Beginner ถึง Intermediate:

- 🆕 เริ่มจากศูนย์ (Node.js คืออะไร, npm)
- 🏗️ สร้าง Server ด้วย Express.js
- 📡 ออกแบบ REST API
- 🗃️ ใช้ Database **ทั้ง MySQL (SQL) และ MongoDB (NoSQL)**
- 🔐 ระบบ Authentication (JWT, bcrypt)
- 🛡️ Security Best Practices
- 🚀 Deploy ขึ้น Internet จริง

---

## 🗺️ Module Outline (แผนเนื้อหา)

| Module | หัวข้อ | เนื้อหาหลัก | โปรเจกต์ |
|:------:|:-------|:-----------|:--------:|
| 1 | **Node.js Introduction** | Node คืออะไร, V8 Engine, npm, package.json, REPL | 🎯 CLI Tool App |
| 2 | **Modules System** | CommonJS (`require`) vs ESM (`import`), npm packages, `node_modules` | 📦 Utility Package |
| 3 | **File System & Path** | `fs` module (อ่าน/เขียน/ลบไฟล์), `path` module, Streams | 📁 File Manager CLI |
| 4 | **HTTP & Server Basics** | `http` module, Request/Response, Headers, Status Codes | 🌐 Mini HTTP Server |
| 5 | **Express.js Basics** | Routing, Middleware, Static Files, Template Engines | 🛣️ Express Routes App |
| 6 | **REST API Design** | CRUD Operations, JSON API, Postman Testing, API Best Practices | 📡 In-Memory Todo API |
| 7 | **MySQL (SQL Database)** | SQL Basics (SELECT, INSERT, JOIN), `mysql2` driver, Raw Queries, Relations | 🗃️ Student Management DB |
| 8 | **MongoDB (NoSQL Database)** | Documents, Collections, Mongoose ODM, Schema Validation | 📘 Blog API with Mongo |
| 9 | **Authentication & Authorization** | JWT, bcrypt, Login/Register, Protected Routes, Role-based Access | 🔐 Auth System |
| 10 | **File Upload & Validation** | Multer (file upload), express-validator, Input Sanitization | 📤 Upload API |
| 11 | **Security & Error Handling** | CORS, Helmet, Rate Limiting, Error Middleware, morgan Logging | 🛡️ Secure API |
| 12 | **Capstone Project** | รวมทุก Module เข้าด้วยกัน | 🏆 E-Commerce Product API |

---

## 🏆 Capstone Project: E-Commerce Product API

แนวโปรเจกต์สุดท้ายที่รวมทุก Concept:

### Features:
| Feature | Modules ที่ใช้ |
|:--------|:-------------|
| User Registration & Login (JWT) | 9 |
| Role-based Access (Admin/User) | 9 |
| Product CRUD (MySQL) | 5, 6, 7 |
| Category Management | 7 (JOIN, Relations) |
| Product Image Upload | 10 |
| Product Reviews (MongoDB) | 8 |
| Search & Filter & Pagination | 6, 7 |
| Input Validation & Sanitization | 10 |
| Security Headers & Rate Limit | 11 |
| Error Handling Middleware | 11 |

### ทำไมเลือก E-Commerce:
1. **ใกล้ชีวิตจริง** — ทุกคนเคยใช้ร้านค้าออนไลน์
2. **ครอบคลุมทุก Concept** — Auth, CRUD, File Upload, Relations, Security
3. **ใช้ทั้ง 2 Database** — MySQL (Products, Users, Categories, Orders) + MongoDB (Reviews, Logs)
4. **ต่อยอดได้** — เพิ่ม Payment, Cart, Orders ในอนาคต

---

## 📐 Technical Decisions (สำหรับ AI/ผู้ร่วมพัฒนา)

### Stack ที่ใช้

| เทคโนโลยี | ใช้ทำอะไร | หมายเหตุ |
|:----------|:---------|:---------|
| **Node.js** | Runtime | LTS version |
| **Express.js** | Web Framework | เป็น Standard ของ Node.js |
| **MySQL** + `mysql2` | SQL Database | ใช้ **Raw SQL ก่อน** → แนะนำ ORM (Sequelize) ท้ายบท |
| **MongoDB** + `mongoose` | NoSQL Database | ใช้ **Mongoose ODM** ตั้งแต่แรก (เป็น Standard) |
| **JWT** (`jsonwebtoken`) | Authentication | Token-based Auth |
| **bcrypt** | Password Hashing | ไม่เก็บ Password เป็น Plain Text |
| **Multer** | File Upload | Middleware สำหรับ multipart/form-data |
| **express-validator** | Validation | Middleware สำหรับตรวจ Input |
| **Helmet** | Security Headers | ป้องกัน XSS, Clickjacking |
| **cors** | CORS | อนุญาต Cross-Origin Requests |
| **morgan** | Logging | HTTP Request Logger |
| **VitePress** | Documentation Site | ใช้ VitePress เดียวกับ JS Course |

### Database Strategy

```
                    ┌─────────────┐
                    │  Express.js │
                    │   Server    │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼                         ▼
      ┌───────────────┐        ┌───────────────┐
      │    MySQL      │        │   MongoDB     │
      │  (mysql2)     │        │  (mongoose)   │
      │               │        │               │
      │  • Users      │        │  • Reviews    │
      │  • Products   │        │  • Logs       │
      │  • Categories │        │  • Sessions   │
      │  • Orders     │        │               │
      └───────────────┘        └───────────────┘
      
      Structured Data           Flexible Data
      Relations (JOIN)          Documents (Embedded)
      Raw SQL → ORM later       Mongoose ODM
```

### Content Standards (Gold Standard)

ทุกบทเรียนต้องมี (เหมือน JavaScript Course):

| ✅ ต้องมี | รายละเอียด |
|:---------|:----------|
| **Quote** | คำคมเปิดบท |
| **Analogy** | เปรียบเทียบกับสิ่งที่คุ้นเคย |
| **Official Docs Reference** | ลิงก์ไปยัง Node.js Docs / Express Docs / MDN |
| **Code Examples** | ตัวอย่างโค้ดพร้อม Output |
| **Comparison Table** | ตารางเปรียบเทียบ |
| **Challenges** | โจทย์ท้าทาย พร้อมเฉลยซ่อน (`::: details`) |
| **Glossary** | คำศัพท์เทคนิค 8-12 คำ |
| **Navigation** | ลิงก์ไปบทถัดไป |
| **Bilingual** | คำศัพท์เทคนิคภาษาอังกฤษ + คำอธิบายภาษาไทย |

### ⚠️ Challenge Design Rules (กฎเขียน Challenge — บังคับ!)

> **AI หรือผู้ร่วมพัฒนาต้องปฏิบัติตามกฎเหล่านี้ 100%**

| # | กฎ | อธิบาย |
|:--|:---|:-------|
| 1 | **จำนวน Challenge = จำนวนหัวข้อ** | ถ้าบทเรียนมี 7 หัวข้อเนื้อหา (Section 1-7) ต้องมี 7 Challenges |
| 2 | **Challenge N ตรงกับ Section N** | Challenge 1 ทดสอบหัวข้อ 1, Challenge 2 ทดสอบหัวข้อ 2, ... เรียงลำดับตาม |
| 3 | **ใช้เฉพาะ Concept ที่สอนในหัวข้อนั้น** | ห้ามใช้ Concept ที่ไม่ได้สอนในบท! เช่น ถ้าไม่ได้สอน `node -e` ห้ามใส่ใน Challenge |
| 4 | **ข้อความบริบทก่อน Code Block** | ทุก Code Block ต้องมีข้อความบอกผู้เรียนว่าจะทำอะไร เช่น "สร้างไฟล์ X:", "ทดสอบด้วยคำสั่ง:" |
| 5 | **เฉลยซ่อนใน `::: details`** | ใช้ VitePress details container เสมอ |
| 6 | **ห้ามให้ผู้เรียนไปหาคำตอบจากที่อื่น** | ทุกอย่างที่ Challenge ใช้ต้องอยู่ในเนื้อหาของบทนั้น |

**ตัวอย่าง:** ถ้าบทเรียนมี 7 หัวข้อ:
```
## 1. npm คืออะไร?
## 2. package.json
## 3. ติดตั้ง Package
## 4. SemVer
## 5. npm Scripts
## 6. คำสั่ง npm ที่ใช้บ่อย
## 7. require()

## 8. Challenges 🏆     ← Challenge section = Section สุดท้าย + 1
### 🎯 Challenge 1: ...  ← ทดสอบหัวข้อ 1 (npm คืออะไร?)
### 🎯 Challenge 2: ...  ← ทดสอบหัวข้อ 2 (package.json)
### 🎯 Challenge 3: ...  ← ทดสอบหัวข้อ 3 (ติดตั้ง Package)
### 🎯 Challenge 4: ...  ← ทดสอบหัวข้อ 4 (SemVer)
### 🎯 Challenge 5: ...  ← ทดสอบหัวข้อ 5 (npm Scripts)
### 🎯 Challenge 6: ...  ← ทดสอบหัวข้อ 6 (คำสั่ง npm)
### 🎯 Challenge 7: ...  ← ทดสอบหัวข้อ 7 (require())
```

### File Structure (ไฟล์อยู่ใน JavaScript/docs/node/)

```
JavaScript/docs/node/
├── index.md                       # Node.js Section Landing Page
├── 01-01-what-is-node.md          # บทเรียน: XX-YY-topic.md
├── 01-02-npm-basics.md
├── 01-project-cli-tool.md         # โปรเจกต์: XX-project-name.md
├── 02-01-commonjs-esm.md
├── 02-02-npm-packages.md
├── 02-project-utility-package.md
├── ...
└── 12-capstone-ecommerce.md       # Capstone
```

### VitePress Config Change Required

เมื่อเริ่มสร้างเนื้อหา ต้องแก้ `JavaScript/docs/.vitepress/config.mts` เพิ่ม Section ใหม่ใน Sidebar:

```typescript
sidebar: {
    '/': [
        // ===== 📘 JavaScript Section (เดิม) =====
        { text: 'Module 0: Setup', items: [...] },
        { text: 'Module 1: Introduction', items: [...] },
        // ...
    ],
    '/node/': [
        // ===== 📗 Node.js Section (ใหม่) =====
        { text: 'Module 1: Node.js Introduction', items: [...] },
        { text: 'Module 2: Modules System', items: [...] },
        // ...
    ]
}
```

### Reference Sources

| แหล่ง | URL | ใช้อ้างอิงอะไร |
|:------|:----|:-------------|
| Node.js Official Docs | https://nodejs.org/docs/latest/api/ | Core API (fs, http, path) |
| Express.js Guide | https://expressjs.com/en/guide/ | Routing, Middleware |
| MDN Web Docs | https://developer.mozilla.org/ | HTTP, JavaScript |
| MySQL Docs | https://dev.mysql.com/doc/ | SQL Syntax, Data Types |
| MongoDB Manual | https://www.mongodb.com/docs/manual/ | CRUD, Aggregation |
| Mongoose Docs | https://mongoosejs.com/docs/ | Schema, Model, Queries |
| JWT Introduction | https://jwt.io/introduction | Token Structure |
| OWASP | https://owasp.org/ | Security Best Practices |

---

## 📌 Status: 🟢 IN PROGRESS

**สถานะปัจจุบัน:** Module 1-2 เสร็จแล้ว กำลังเริ่ม Module 3

- [x] กำหนด Module Outline
- [x] เลือก Tech Stack
- [x] กำหนด Content Standards
- [x] ตัดสินใจสถาปัตยกรรม (Single VitePress Site, Dual Section)
- [x] สร้าง `node/` subfolder ใน `JavaScript/docs/`
- [x] อัปเดต `config.mts` — เพิ่ม Node.js Sidebar Section
- [x] ✅ **Module 1: Node.js Introduction** (3 ไฟล์)
- [x] ✅ **Module 2: Modules System** (3 ไฟล์)
- [ ] Module 3: File System & Path
- [ ] Module 4-12
- [ ] Capstone Project
