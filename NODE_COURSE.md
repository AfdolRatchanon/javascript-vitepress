# 📗 Node.js Backend Course

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
