# Project 5: Refactored API — WSA2026 Candidate Management 🛠️

> 💡 **เป้าหมาย:** นำความรู้จาก Module 5 ทั้งหมด (Layered Architecture + CORS) มาสร้าง API สำหรับจัดการข้อมูล Candidate ในระบบ WSA2026 Test Submission Management System โดยใช้โครงสร้าง Routes → Controllers → Services อย่างถูกต้อง

---

## ก่อนและหลัง Refactor (Before vs After)

ก่อนอื่นเลย มาดูความแตกต่างระหว่างโค้ดแบบ "Monolithic" กับ "3-Layer" กัน:

```
╔══════════════════════════════════════════════════════════════════╗
║         BEFORE: MONOLITHIC (1 ไฟล์ทำทุกอย่าง)                  ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  server.js (500+ บรรทัด)                                        ║
║  ├── SQL queries รวมกับ req/res                                  ║
║  ├── Business Logic กระจายอยู่ทั่ว                              ║
║  ├── ทดสอบไม่ได้                                                ║
║  └── แก้ตรงนึง พังทั้งระบบ                                     ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║         AFTER: 3-LAYER ARCHITECTURE                             ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  routes/candidateRoutes.js    ← กำหนด URL path                  ║
║       ↓                                                          ║
║  controllers/candidateController.js  ← รับ req, ส่ง res        ║
║       ↓                                                          ║
║  services/candidateService.js ← Business Logic เท่านั้น        ║
║       ↓                                                          ║
║  config/db.js                 ← DB Connection                    ║
║       ↓                                                          ║
║  DATABASE (users table — candidates)                             ║
║                                                                  ║
║  ผล: แต่ละไฟล์ 30-50 บรรทัด, ทดสอบได้, แก้ได้ปลอดภัย         ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 🎯 เป้าหมายของโปรเจกต์

สร้าง **Candidate API** สำหรับระบบ WSA2026 ที่:
- `GET /api/candidates` — ดูรายชื่อ candidates ทั้งหมด (Judge/Manager)
- `GET /api/candidates/:id` — ดูข้อมูล candidate คนเดียว
- `POST /api/candidates` — สร้าง candidate ใหม่ (Manager)
- `PUT /api/candidates/:id` — แก้ไขข้อมูล candidate (Manager)
- `DELETE /api/candidates/:id` — ลบ candidate (Manager)

**Database Table ที่ใช้:** `users` (role = `'candidate'`)

---

## 🛠️ Step 1: Setup & Project Structure

```bash
mkdir wsa2026-candidate-api
cd wsa2026-candidate-api
npm init -y
npm install express cors morgan dotenv mysql2
```

โครงสร้างโฟลเดอร์ที่สมบูรณ์:

```
wsa2026-candidate-api/
├── config/
│   └── db.js               ← Database Connection
├── controllers/
│   └── candidateController.js   ← HTTP Handlers
├── services/
│   └── candidateService.js      ← Business Logic
├── routes/
│   └── candidateRoutes.js       ← URL Definitions
├── middleware/
│   └── errorHandler.js          ← Global Error Handler
├── app.js                  ← Express Setup
├── server.js               ← Entry Point
├── .env                    ← Environment Variables
└── package.json
```

---

## ⚙️ Step 2: Config & Setup Files

::: code-group

```js [config/db.js]
// WSA2026: Database Connection Pool
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'wsa2026',
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool;
```

```.env [.env]
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=wsa2026

# WSA2026 Competition Frontend URL
CLIENT_URL=http://localhost:5173
```

```js [app.js]
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const candidateRoutes = require('./routes/candidateRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ─── Middleware Stack ───────────────────────────────────────────
// 1. CORS — ต้องมาก่อนสุด
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    // Authorization header สำหรับ JWT ใน WSA2026
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// 2. Request Logger
app.use(morgan('dev'));

// 3. JSON Body Parser
app.use(express.json());

// ─── Routes ────────────────────────────────────────────────────
app.use('/api/candidates', candidateRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', system: 'WSA2026 Candidate API' });
});

// 4. 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: `Not Found: ${req.originalUrl}` });
});

// 5. Global Error Handler (ต้องอยู่ล่างสุด!)
app.use(errorHandler);

