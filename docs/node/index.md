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
      link: /node/01-01-node-architecture.md
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
    title: "15 Modules + Capstone"
    details: "จาก Hello Node → WSA2026 Full API — ลงมือทำโปรเจกต์จริงทุก Module"
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


## 🗺️ Module Outline

| Module | 📖 หัวข้อ | 🏗️ โปรเจกต์ |
|:------:|:---------|:--------|
| 1 | **[Node.js Basics & Environment](/node/01-01-node-architecture)** — V8, Event Loop, npm | [🎯 CLI Tool](/node/01-project-cli-tool) |
| 2 | **[Module Systems & Core APIs](/node/02-01-module-systems)** — CommonJS, ESM, fs, Streams | [📁 File Manager](/node/02-project-file-manager) |
| 3 | **[Native HTTP & API Tools](/node/03-01-api-testing-tools)** — Postman, curl, HTTP module | — |
| 4 | **[Express.js Fundamentals](/node/04-01-express-setup)** — Routing, Requests, dotenv | [🛣️ Basic CRUD API](/node/04-project-basic-crud) |
| 5 | **[Middleware & Clean Architecture](/node/05-01-middleware-concept)** — 3-Layer, CORS | [🏗️ Refactored API](/node/05-project-refactored-api) |
| 6 | **[Relational Database (MySQL)](/node/06-01-sql-fundamentals)** — SQL, mysql2, Transactions | [🗃️ Submission API](/node/06-project-inventory-api) |
| 7 | **[NoSQL Database (MongoDB)](/node/07-01-mongodb-basics)** — Mongoose ODM, Relations | [🍃 Blog/Submission API](/node/07-project-blog-api) |
| 8 | **[Authentication & Authorization](/node/08-01-password-hashing)** — bcrypt, JWT, RBAC | [🔐 Auth System](/node/08-project-auth-system) |
| 9 | **[File Upload & Cloud Storage](/node/09-01-multer-upload)** — Multer, S3/Cloudinary | [📤 Gallery API](/node/09-project-gallery-api) |
| 10 | **[Validation, Errors & Security](/node/10-01-input-validation)** — Joi, Helmet, Rate Limit | [🛡️ Secure API](/node/10-project-secure-api) |
| 11 | **[Caching & Performance](/node/11-01-caching-concepts)** — Redis, Cache Strategies | [🚀 Fast API](/node/11-project-fast-api) |
| 12 | **[Real-time Communication](/node/12-01-websockets-intro)** — WebSocket, Socket.io | [💬 Live Scoreboard](/node/12-project-chat-api) |
| 13 | **[Automated Testing](/node/13-01-unit-testing-jest)** — Jest, Supertest | [🧪 Tested API](/node/13-project-tested-api) |
| 14 | **[Containerization & Deployment](/node/14-01-process-managers)** — PM2, Docker | [🚢 Deployment](/node/14-project-deployment) |
| 15 | **[Capstone Project](/node/15-01-capstone)** — Full WSA2026 System | [🏆 WSA2026 API](/node/15-project-ecommerce-api) |


> **พร้อมแล้ว? 👉 [เริ่มจาก Module 1: Node.js Architecture](/node/01-01-node-architecture)**
