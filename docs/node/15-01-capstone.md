# Module 15.1: Capstone Overview — WSA2026 Full System 🏆

> 💡 **เป้าหมาย:** ทบทวนทุกสิ่งที่เรียนมาตลอด 15 modules และเข้าใจภาพรวมของระบบ WSA2026 Test Submission Management System ที่สมบูรณ์แบบ พร้อม technology stack ครบวงจรตั้งแต่ Frontend จนถึง Database

---

## 📖 ทฤษฎีและแนวคิด (Theory & Concepts)

### การเดินทางของคุณ

คุณเริ่มต้นจากการพิมพ์ `console.log("Hello World")` และตอนนี้คุณสามารถสร้างระบบที่ซับซ้อนได้แล้ว! มาทบทวนทุกอย่างที่ผ่านมาก่อนจะไปลงมือสร้าง Capstone Project

---

## 🏗️ Full System Architecture

```
  WSA2026 Test Submission Management System
  ==========================================

  +-----------------+
  |  React Frontend |  (Vite, JWT, Axios)
  |  port: 5173     |
  +-----------------+
          |
          | HTTPS / REST API
          v
  +----------------------------+         +------------------+
  |   Express.js API Server    |         |   File Storage   |
  |   port: 3000               |------>  |   Multer + S3    |
  |                            |         |  (screenshots)   |
  |  Middlewares:              |         +------------------+
  |   - Helmet                 |
  |   - CORS                   |         +------------------+
  |   - Rate Limit             |------>  |     Redis        |
  |   - JWT Auth               |         |  (session cache) |
  |   - Joi Validation         |         +------------------+
  |   - Error Handler          |
  +---+------------------------+
      |
      |-----> +------------------+
      |       |  MySQL (mysql2)  |
      |       |  users           |
      |       |  tasks           |
      |       |  submissions     |
      |       +------------------+
      |
      +-----> +------------------+
              |  MongoDB         |
              |  (Mongoose)      |
              |  activity_logs   |
              |  notifications   |
              +------------------+

  Process Management:
  +------------------+
  |  PM2 Cluster     |  (4 instances, Zero Downtime)
  |  wsa2026-api     |
  +------------------+

  Testing:
  +------------------+
  |  Jest + Supertest|
  |  Unit + E2E      |
  +------------------+
```

---

## 📚 15 Modules Summary — สรุปทุกสิ่งที่เรียนมา

### Module 1: Node.js Architecture & CLI 🏗️
เข้าใจว่า Node.js ทำงานอย่างไร: Single Thread, Event Loop, Non-Blocking I/O
สร้าง CLI Tool ด้วย `process.argv` และ `process.env`

### Module 2: File System & Streams 📂
`fs/promises` — อ่าน เขียน ลบ โฟลเดอร์/ไฟล์
Buffer & Streams — จัดการข้อมูลขนาดใหญ่แบบ chunk by chunk

### Module 3: HTTP & Express Basics 🌐
`http` module ดิบ vs Express.js — routing, middleware, req/res
Content-Type, Status Codes, CORS, Query Parameters

### Module 4: Express Routing & Controllers 🛣️
MVC Pattern — แยก Routes, Controllers, Models
RESTful API Design — naming convention, HTTP methods

### Module 5: Middleware & Error Handling 🛡️
Custom Middleware — logging, auth, validation
Global Error Handler — `asyncHandler`, `AppError`

### Module 6: SQL & MySQL 🗄️
SQL Fundamentals — SELECT, JOIN, GROUP BY, transactions
`mysql2` + connection pool, parameterized queries (ป้องกัน SQL injection)

### Module 7: MongoDB & Mongoose 🍃
NoSQL concepts — document, collection, schema
Mongoose — Schema, Model, populate, aggregation pipeline

### Module 8: Authentication & JWT 🔑
bcrypt password hashing, JWT (sign, verify, decode)
Auth Middleware — `verifyToken`, role-based access (`isJudge`, `isManager`)

### Module 9: File Upload (Multer) 📎
Multer — `single()`, `array()`, file type validation, size limit
`diskStorage` — กำหนดชื่อไฟล์และโฟลเดอร์เอง

### Module 10: Input Validation (Joi) ✅
Joi schema validation — `string()`, `number()`, `required()`, custom messages
Validation middleware — ใช้ก่อน Controller ทุกครั้ง