module.exports = app;
```

```js [server.js]
const app = require('./app');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`WSA2026 Candidate API running on port ${PORT}`);
});
```

:::

---

## 🛣️ Step 3: Route Layer

::: code-group

```js [routes/candidateRoutes.js]
// =========================================
// LAYER 1: ROUTE LAYER
// หน้าที่: กำหนด URL path เท่านั้น
// =========================================
const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');

// GET /api/candidates        — ดูรายชื่อ candidates ทั้งหมด
// POST /api/candidates       — เพิ่ม candidate ใหม่
router
    .route('/')
    .get(candidateController.getAllCandidates)
    .post(candidateController.createCandidate);

// GET /api/candidates/:id    — ดูข้อมูล candidate รายคน
// PUT /api/candidates/:id    — แก้ไขข้อมูล
// DELETE /api/candidates/:id — ลบ candidate
router
    .route('/:id')
    .get(candidateController.getCandidateById)
    .put(candidateController.updateCandidate)
    .delete(candidateController.deleteCandidate);

module.exports = router;
```

:::

---

## 👮 Step 4: Controller Layer

::: code-group

```js [controllers/candidateController.js]
// =========================================
// LAYER 2: CONTROLLER LAYER
// หน้าที่: รับ req/res, ตรวจ Input, เรียก Service
// ห้ามมี: SQL, Business Logic ซับซ้อน
// =========================================
const candidateService = require('../services/candidateService');

// GET /api/candidates
exports.getAllCandidates = async (req, res, next) => {
    try {
        const { country, region, page = 1, limit = 20 } = req.query;

        const result = await candidateService.getAllCandidates({
            country,
            region,
            page: Number(page),
            limit: Number(limit)
        });

        res.json({
            total: result.total,
            page: result.page,
            data: result.data
        });
    } catch (err) {
        next(err);
    }
};

