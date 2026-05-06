# Project 6: Submission Management API 📦

> 💡 **เป้าหมาย:** สร้าง RESTful API สำหรับจัดการ submissions ของระบบ WorldSkills TP2026 โดยใช้ Express + mysql2 + dotenv + cors พร้อม 3-layer architecture ครบถ้วน รองรับ CRUD, Leaderboard, และ Pagination เพื่อฝึกทักษะการ build production-ready API จริง

---

## 🏗️ Architecture Overview

```
  SUBMISSION MANAGEMENT API — TP2026
  ====================================

  Client (curl / Postman / Frontend)
         |
         | HTTP Request
         v
  +------+---------------------------+
  |          Express App             |
  |  +---------------------------+   |
  |  |  Middleware Layer         |   |
  |  |  cors() + json() + log()  |   |
  |  +---------------------------+   |
  |          |                       |
  |  +---------------------------+   |
  |  |  Routes Layer             |   |
  |  |  /api/submissions         |   |
  |  |  /api/leaderboard         |   |
  |  +---------------------------+   |
  |          |                       |
  |  +---------------------------+   |
  |  |  Controller Layer         |   |
  |  |  submissionController.js  |   |
  |  |  leaderboardController.js |   |
  |  +---------------------------+   |
  |          |                       |
  |  +---------------------------+   |
  |  |  Config Layer             |   |
  |  |  db.js (Connection Pool)  |   |
  |  +---------------------------+   |
  |          |                       |
  +----------|-----------------------+
             | mysql2/promise
             v
  +------------------------------+
  |      MySQL Database          |
  |  tp2026_db                   |
  |  - users                     |
  |  - tasks                     |
  |  - submissions               |
  +------------------------------+
```

---

## 🎯 Project Goals

1. **CRUD API** — GET, POST, PUT สำหรับ submissions ครบถ้วน
2. **3-Layer Architecture** — Routes / Controllers / Config แยกชัดเจน
3. **Leaderboard Endpoint** — ดึงอันดับ top candidates
4. **Pagination** — รองรับข้อมูลจำนวนมากด้วย LIMIT/OFFSET
5. **Error Handling** — จัดการ DB errors อย่างเป็นระบบ
6. **Environment Variables** — ไม่ hardcode credentials

---

## 📂 Project Structure

```
submission-api/
├── config/
│   └── db.js                    <-- Connection Pool (Singleton)
├── controllers/
│   ├── submissionController.js  <-- Logic สำหรับ submissions
│   └── leaderboardController.js <-- Logic สำหรับ leaderboard
├── routes/
│   ├── submissionRoutes.js      <-- Route definitions
│   └── leaderboardRoutes.js
├── .env                         <-- DB Credentials (ห้าม commit)
├── .env.example                 <-- Template สำหรับ team
├── app.js                       <-- Entry Point
└── package.json
```

---

## ⚙️ Setup & Installation

### 1. สร้าง Project

```bash
mkdir submission-api
cd submission-api
npm init -y
npm install express mysql2 dotenv cors
```

### 2. สร้าง .env

```bash
# .env  (ห้าม commit ไฟล์นี้ขึ้น Git!)
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=tp2026_db
```

```bash
# .env.example  (commit อันนี้แทน เพื่อบอก team ว่าต้องมี env อะไร)
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=
DB_PASSWORD=
DB_NAME=tp2026_db
```

### 3. สร้าง Database