### Module 11: Security Hardening 🔒
Helmet — HTTP security headers
express-rate-limit — ป้องกัน brute force
CORS configuration, input sanitization

### Module 12: Caching (Redis) ⚡
Redis fundamentals — SET, GET, TTL
Cache Middleware — cache leaderboard 60 วินาที
Cache invalidation เมื่อ score อัปเดต

### Module 13: Testing (Jest) 🧪
Unit Testing — test Controllers แยกออกจาก DB
Integration Testing — Jest + Supertest ยิง API จริง
Test Coverage Report

### Module 14: Process Managers (PM2) 🤖
PM2 — Auto Restart, Cluster Mode, Zero Downtime Reload
`ecosystem.config.js` — environment config, log management
Startup Hook, Graceful Shutdown

### Module 15: Capstone 🏆
รวมทุกอย่างสร้าง WSA2026 Full System สมบูรณ์แบบ

---

## 🛠️ Technology Stack

```
  Dependencies:
  =============
  express             — Web framework หลัก
  mysql2              — MySQL driver (รองรับ Promise)
  mongoose            — MongoDB ODM
  bcryptjs            — Password hashing
  jsonwebtoken        — JWT sign/verify
  cors                — CORS middleware
  dotenv              — Environment variables
  multer              — File upload
  joi                 — Input validation
  helmet              — HTTP security headers
  express-rate-limit  — Rate limiting
  redis               — Redis client (caching)
  socket.io           — WebSocket (real-time)
  jest                — Testing framework
  supertest           — HTTP integration testing

  Dev Dependencies:
  =================
  nodemon             — Auto-reload dev server
  pm2                 — Production process manager
```

---

## 🗄️ Database Schema Review

### MySQL Tables (Relational)

```sql
-- ผู้ใช้งานระบบ
CREATE TABLE users (
  id       INT          PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50)  NOT NULL UNIQUE,
  name     VARCHAR(100) NOT NULL,
  role     ENUM('candidate','judge','manager') NOT NULL,
  country  VARCHAR(50)  NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- โจทย์การแข่งขัน
CREATE TABLE tasks (
  id                  INT         PRIMARY KEY AUTO_INCREMENT,
  title               VARCHAR(200) NOT NULL,
  time_limit_minutes  INT          NOT NULL,
  max_score           INT          NOT NULL DEFAULT 100
);

-- การส่งงาน
CREATE TABLE submissions (
  id              INT          PRIMARY KEY AUTO_INCREMENT,
  candidate_id    INT          NOT NULL,
  task_id         INT          NOT NULL,
  submission_url  VARCHAR(500) NOT NULL,
  submitted_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  score           DECIMAL(5,2) DEFAULT NULL,
  status          ENUM('pending','scored','rejected') DEFAULT 'pending',
  screenshot_path VARCHAR(500) DEFAULT NULL,
  FOREIGN KEY (candidate_id) REFERENCES users(id),
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);
```

### ER Diagram

```
  users                submissions            tasks
  =====                ===========            =====
  id (PK)       <---   candidate_id (FK)      id (PK)
  username             id (PK)         --->   task_id (FK)
  name                 task_id (FK)           title
  role                 submission_url         time_limit_minutes
  country              submitted_at           max_score
  password             score
  created_at           status
                       screenshot_path
```

### MongoDB Collections (Document)

```javascript
// activity_logs — เก็บ log ทุก action ในระบบ
{
  _id:          ObjectId,
  user_id:      Number,      // อ้างอิง MySQL users.id
  action:       String,      // "SUBMIT", "LOGIN", "SCORE"
  details:      Object,      // ข้อมูลเพิ่มเติม
  ip_address:   String,
  created_at:   Date
}

// notifications — การแจ้งเตือน
{
  _id:          ObjectId,
  recipient_id: Number,
  type:         String,      // "SCORE_UPDATED", "SUBMISSION_RECEIVED"
  message:      String,
  is_read:      Boolean,
  created_at:   Date
}
```

---

## 🔒 Security Checklist

