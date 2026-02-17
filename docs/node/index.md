---
layout: home
pageClass: node-home

hero:
  name: "Node.js Backend"
  text: "Zero to Hero 📗"
  tagline: "เรียน Node.js Backend จากศูนย์สู่เซียน — สร้าง REST API, ใช้ Database จริง, ระบบ Auth ครบจบ!"
  actions:
    - theme: brand
      text: "🎯 เริ่มเรียน Module 1"
      link: /node/01-01-what-is-node
    - theme: alt
      text: "📘 กลับไป JavaScript Course"
      link: /javascript/00-setup

features:
  - icon: "🖥️"
    title: "Node.js + Express"
    details: "เรียนรู้สร้าง Server และ REST API ด้วย Express.js — Framework ยอดนิยมอันดับ 1"
  - icon: "🗃️"
    title: "SQL + NoSQL Database"
    details: "ใช้ทั้ง MySQL (Relational) และ MongoDB (Document) — เข้าใจข้อดีข้อเสียทั้งสอง"
  - icon: "🔐"
    title: "Authentication & Security"
    details: "JWT, bcrypt, CORS, Helmet — สร้างระบบ Auth และ Security ระดับ Production"
  - icon: "🏆"
    title: "12 Modules + Capstone"
    details: "จาก Hello Node → E-Commerce API — ลงมือทำโปรเจกต์จริงทุก Module"
---

<style>
.node-home {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: linear-gradient(135deg, #339933 10%, #68A063 100%);
}
</style>

## ⚠️ Prerequisite (เงื่อนไขก่อนเรียน)

> ควรเรียน **[📘 JavaScript Zero to Hero](/00-setup)** ให้จบก่อน หรือมีพื้นฐาน JavaScript เทียบเท่า เช่น:
> - ✅ Variables, Functions, Arrays, Objects
> - ✅ Async/Await, Promises, Fetch API
> - ✅ ES6+ (Destructuring, Modules, Classes)
> - ✅ Error Handling (try/catch)

---

## 🗺️ Module Outline

| Module | 📖 หัวข้อ | 🏗️ โปรเจกต์ |
|:------:|:---------|:--------|
| 1 | **[Node.js Introduction](/node/01-01-what-is-node)** — V8, npm, REPL | [🎯 CLI Tool App](/node/01-project-cli-tool) |
| 2 | **[Modules System](/node/02-01-commonjs-esm)** — CommonJS vs ESM | [📦 Utility Package](/node/02-project-utility-package) |
| 3 | **[File System & Path](/node/03-01-filesystem)** — อ่าน/เขียนไฟล์ | [📁 File Manager CLI](/node/03-project-file-manager) |
| 4 | **[HTTP & Server](/node/04-01-http-basics)** — Request/Response | [🌐 Mini HTTP Server](/node/04-project-simple-api) |
| 5 | **[Express.js](/node/05-01-express-setup)** — Routing, Middleware | [🛣️ Express Routes App](/node/05-project-rest-api) |
| 6 | **[REST API Design](/node/06-01-rest-api-concepts)** — CRUD, JSON API | [📡 Todo API](/node/06-project-memory-api) |
| 7 | **[MySQL & SQL](/node/07-01-mysql-basics)** — Queries, Relations | [🗃️ Student DB](/node/07-project-student-db) |
| 8 | **[MongoDB & NoSQL](/node/08-01-mongodb-basics)** — Mongoose ODM | [🍃 Blog API](/node/08-project-blog-api) |
| 9 | **[Authentication](/node/09-01-auth-jwt)** — JWT, Cookies | [🔐 Auth System](/node/09-project-auth-system) |
| 10 | **[File Upload](/node/10-01-file-upload)** — Multer, Validation | [📤 Upload API](/node/10-project-upload-api) |
| 11 | **[Security](/node/11-01-security)** — Helmet, CORS | [🛡️ Secure API](/node/11-project-secure-api) |
| 12 | **[Capstone](/node/12-01-capstone)** — E-Commerce API | [🏆 E-Commerce](/node/12-project-ecommerce-api) |

---

> **พร้อมแล้ว? 👉 [เริ่มจาก Module 1: Node.js คืออะไร?](/node/01-01-what-is-node)**