```sql
-- รัน script นี้ใน MySQL Workbench หรือ Adminer ก่อน
CREATE DATABASE IF NOT EXISTS tp2026_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE tp2026_db;

CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(100),
  role          ENUM('candidate','judge','manager') NOT NULL,
  country       VARCHAR(50),
  region        VARCHAR(50)
);

CREATE TABLE tasks (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  title              VARCHAR(200) NOT NULL,
  description        TEXT,
  time_limit_minutes INT DEFAULT 240,
  max_score          INT DEFAULT 100
);

CREATE TABLE submissions (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  candidate_id   INT NOT NULL,
  task_id        INT NOT NULL,
  submission_url VARCHAR(500) NOT NULL,
  submitted_at   DATETIME DEFAULT NOW(),
  score          DECIMAL(5,2),
  status         ENUM('pending','scored') DEFAULT 'pending',
  FOREIGN KEY (candidate_id) REFERENCES users(id),
  FOREIGN KEY (task_id)      REFERENCES tasks(id)
);

-- Seed Data
INSERT INTO users (username, password_hash, name, role, country, region) VALUES
('tp_th_001', 'hash1', 'Somsak Jaidee',    'candidate', 'Thailand',  'Asia Pacific'),
('tp_sg_001', 'hash2', 'Lim Wei Ming',     'candidate', 'Singapore', 'Asia Pacific'),
('tp_jp_001', 'hash3', 'Tanaka Hiroshi',   'candidate', 'Japan',     'Asia Pacific'),
('judge_01',  'hash4', 'Robert Anderson',  'judge',     'USA',       'Americas'),
('manager_01','hash5', 'Sarah Johnson',    'manager',   'Germany',   'Europe');

INSERT INTO tasks (title, description, time_limit_minutes, max_score) VALUES
('Web Technologies',    'Build responsive website with HTML/CSS/JS', 240, 100),
('IT Network Systems',  'Configure and troubleshoot network infrastructure', 300, 100),
('Cloud Computing',     'Deploy and manage cloud services', 240, 100);

INSERT INTO submissions (candidate_id, task_id, submission_url) VALUES
(1, 1, 'https://repo.tp2026.com/submissions/th001-task1'),
(2, 1, 'https://repo.tp2026.com/submissions/sg001-task1'),
(3, 1, 'https://repo.tp2026.com/submissions/jp001-task1'),
(1, 2, 'https://repo.tp2026.com/submissions/th001-task2');
```

---

## 💻 Implementation Code

::: code-group

```js [config/db.js]
// config/db.js
// Singleton Connection Pool — require ไฟล์นี้จากทุกที่ที่ต้องการ DB
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:             process.env.DB_HOST     || 'localhost',
  port:             parseInt(process.env.DB_PORT) || 3306,
  user:             process.env.DB_USER     || 'root',
  password:         process.env.DB_PASSWORD || '',
  database:         process.env.DB_NAME     || 'tp2026_db',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0
});

// ทดสอบ connection ตอน boot
pool.getConnection()
  .then(conn => {
    console.log('[DB] MySQL pool connected');
    conn.release();
  })
  .catch(err => {
    console.error('[DB] Connection failed:', err.message);
    process.exit(1);
  });

module.exports = pool;
```