| Security Layer | Status | Implementation |
|:---|:---:|:---|
| Password Hashing | ✓ | `bcryptjs` with salt rounds 12 |
| JWT Authentication | ✓ | Access token 1h, verify every request |
| CORS | ✓ | Whitelist allowed origins |
| Rate Limiting | ✓ | 100 req/15min (global), 5 req/15min (login) |
| Input Validation | ✓ | Joi schema ทุก endpoint |
| HTTP Security Headers | ✓ | Helmet middleware |
| SQL Injection Prevention | ✓ | Parameterized queries only |
| File Upload Validation | ✓ | MIME type + file size limit |
| Environment Variables | ✓ | `.env` + dotenv (ห้าม hardcode) |
| Error Message Sanitization | ✓ | ไม่ส่ง stack trace ใน production |

---

## 📡 Complete API Endpoints Reference

| Method | Path | Auth | Request Body | Response |
|:---|:---|:---|:---|:---|
| `POST` | `/api/auth/register` | None | `{ username, name, role, country, password }` | `{ token, user }` |
| `POST` | `/api/auth/login` | None | `{ username, password }` | `{ token, user }` |
| `GET` | `/api/auth/me` | Any | — | `{ user }` |
| `GET` | `/api/tasks` | Any | — | `{ data: [...tasks] }` |
| `GET` | `/api/tasks/:id` | Any | — | `{ data: task }` |
| `POST` | `/api/submissions` | Candidate | `{ task_id, submission_url }` | `{ data: submission }` |
| `GET` | `/api/submissions` | Judge/Manager | `?status=&task_id=` | `{ data: [...] }` |
| `PUT` | `/api/submissions/:id/score` | Judge | `{ score }` | `{ data: updated }` |
| `GET` | `/api/leaderboard` | Public | — | `{ data: top10 }` |
| `POST` | `/api/uploads/screenshot` | Candidate | `multipart/form-data` | `{ url }` |
| `GET` | `/api/manager/stats` | Manager | — | `{ stats }` |

---

## 🧩 Key Code Patterns Quick Reference

### Auth Middleware

```javascript
// middleware/auth.js
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
};

module.exports = { verifyToken, requireRole };
```

### asyncHandler Wrapper

```javascript
// utils/asyncHandler.js
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;

// การใช้งาน:
router.get("/submissions", verifyToken, asyncHandler(async (req, res) => {
  const rows = await db.query("SELECT * FROM submissions WHERE candidate_id = ?", [req.user.id]);
  res.json({ data: rows[0] });
}));
```

### AppError Class

```javascript
// utils/AppError.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;  // บอกว่าเป็น error ที่คาดไว้ (ไม่ใช่ bug)
  }
}

module.exports = AppError;

// การใช้งาน:
if (!submission) throw new AppError("Submission not found", 404);
```

### Global Error Handler

```javascript
// middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message    = err.isOperational ? err.message : "Internal Server Error";

  if (process.env.NODE_ENV === "development") {
    console.error("ERROR:", err.stack);
  }

  res.status(statusCode).json({
    error:  message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};
```

### DB Pool (mysql2)

```javascript
// db.js
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host:            process.env.DB_HOST,
  user:            process.env.DB_USER,
  password:        process.env.DB_PASS,
  database:        process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit:      0
});

module.exports = pool;

// การใช้งาน:
const db = require("./db");
const [rows] = await db.query("SELECT * FROM tasks WHERE id = ?", [taskId]);
```

---

## 🎯 โจทย์ฝึกปฏิบัติเสริมความเข้าใจ (Mini Exercise)

- **โจทย์:** วาด Architecture Diagram ของระบบ WSA2026 ด้วยมือ (หรือใน text)
  แสดงให้เห็น: Client → Middleware Stack → Controller → DB → Response
  และระบุว่า Middleware แต่ละตัว (Helmet, CORS, Rate Limit, JWT, Joi) ทำงานตอนไหนใน request lifecycle

::: details 💡 คำใบ้ (Hint)
```
Request Lifecycle:
  Client
    ↓
  Helmet (เพิ่ม security headers)
    ↓
  CORS (เช็ค origin)
    ↓
  Rate Limiter (เช็ค IP ไม่เกิน N req/min)
    ↓
  JSON Parser (parse body)
    ↓
  verifyToken (เช็ค JWT)
    ↓
  requireRole (เช็ค role)
    ↓
  Joi Validation (validate body/params)
    ↓
  Controller (business logic)
    ↓
  MySQL / MongoDB
    ↓
  Response (JSON)
```
:::

---

## 🔥 Challenge (โจทย์ท้าทาย!)