// GET /api/candidates/:id
exports.getCandidateById = async (req, res, next) => {
    try {
        const candidate = await candidateService.getCandidateById(req.params.id);
        res.json({ data: candidate });
    } catch (err) {
        if (err.message === 'CANDIDATE_NOT_FOUND') {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        next(err);
    }
};

// POST /api/candidates
exports.createCandidate = async (req, res, next) => {
    try {
        const { username, name, country, region } = req.body;

        // ตรวจ Input เบื้องต้น
        if (!username || !name || !country) {
            return res.status(400).json({
                error: 'username, name, and country are required'
            });
        }

        const candidate = await candidateService.createCandidate({
            username,
            name,
            country,
            region
        });

        res.status(201).json({
            message: 'Candidate created successfully',
            data: candidate
        });
    } catch (err) {
        if (err.message === 'USERNAME_EXISTS') {
            return res.status(409).json({ error: 'Username already exists' });
        }
        next(err);
    }
};

// PUT /api/candidates/:id
exports.updateCandidate = async (req, res, next) => {
    try {
        const updated = await candidateService.updateCandidate(
            req.params.id,
            req.body
        );
        res.json({ message: 'Candidate updated', data: updated });
    } catch (err) {
        if (err.message === 'CANDIDATE_NOT_FOUND') {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        next(err);
    }
};

// DELETE /api/candidates/:id
exports.deleteCandidate = async (req, res, next) => {
    try {
        await candidateService.deleteCandidate(req.params.id);
        res.status(204).send();
    } catch (err) {
        if (err.message === 'CANDIDATE_NOT_FOUND') {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        next(err);
    }
};
```

:::

---

## 🧠 Step 5: Service Layer

::: code-group

```js [services/candidateService.js]
// =========================================
// LAYER 3: SERVICE LAYER
// หน้าที่: Business Logic ล้วนๆ
// ห้ามมี: req, res, HTTP status codes
// =========================================
const db = require('../config/db');

// Business Function: ดู candidates ทั้งหมด (พร้อม filter + pagination)
exports.getAllCandidates = async ({ country, region, page, limit }) => {
    let query = `
        SELECT id, username, name, country, region
        FROM users
        WHERE role = 'candidate'
    `;
    const params = [];

    // Business Rule: filter ตาม country/region ถ้ามีการส่งมา
    if (country) {
        query += ' AND country = ?';
        params.push(country);
    }
    if (region) {
        query += ' AND region = ?';
        params.push(region);
    }

    // Count ก่อน Paginate
    const [countResult] = await db.query(
        `SELECT COUNT(*) AS total FROM (${query}) AS sub`,
        params
    );
    const total = countResult[0].total;

    // Pagination
    const offset = (page - 1) * limit;
    query += ' ORDER BY name ASC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await db.query(query, params);
    return { total, page, data: rows };
};

// Business Function: ดู candidate รายคน
exports.getCandidateById = async (id) => {
    const [rows] = await db.query(
        `SELECT id, username, name, country, region
         FROM users
         WHERE id = ? AND role = 'candidate'`,
        [id]
    );
    if (rows.length === 0) throw new Error('CANDIDATE_NOT_FOUND');
    return rows[0];
};

// Business Function: สร้าง candidate ใหม่
exports.createCandidate = async ({ username, name, country, region }) => {
    // Business Rule: ตรวจ username ซ้ำ
    const [existing] = await db.query(
        'SELECT id FROM users WHERE username = ?',
        [username]
    );
    if (existing.length > 0) throw new Error('USERNAME_EXISTS');

    // Business Rule: ตั้ง role = 'candidate' เสมอ (ป้องกัน privilege escalation)
    const [result] = await db.query(
        `INSERT INTO users (username, name, country, region, role)
         VALUES (?, ?, ?, ?, 'candidate')`,
        [username, name, country, region || null]
    );

    const [rows] = await db.query(
        'SELECT id, username, name, country, region FROM users WHERE id = ?',
        [result.insertId]
    );
    return rows[0];
};

// Business Function: แก้ไขข้อมูล candidate
exports.updateCandidate = async (id, updateData) => {
    // ตรวจว่ามีอยู่จริงก่อน
    await exports.getCandidateById(id);

    // Business Rule: ไม่อนุญาตให้เปลี่ยน role หรือ password_hash ผ่าน endpoint นี้
    const { name, country, region } = updateData;
    await db.query(
        'UPDATE users SET name = COALESCE(?, name), country = COALESCE(?, country), region = COALESCE(?, region) WHERE id = ?',
        [name, country, region, id]
    );

    return exports.getCandidateById(id);
};

// Business Function: ลบ candidate
exports.deleteCandidate = async (id) => {
    await exports.getCandidateById(id); // throw CANDIDATE_NOT_FOUND ถ้าไม่มี
    await db.query('DELETE FROM users WHERE id = ? AND role = ?', [id, 'candidate']);
    return true;
};
```

:::

---

## 🛡️ Step 6: Global Error Handler

::: code-group

```js [middleware/errorHandler.js]
// Global Error Handler — รับ Error ทุกตัวที่ผ่านมาจาก next(err)
module.exports = (err, req, res, next) => {
    console.error(`[WSA2026 Error] ${err.message}`);

    // HTTP Errors ที่รู้จัก
    const errorMap = {
        'CANDIDATE_NOT_FOUND': { status: 404, message: 'Candidate not found' },
        'USERNAME_EXISTS':     { status: 409, message: 'Username already exists' },
        'ALREADY_SUBMITTED':   { status: 409, message: 'Already submitted' },
        'TASK_NOT_FOUND':      { status: 404, message: 'Task not found' },
    };

    const known = errorMap[err.message];
    if (known) {
        return res.status(known.status).json({ error: known.message });
    }

    // Unexpected Error
    res.status(500).json({ error: 'Internal Server Error' });
};
```

:::

---

## 📤 ผลลัพธ์ที่คาดหวัง (Expected Output)

รันด้วย `node server.js` แล้วทดสอบ:

```bash
# ดู candidates ทั้งหมด
curl http://localhost:3000/api/candidates

# Response:
{
  "total": 3,
  "page": 1,
  "data": [
    { "id": 1, "username": "somchai_th", "name": "Somchai Jaidee", "country": "Thailand", "region": "Asia" },
    { "id": 2, "username": "nguyen_vn", "name": "Nguyen Van A", "country": "Vietnam", "region": "Asia" },
    { "id": 3, "username": "kim_kr", "name": "Kim Minjun", "country": "Korea", "region": "Asia" }
  ]
}

# ดู candidate รายคน
curl http://localhost:3000/api/candidates/1

# Response:
{
  "data": {
    "id": 1,
    "username": "somchai_th",
    "name": "Somchai Jaidee",
    "country": "Thailand",
    "region": "Asia"
  }
}

# สร้าง candidate ใหม่
curl -X POST http://localhost:3000/api/candidates \
     -H "Content-Type: application/json" \
     -d '{"username":"new_candidate","name":"New Person","country":"Japan","region":"Asia"}'

# Response: 201 Created
{
  "message": "Candidate created successfully",
  "data": { "id": 4, "username": "new_candidate", ... }
}
```

---

## 🔥 Challenge (โจทย์ท้าทาย!)

- **โจทย์:** เพิ่ม **Tasks Module** โดยใช้ 3-layer pattern เดียวกัน:

  1. สร้าง `routes/taskRoutes.js` สำหรับ:
     - `GET /api/tasks` — ดูรายการ tasks ทั้งหมด
     - `GET /api/tasks/:id` — ดูรายละเอียด task รวมถึง `max_score` และ `time_limit_minutes`
     - `POST /api/tasks` — manager สร้าง task ใหม่

  2. สร้าง `controllers/taskController.js` — handler ครบทุก route

  3. สร้าง `services/taskService.js` — business logic เช่น:
     - validate `time_limit_minutes > 0`
     - validate `max_score > 0`
     - throw `TASK_NOT_FOUND` ถ้าไม่มี task นั้น

  4. Mount route ใน `app.js`:
     ```javascript
     app.use('/api/tasks', require('./routes/taskRoutes'));
     ```

  **เป้าหมาย:** เมื่อเสร็จแล้ว API ควรรองรับทั้ง `/api/candidates` และ `/api/tasks` แบบ 3-layer เหมือนกัน

---

## 🗣️ ทบทวน (Review)

::: details ❓ คำถามทบทวนความเข้าใจ

**คำถาม 1:** ในโปรเจกต์นี้ `morgan` ทำหน้าที่อะไร และทำไมต้องวางหลัง `cors()` แต่ก่อน Routes?

**แนวคำตอบ:** `morgan` เป็น Logging Middleware ที่บันทึก Request ทุกตัว เช่น `GET /api/candidates 200 12ms` ต้องวางหลัง `cors()` เพราะ CORS ต้องจัดการ Preflight ก่อน และวางก่อน Routes เพราะต้องการ log ทุก Request ที่เข้ามา ถ้าวางหลัง Routes จะ log ได้แค่ Request ที่มี Route รองรับ

**คำถาม 2:** ทำไม `candidateService.js` จึง throw `Error('CANDIDATE_NOT_FOUND')` เป็น string แทนที่จะ return `null`?

**แนวคำตอบ:** การ throw Error ทำให้ Controller สามารถจัดการกรณีนี้แยกออกจาก "ไม่มีข้อมูล" กับ "ข้อมูล empty array" ได้ชัดเจน ถ้า return `null` Controller ต้องตรวจ `if (result === null)` ทุกที่ แต่ถ้า throw Error ด้วย code ที่ชัดเจน Controller แค่ `catch` แล้วดู `err.message` เพื่อแปลงเป็น HTTP Status ได้ทันที ทำให้โค้ดอ่านง่ายและ consistent ทั่วทั้ง codebase

**คำถาม 3:** ทำไมใน `updateCandidate` ถึงไม่อนุญาตให้แก้ `role` และ `password_hash`?

**แนวคำตอบ:** นี่คือ Business Rule ด้าน Security — ถ้าอนุญาตให้แก้ `role` ผ่าน endpoint นี้ ผู้ใช้อาจ เปลี่ยน role ตัวเองจาก `candidate` เป็น `judge` หรือ `manager` ได้ (Privilege Escalation) การจำกัดว่า endpoint นี้แก้ได้แค่ `name`, `country`, `region` เป็น Business Rule ที่ Service Layer ต้องบังคับ ไม่ใช่ Controller หรือ Route

:::