```js [controllers/submissionController.js]
// controllers/submissionController.js
const pool = require('../config/db');

// -----------------------------------------------
// GET /api/submissions
// ดู submissions ทั้งหมด พร้อม JOIN ข้อมูล
// Support: ?page=1&limit=10&status=pending
// -----------------------------------------------
exports.getAll = async (req, res) => {
  const page   = parseInt(req.query.page)   || 1;
  const limit  = parseInt(req.query.limit)  || 10;
  const status = req.query.status || null; // filter ตาม status (optional)
  const offset = (page - 1) * limit;

  try {
    // Build dynamic WHERE clause
    let where = 'WHERE u.role = ?';
    const params = ['candidate'];

    if (status && ['pending', 'scored'].includes(status)) {
      where += ' AND s.status = ?';
      params.push(status);
    }

    const sql = `
      SELECT
        s.id,
        s.submission_url,
        s.submitted_at,
        s.score,
        s.status,
        u.name    AS candidate_name,
        u.country,
        u.region,
        t.title   AS task_title,
        t.max_score
      FROM submissions s
      JOIN users u ON s.candidate_id = u.id
      JOIN tasks t  ON s.task_id = t.id
      ${where}
      ORDER BY s.submitted_at DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(sql, [...params, limit, offset]);

    // นับ total สำหรับ pagination
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM submissions s JOIN users u ON s.candidate_id = u.id
       ${where}`,
      params
    );

    res.json({
      data: rows,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
        has_next: page < Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('[Controller] getAll error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -----------------------------------------------
// GET /api/submissions/:id
// -----------------------------------------------
exports.getById = async (req, res) => {
  try {
    const sql = `
      SELECT
        s.*,
        u.name    AS candidate_name,
        u.country,
        t.title   AS task_title,
        t.max_score
      FROM submissions s
      JOIN users u ON s.candidate_id = u.id
      JOIN tasks t  ON s.task_id = t.id
      WHERE s.id = ?
    `;
    const [rows] = await pool.query(sql, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    res.json({ data: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -----------------------------------------------
// POST /api/submissions
// เพิ่ม submission ใหม่
// Body: { candidate_id, task_id, submission_url }
// -----------------------------------------------
exports.create = async (req, res) => {
  const { candidate_id, task_id, submission_url } = req.body;

  // Validation
  if (!candidate_id || !task_id || !submission_url) {
    return res.status(400).json({
      error: 'Missing required fields: candidate_id, task_id, submission_url'
    });
  }

  if (!submission_url.startsWith('https://')) {
    return res.status(400).json({ error: 'submission_url must start with https://' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO submissions (candidate_id, task_id, submission_url)
       VALUES (?, ?, ?)`,
      [candidate_id, task_id, submission_url]
    );

    res.status(201).json({
      message: 'Submission created successfully',
      data: { id: result.insertId }
    });
  } catch (err) {
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        error: 'Invalid candidate_id or task_id — record does not exist'
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -----------------------------------------------
// PUT /api/submissions/:id/score
// Judge ให้คะแนน submission
// Body: { score }
// -----------------------------------------------
exports.score = async (req, res) => {
  const { score } = req.body;
  const submissionId = req.params.id;

  // Validate score
  if (score === undefined || score === null) {
    return res.status(400).json({ error: 'score is required' });
  }

  const numScore = parseFloat(score);
  if (isNaN(numScore) || numScore < 0 || numScore > 100) {
    return res.status(400).json({ error: 'score must be a number between 0 and 100' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE submissions
       SET score = ?, status = 'scored'
       WHERE id = ?`,
      [numScore, submissionId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json({
      message: 'Submission scored successfully',
      data: { id: submissionId, score: numScore, status: 'scored' }
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

```js [controllers/leaderboardController.js]
// controllers/leaderboardController.js
const pool = require('../config/db');

// -----------------------------------------------
// GET /api/leaderboard
// Top 10 candidates by total score
// Support: ?limit=10
// -----------------------------------------------
exports.getLeaderboard = async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 50); // max 50

  try {
    const sql = `
      SELECT
        u.name,
        u.country,
        u.region,
        COUNT(s.id)            AS tasks_submitted,
        SUM(s.score)           AS total_score,
        ROUND(AVG(s.score), 2) AS avg_score,
        MAX(s.score)           AS best_score
      FROM submissions s
      JOIN users u ON s.candidate_id = u.id
      WHERE s.status = 'scored'
        AND u.role = 'candidate'
      GROUP BY s.candidate_id, u.name, u.country, u.region
      ORDER BY total_score DESC, avg_score DESC
      LIMIT ?
    `;

    const [rows] = await pool.query(sql, [limit]);

    // เพิ่ม rank number
    const ranked = rows.map((row, index) => ({
      rank: index + 1,
      ...row
    }));

    res.json({
      message: 'TP2026 Leaderboard',
      generated_at: new Date().toISOString(),
      data: ranked
    });
  } catch (err) {
    console.error('[Leaderboard] error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

```js [routes/submissionRoutes.js]
// routes/submissionRoutes.js
const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/submissionController');

// GET  /api/submissions          — ดูทั้งหมด (พร้อม pagination)
// POST /api/submissions          — สร้างใหม่
// GET  /api/submissions/:id      — ดูรายการเดียว
// PUT  /api/submissions/:id/score — ให้คะแนน

router.get('/',          controller.getAll);
router.post('/',         controller.create);
router.get('/:id',       controller.getById);
router.put('/:id/score', controller.score);

module.exports = router;
```

```js [app.js]
// app.js — Entry Point
const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const submissionRoutes  = require('./routes/submissionRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');

const app = express();

// ── Middleware ──────────────────────────────────
app.use(cors());
app.use(express.json());

// Request logger (simple)
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ── Routes ──────────────────────────────────────
app.use('/api/submissions',  submissionRoutes);
app.use('/api/leaderboard',  leaderboardRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'TP2026 Submission API', version: '1.0.0' });
});

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err, _req, res, _next) => {
  console.error('[App Error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[App] TP2026 Submission API running on port ${PORT}`);
  console.log(`[App] Health: http://localhost:${PORT}/api/health`);
});
```

```js [routes/leaderboardRoutes.js]
// routes/leaderboardRoutes.js
const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/leaderboardController');

// GET /api/leaderboard          — Top 10 by default
// GET /api/leaderboard?limit=5  — Top 5

router.get('/', controller.getLeaderboard);

module.exports = router;
```

:::

---

## 🧪 Testing with curl

ทดสอบ API ทุก endpoint ด้วย curl commands:

```bash
# ── Health Check ────────────────────────────────
curl http://localhost:3000/api/health

# ── GET all submissions ──────────────────────────
curl http://localhost:3000/api/submissions

# GET with pagination (page 2, 5 items each)
curl "http://localhost:3000/api/submissions?page=2&limit=5"

# GET filtered by status
curl "http://localhost:3000/api/submissions?status=pending"

# ── GET single submission ────────────────────────
curl http://localhost:3000/api/submissions/1

# ── POST — Create new submission ────────────────
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "candidate_id": 1,
    "task_id": 3,
    "submission_url": "https://repo.tp2026.com/submissions/th001-task3"
  }'

# ── PUT — Score a submission ─────────────────────
curl -X PUT http://localhost:3000/api/submissions/1/score \
  -H "Content-Type: application/json" \
  -d '{ "score": 92.5 }'

# ── GET Leaderboard ──────────────────────────────
curl http://localhost:3000/api/leaderboard

# GET Top 5 only
curl "http://localhost:3000/api/leaderboard?limit=5"
```

---

## 📋 Expected JSON Responses

**GET /api/submissions (with pagination):**
```json
{
  "data": [
    {
      "id": 1,
      "submission_url": "https://repo.tp2026.com/submissions/th001-task1",
      "submitted_at": "2026-05-01T08:30:00.000Z",
      "score": 88.0,
      "status": "scored",
      "candidate_name": "Somsak Jaidee",
      "country": "Thailand",
      "region": "Asia Pacific",
      "task_title": "Web Technologies",
      "max_score": 100
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 4,
    "total_pages": 1,
    "has_next": false
  }
}
```

**GET /api/leaderboard:**
```json
{
  "message": "TP2026 Leaderboard",
  "generated_at": "2026-05-06T09:00:00.000Z",
  "data": [
    {
      "rank": 1,
      "name": "Tanaka Hiroshi",
      "country": "Japan",
      "region": "Asia Pacific",
      "tasks_submitted": 3,
      "total_score": 285.0,
      "avg_score": 95.00,
      "best_score": 98.0
    },
    {
      "rank": 2,
      "name": "Somsak Jaidee",
      "country": "Thailand",
      "region": "Asia Pacific",
      "tasks_submitted": 2,
      "total_score": 180.0,
      "avg_score": 90.00,
      "best_score": 92.5
    }
  ]
}
```

**POST /api/submissions (201 Created):**
```json
{
  "message": "Submission created successfully",
  "data": { "id": 5 }
}
```

**Error Response (404):**
```json
{ "error": "Submission not found" }
```

**Error Response (400):**
```json
{ "error": "score must be a number between 0 and 100" }
```

---

## 🎯 โจทย์ฝึกปฏิบัติเสริมความเข้าใจ

**โจทย์:** เพิ่ม endpoint `GET /api/tasks/:id/submissions` ที่แสดง submissions ทั้งหมดของ task นั้น พร้อม statistics (avg_score, submission_count, pending_count)

ผลลัพธ์ที่ต้องการ:
```json
{
  "task": { "id": 1, "title": "Web Technologies" },
  "stats": {
    "total": 3,
    "scored": 2,
    "pending": 1,
    "avg_score": 90.25
  },
  "submissions": [ ... ]
}
```

::: details 💡 คำใบ้

ต้องทำ 2 queries:
1. `SELECT * FROM tasks WHERE id = ?` — ดึงข้อมูล task
2. `SELECT ... FROM submissions JOIN users ... WHERE task_id = ?` — ดึง submissions พร้อม stats

สามารถรวม stats เข้าไปในก้อนเดียวได้ด้วย subquery หรือ GROUP BY:
```js
const [[task]] = await pool.query(`SELECT id, title FROM tasks WHERE id = ?`, [id]);
if (!task) return res.status(404).json({ error: 'Task not found' });
// ... query submissions
```

:::

---

## 🔥 Challenge

**โจทย์:** เพิ่ม Pagination ให้ `GET /api/submissions` รองรับ filter พร้อมกันหลายอย่างพร้อมกัน เช่น `?country=Thailand&status=pending&page=1&limit=5` โดย country filter ต้องทำงานร่วมกับ status filter ได้ถูกต้อง

::: details 💡 คำใบ้

สร้าง query แบบ dynamic โดยสะสม WHERE conditions:

```js
const conditions = ['u.role = ?'];
const params     = ['candidate'];

if (req.query.status) {
  conditions.push('s.status = ?');
  params.push(req.query.status);
}

if (req.query.country) {
  conditions.push('u.country = ?');
  params.push(req.query.country);
}

const whereClause = 'WHERE ' + conditions.join(' AND ');
// จากนั้นแทน ${whereClause} ใน SQL template
```

ต้องใส่ params สำหรับ COUNT query ด้วย ไม่ใช่แค่ main query

:::

---

## 🗣️ ทบทวน

::: details ❓ คำถามทบทวน

**คำถาม 1:** ทำไม 3-layer architecture (Routes / Controllers / Config) ถึงดีกว่าการเขียน logic ทุกอย่างใน `app.js` ไฟล์เดียว?

**แนวคำตอบ:** 3-layer แยก "ความรับผิดชอบ" (Separation of Concerns) ออกจากกัน Routes รู้แค่ว่า path ไหนใช้ function อะไร Controllers รู้แค่ business logic ไม่ยุ่งกับ HTTP protocol Config รู้แค่การต่อ Database ผลลัพธ์คือ code อ่านง่ายกว่า, test ง่ายกว่า, และเมื่อต้องแก้ไขจะแก้เพียงจุดเดียวโดยไม่กระทบส่วนอื่น ถ้าเขียนทุกอย่างใน app.js ไฟล์เดียว พอโปรเจกต์ใหญ่ขึ้นจะกลายเป็น "spaghetti code" ที่แก้ได้ยากมาก

---

**คำถาม 2:** เหตุใด `.env` ไฟล์จึงไม่ควร commit ขึ้น Git และควรจัดการอย่างไรให้ถูกต้อง?

**แนวคำตอบ:** `.env` เก็บ DB credentials (username, password) และ secrets ที่ถ้าหลุดไปใน Git repository คนอื่นที่เข้าถึง repo ได้จะสามารถต่อ Database หรือ services ได้ทันที ควรเพิ่ม `.env` ใน `.gitignore` และสร้าง `.env.example` แทน โดยใส่แค่ key names ไม่ใส่ค่าจริง เพื่อบอก team ว่าต้องสร้าง `.env` อะไรบ้าง และใช้ environment variables จริงๆ บน production server แทนไฟล์ `.env`

---

**คำถาม 3:** Pagination ด้วย LIMIT/OFFSET มีข้อจำกัดอะไรเมื่อข้อมูลมีมากกว่าล้านแถว และมีวิธีแก้อย่างไร?

**แนวคำตอบ:** `OFFSET` ขนาดใหญ่ (เช่น `OFFSET 900000`) ยังคงต้องให้ MySQL อ่านแถวทิ้งไป 900,000 แถวก่อน จึงช้ามากสำหรับ deep pagination วิธีแก้คือ Cursor-based Pagination โดยใช้ id ของแถวสุดท้ายเป็น cursor เช่น `WHERE id > ? ORDER BY id ASC LIMIT 10` แทน OFFSET วิธีนี้เร็วกว่ามากเพราะใช้ Primary Key Index เสมอ แต่ข้อเสียคือไม่สามารถ jump ไปหน้าที่ต้องการได้โดยตรง

:::

---

> 👉 **ไปต่อ: [Module 7 — MongoDB & NoSQL Basics](/node/07-01-mongodb-basics)**