### Challenge: Complete System Review

1. **Security Audit:** ไปดู code ในทุก module ที่เรียนมา แล้วหาว่ามี endpoint ไหนที่:
   - ลืม `verifyToken`
   - ไม่ validate input
   - ส่ง error message ที่มี stack trace

2. **Performance Test:** ใช้ `autocannon` หรือ `k6` ยิง `/api/leaderboard` 1,000 req/sec
   - เปรียบเทียบ: มี Redis cache vs ไม่มี
   - บันทึกผล latency p50, p95, p99

3. **Draw Architecture:** วาด sequence diagram แสดง flow ของ `POST /api/submissions`:
   - Frontend → JWT verify → Joi validate → MySQL insert → Redis invalidate → Response

---

## 🗣️ ทบทวน (Review)

::: details ❓ คำถามทบทวน

**คำถาม 1:** ระบบ WSA2026 ใช้ทั้ง MySQL และ MongoDB ทำไมถึงต้องใช้ 2 database?
**แนวคำตอบ:** MySQL (Relational) เหมาะกับข้อมูลที่มีความสัมพันธ์กันชัดเจนและต้องการ consistency เช่น users, tasks, submissions (ต้องมี foreign key ชัดเจน) ส่วน MongoDB เหมาะกับข้อมูลที่ schema เปลี่ยนบ่อยหรือมีโครงสร้างซับซ้อน เช่น activity logs ที่แต่ละ action มีข้อมูลต่างกัน และต้องการ write speed สูง

**คำถาม 2:** JWT ต่างจาก Session อย่างไร? ระบบ WSA2026 เลือกใช้ JWT เพราะอะไร?
**แนวคำตอบ:** Session เก็บข้อมูลไว้ที่ Server (ต้องมี shared storage เช่น Redis ถ้า Cluster) ส่วน JWT เก็บใน Token ที่ Client ถือไว้เอง Server ไม่ต้อง store อะไร ระบบ WSA2026 ใช้ JWT เพราะรัน PM2 Cluster Mode (หลาย instances) ถ้าใช้ Session ต้องมี Redis ร่วม แต่ JWT ทำงานได้ทันทีไม่ต้อง share state

**คำถาม 3:** `asyncHandler` wrapper มีประโยชน์อย่างไร?
**แนวคำตอบ:** ทำให้ไม่ต้องเขียน `try/catch` ซ้ำๆ ในทุก async route handler แทนที่จะเขียน try/catch เองทุกตัว เพียงแค่ครอบด้วย `asyncHandler()` ถ้าเกิด Error จะส่งไปที่ Global Error Handler ผ่าน `next(err)` โดยอัตโนมัติ ทำให้โค้ดสะอาดและไม่ลืม handle error

**คำถาม 4:** Redis Cache ใน WSA2026 ช่วยอะไร? ควร invalidate cache เมื่อไหร่?
**แนวคำตอบ:** `/api/leaderboard` ถูกเรียกบ่อยมาก (ทุกคนดูตลอด) แต่ข้อมูลไม่เปลี่ยนบ่อย Redis cache ผลลัพธ์ไว้ 60 วินาที ทำให้ไม่ต้อง query MySQL ทุก request ควร invalidate cache (ลบ key จาก Redis) เมื่อ `PUT /api/submissions/:id/score` เพื่อให้ leaderboard อัปเดตทันทีหลังกรรมการตัดสิน

:::

---

> **📖 Technology Stack Reference:**
> - **express** `^4.18` — Web framework
> - **mysql2** `^3.6` — MySQL driver พร้อม Promise support
> - **mongoose** `^8.0` — MongoDB ODM
> - **bcryptjs** `^2.4` — Password hashing (pure JS, ไม่ต้อง native module)
> - **jsonwebtoken** `^9.0` — JWT implementation
> - **joi** `^17.11` — Schema validation
> - **helmet** `^7.1` — Security headers
> - **express-rate-limit** `^7.1` — Rate limiting
> - **multer** `^1.4` — File upload middleware
> - **redis** `^4.6` — Redis client
> - **socket.io** `^4.7` — WebSocket
> - **jest** `^29.7` — Testing framework
> - **supertest** `^6.3` — HTTP testing

👉 **[ไปทำโปรเจกต์ Capstone: Project 15 — WSA2026 Complete API](/node/15-project-ecommerce-api)**
