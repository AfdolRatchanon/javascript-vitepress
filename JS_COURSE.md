# 📗 Node.js Backend Course

> **45 บทเรียน + 15 โปรเจกต์** (16 Module) — สอน Backend Development ระดับ Production พร้อมสถาปัตยกรรมระดับองค์กร
> ⚠️ **อ้างอิงมาตรฐาน:** ทุกไฟล์เนื้อหาต้องยึดหลัก **Gold Standard (10 องค์ประกอบ)** และกฎ **No Duplication** ตามที่ระบุใน `README.md`

### 🏗️ สถาปัตยกรรม (Single Site, Triple Section)

ทุก Course อยู่ใน **VitePress เดียวกัน** แยกเป็น Section ใน Sidebar:

\`\`\`text
JavaScript/docs/
├── javascript/              ← 📘 JavaScript Section 
├── node/                    ← 📗 Node.js Section (คุณอยู่ที่นี่)
└── react/                   ← ⚛️ React Section
\`\`\`

---

### 🗺️ Node.js Module Outline (หัวข้อย่อย)

#### Module 1: Node.js Basics & Environment (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `01-01-node-architecture.md` | สถาปัตยกรรม V8 Engine, Non-blocking I/O, Event Loop ระดับ Server | เปรียบเทียบการทำงานของ Node.js vs Browser |
| `01-02-npm-and-packages.md` | `package.json`, คำสั่ง NPM พื้นฐาน, Semantic Versioning | |
| 🎯 `01-project-cli-tool.md` | CLI Tool App: รับค่าผ่าน `process.argv` และสร้างเครื่องมือ Command Line | ปูพื้นฐานการเขียนสคริปต์ฝั่ง Server |

#### Module 2: Module Systems & Core APIs (3 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `02-01-module-systems.md` | CommonJS (`require`) vs ESM (`import`), Module Resolution | *อ้างอิงเนื้อหา ESM จากฝั่ง JS Module 10* |
| `02-02-file-system.md` | การใช้งาน `fs/promises`, การจัดการ `path` และ `__dirname` | |
| `02-03-buffers-streams.md` | ข้อมูลระดับไบต์ (`Buffer`), การสตรีมไฟล์ขนาดใหญ่ (`Streams`), `EventEmitter` | หัวใจความเร็วของ Node.js |
| 📁 `02-project-file-manager.md` | Stream File Manager: โปรแกรมจัดการไฟล์ที่ใช้ทรัพยากรน้อยด้วย Streams | |

#### Module 3: Native HTTP & API Tools 🔍 (2 บทเรียน)

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `03-01-api-testing-tools.md` | วงจร Request/Response, การใช้ **Postman** หรือ **Thunder Client** | **[Main Track]** เครื่องมือหลักที่ต้องใช้ตลอดคอร์ส |
| `03-02-native-http-reference.md` | **[Reference]** สร้าง Server ด้วย `http` module, ดัก Route เอง, จัดการ Chunk | **[Optional]** มีไว้อ่านเป็นคู่มือใต้กระโปรงรถ ไม่บังคับทำโปรเจกต์ |

#### Module 4: Express.js Fundamentals (3 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `04-01-express-setup.md` | Hello Express, Routing พื้นฐาน, JSON Response | นำเข้าสู่ Framework พระเอกของเรา |
| `04-02-handling-requests.md` | Route Parameters, Query Strings, Request Body | |
| `04-03-environment-variables.md` | การตั้งค่า `.env`, `dotenv`, การซ่อนพอร์ตและรหัสผ่าน | สอนซ่อนความลับก่อนพาไปต่อ Database |
| 🛣️ `04-project-basic-crud.md` | Express CRUD API: สร้างระบบจัดการข้อมูล (In-memory) พร้อมซ่อน Config | |

#### Module 5: Middleware & Clean Architecture (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `05-01-middleware-concept.md` | Middleware Concept, `next()`, Built-in Middleware | กองกำลังด่านหน้าของ Express |
| `05-02-layered-architecture.md` | สถาปัตยกรรมโค้ด: Routes ➡️ Controllers ➡️ Services | สอน Clean Code ตั้งแต่โปรเจกต์ยังเล็ก |
| 🏗️ `05-project-refactored-api.md` | Architecture API: นำโปรเจกต์ Module 4 มารีแฟกเตอร์ใหม่ให้เป็นระเบียบ | |

#### Module 6: Relational Database (MySQL) (3 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `06-01-sql-fundamentals.md` | `CREATE TABLE`, Data Types, Basic CRUD (SQL Commands) | |
| `06-02-node-mysql.md` | เชื่อมต่อผ่าน `mysql2`, Connection Pool, Parameterized Queries | เน้นเรื่องป้องกัน SQL Injection |
| `06-03-advanced-sql.md` | `JOIN` (Relations) และ Database Transactions (การทำ Rollback) | |
| 🗃️ `06-project-inventory-api.md` | Inventory API: ระบบตัดสต็อกที่ใช้ Transactions เพื่อความปลอดภัยของข้อมูล | |

#### Module 7: NoSQL Database (MongoDB) (3 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `07-01-mongodb-basics.md` | Document Model (BSON), NoSQL vs SQL, MongoDB Atlas | เปรียบเทียบกับ MySQL ใน Module 6 ให้เห็นภาพชัด |
| `07-02-mongoose-odm.md` | Mongoose Schema, Model, Validation พื้นฐาน | |
| `07-03-mongoose-relations.md` | การเชื่อมข้อมูลแบบ Reference และการใช้ `populate()` | |
| 📘 `07-project-blog-api.md` | Blog API: ระบบโพสต์และคอมเมนต์ (One-to-Many Relationship) | |

#### Module 8: Authentication & Authorization (3 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `08-01-password-hashing.md` | Hashing vs Encryption, การใช้ `bcrypt` | |
| `08-02-jwt-fundamentals.md` | โครงสร้าง JWT, `jsonwebtoken` package, Token Lifecycle | |
| `08-03-auth-middleware.md` | สร้าง Auth Middleware, Role-based Access Control (RBAC) | |
| 🔐 `08-project-auth-system.md` | Auth System: ระบบ Register/Login และป้องกัน Route เฉพาะ Admin | |

#### Module 9: File Upload & Cloud Storage (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `09-01-multer-upload.md` | `multer` package, จัดการ `multipart/form-data`, กรองชนิดไฟล์ | |
| `09-02-cloud-storage.md` | ส่งภาพไปเก็บที่ Cloudinary / AWS S3, เก็บเฉพาะ URL ลง Database | สอนแนวทางการทำงานจริงบน Cloud |
| 📤 `09-project-gallery-api.md` | User Profile API: อัปโหลดรูปโปรไฟล์เก็บขึ้น Cloud | |

#### Module 10: Validation, Errors & Security (3 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `10-01-input-validation.md` | `express-validator`, Validation Chains, Sanitization | |
| `10-02-centralized-errors.md` | Global Error Handler Middleware, โยน Custom Error ลงมาจัดการที่เดียว | อ้างอิง Custom Error จาก JS Module 9 |
| `10-03-security-hardening.md` | `helmet`, `cors`, `express-rate-limit`, ป้องกัน NoSQL Injection | |
| 🛡️ `10-project-secure-api.md` | Robust API: นำ API ที่มีอยู่มาสวมเกราะป้องกันและดัก Error ทุกจุด | |

#### Module 11: Caching & Performance (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `11-01-caching-concepts.md` | In-memory vs Distributed Cache, Cache Invalidation | |
| `11-02-redis-integration.md` | ติดตั้งและใช้ Redis (`SET`, `GET`, `EXPIRE`) คั่นกลาง Database | ฟีเจอร์ระดับแข่งขัน (Hero Level) |
| 🚀 `11-project-fast-api.md` | Fast API: ระบบดึงแคตตาล็อกสินค้าที่ดึงข้อมูลจาก Redis ภายในเสี้ยววินาที | |

#### Module 12: Real-time Communication (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `12-01-websockets-intro.md` | WebSockets vs HTTP Polling | |
| `12-02-socket-io.md` | การใช้งาน `Socket.io`, Broadcast, Rooms, Namespaces | |
| 💬 `12-project-chat-api.md` | Live Chat API: ห้องแชทแบบเรียลไทม์พร้อมระบุตัวตน | |

#### Module 13: Automated Testing (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `13-01-unit-testing-jest.md` | การเขียน Unit Test ด้วย `Jest`, Mocking | |
| `13-02-api-testing-supertest.md` | API Integration Testing ด้วย `Supertest` (จำลองการยิง HTTP) | |
| 🧪 `13-project-tested-api.md` | Tested API: เขียน Test Cases ครอบคลุมระบบ CRUD อย่างน้อย 80% | ทักษะสำคัญที่บริษัทคาดหวังจาก Junior Dev |

#### Module 14: Containerization & Deployment (2 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `14-01-process-managers.md` | รันโปรเจกต์โหมด Production, ใช้ `PM2` จัดการ Background Process | |
| `14-02-docker-basics.md` | ทฤษฎี Container, การเขียน `Dockerfile` และ `docker-compose.yml` | |
| 🚢 `14-project-deployment.md` | Deployment Lab: แพ็กเกจ API และ Database ลง Docker ให้พร้อมนำขึ้น Cloud | โปรเจกต์เน้น Operation/DevOps ไม่เน้นเขียนโค้ด API ใหม่ |

#### Module 15: Capstone Project (1 บทเรียน + 1 โปรเจกต์)

| ไฟล์ | หัวข้อย่อย | กฎ No Duplication & Focus |
|:-----|:----------|:---|
| `15-01-capstone.md` | System Architecture Design, ER Diagram, วางแผน API Endpoints | |
| 🏆 `15-project-ecommerce-api.md` | E-Commerce API: นำความรู้ตั้งแต่ Express, DB, Auth, Redis, Docker มาประกอบร่าง | โปรเจกต์จบที่ใช้เป็น Portfolio สมัครงานได้เลย |