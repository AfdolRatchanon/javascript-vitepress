# Project 11: Fast API with Redis Cache 🚀

> 💡 **เป้าหมาย:** เพิ่ม Redis Caching Layer เข้าไปใน Submission API ของ TP2026
> Cache `GET /api/leaderboard` ไว้ 60 วินาที และ Invalidate Cache อัตโนมัติเมื่อ Judge ให้คะแนน

---

## 🗂️ โครงสร้างโปรเจกต์

```
tp2026-api/
├── config/
│   ├── db.js            ← MySQL connection
│   └── redis.js         ← Redis client
├── middleware/
│   └── cacheMiddleware.js
├── routes/
│   ├── leaderboard.js
│   └── submissions.js
├── .env
├── app.js
└── package.json
```

---

## 📦 Step 1: ติดตั้ง Dependencies

```bash
npm init -y
npm install express mysql2 redis dotenv
```

---

## 🔧 Step 2: Environment Config

**`.env`**

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=secret
DB_NAME=tp2026
REDIS_URL=redis://localhost:6379
```

---

## 🗄️ Step 3: Redis Client Setup

::: code-group

```js [config/redis.js]
/**
 * Redis Client — WSA2026 Test Submission Management System
 */
const { createClient } = require('redis');

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

client.on('error',   (err) => console.error('[Redis] Error:', err.message));
client.on('connect', ()    => console.log('[Redis] Connected ✅'));

(async () => {
  await client.connect();
})();

module.exports = client;
```

```js [config/db.js]
/**
 * MySQL Connection Pool — WSA2026 Test Submission Management System
 */
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host     : process.env.DB_HOST     || 'localhost',
  user     : process.env.DB_USER     || 'root',
  password : process.env.DB_PASSWORD || 'secret',
  database : process.env.DB_NAME     || 'tp2026',
  waitForConnections : true,
  connectionLimit    : 10,
});

module.exports = pool;
```

:::

---

## 🛡️ Step 4: Cache Middleware

::: code-group

```js [middleware/cacheMiddleware.js]
/**
 * Cache Middleware — Cache-Aside Pattern
 * WSA2026 Test Submission Management System
 *
 * ใช้งาน: router.get('/path', cacheMiddleware(ttlSeconds), handler)
 */
const redis = require('../config/redis');

/**
 * @param {number} ttlSeconds - อายุ Cache เป็นวินาที
 */
const cacheMiddleware = (ttlSeconds = 60) => {
  return async (req, res, next) => {
    const cacheKey = `cache:${req.method}:${req.originalUrl}`;

    try {
      // 1. ตรวจ Cache ก่อน
      const cached = await redis.get(cacheKey);

      if (cached) {
        // Cache HIT
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-Key', cacheKey);
        return res.json(JSON.parse(cached));
      }

      // 2. Cache MISS — ดัก res.json เพื่อเก็บ Cache ก่อนส่ง
      res.set('X-Cache', 'MISS');

      const originalJson = res.json.bind(res);

      res.json = async (body) => {
        // เก็บ Cache เฉพาะตอน 2xx
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            await redis.set(cacheKey, JSON.stringify(body), { EX: ttlSeconds });
          } catch (cacheErr) {
            console.error('[Cache] Failed to set cache:', cacheErr.message);
          }
        }
        // ส่ง Response ปกติ
        originalJson(body);
      };

      next();
    } catch (err) {
      // ถ้า Redis พัง อย่าให้ API พัง — ข้าม Cache ไปเลย
      console.error('[Cache Middleware] Redis error, bypassing cache:', err.message);
      next();
    }
  };
};

module.exports = cacheMiddleware;
```

:::

---

## 🏆 Step 5: Leaderboard Route

::: code-group

```js [routes/leaderboard.js]
/**
 * Leaderboard Routes
 * WSA2026 Test Submission Management System
 *
 * GET /api/leaderboard      → Cached 60s
 * GET /api/leaderboard/task/:taskId → Cached 60s per task
 */
const express        = require('express');
const router         = express.Router();
const db             = require('../config/db');
const cacheMiddleware = require('../middleware/cacheMiddleware');

// GET /api/leaderboard — Global Leaderboard (Cache 60s)
router.get('/', cacheMiddleware(60), async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        u.id,
        u.name,
        u.country,
        COUNT(s.id)                    AS total_submissions,
        COALESCE(SUM(s.score), 0)      AS total_score,
        COALESCE(MAX(s.score), 0)      AS best_score,
        RANK() OVER (
          ORDER BY COALESCE(SUM(s.score), 0) DESC
        ) AS rank
      FROM users u
      LEFT JOIN submissions s
        ON s.candidate_id = u.id AND s.status = 'scored'
      WHERE u.role = 'candidate'
      GROUP BY u.id, u.name, u.country
      ORDER BY total_score DESC
    `);

    res.json({ total: rows.length, leaderboard: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/leaderboard/task/:taskId — Per-Task Leaderboard (Cache 60s)
router.get('/task/:taskId', cacheMiddleware(60), async (req, res) => {
  const { taskId } = req.params;

  try {
    const [rows] = await db.query(`
      SELECT
        u.id,
        u.name,
        u.country,
        s.score,
        s.submission_url,
        s.status,
        RANK() OVER (ORDER BY s.score DESC) AS rank
      FROM submissions s
      JOIN users u ON u.id = s.candidate_id
      WHERE s.task_id = ? AND s.status = 'scored'
      ORDER BY s.score DESC
    `, [taskId]);

    res.json({ taskId: Number(taskId), total: rows.length, leaderboard: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
```

```js [routes/submissions.js]
/**
 * Submissions Routes
 * WSA2026 Test Submission Management System
 *
 * POST /api/submissions               → Candidate ส่งงาน
 * PUT  /api/submissions/:id/score     → Judge ให้คะแนน + Invalidate Cache
 * GET  /api/submissions               → List (Cached 30s)
 */
const express        = require('express');
const router         = express.Router();
const db             = require('../config/db');
const redis          = require('../config/redis');
const cacheMiddleware = require('../middleware/cacheMiddleware');

/** ลบ Cache ที่เกี่ยวข้องกับ Leaderboard ทั้งหมด */
async function invalidateLeaderboardCache() {
  // ใช้ SCAN เพื่อหา key ทั้งหมดที่ขึ้นต้นด้วย 'cache:GET:/api/leaderboard'
  const pattern = 'cache:GET:/api/leaderboard*';
  let cursor = 0;
  const keysToDelete = [];

  do {
    const result = await redis.scan(cursor, { MATCH: pattern, COUNT: 100 });
    cursor = result.cursor;
    keysToDelete.push(...result.keys);
  } while (cursor !== 0);

  if (keysToDelete.length > 0) {
    await redis.del(keysToDelete);
    console.log(`[Cache] Invalidated ${keysToDelete.length} leaderboard cache keys`);
  }
}

// GET /api/submissions (Cached 30s)
router.get('/', cacheMiddleware(30), async (req, res) => {
  const { status, task_id } = req.query;

  let sql    = 'SELECT s.*, u.name AS candidate_name, t.title AS task_title FROM submissions s JOIN users u ON u.id = s.candidate_id JOIN tasks t ON t.id = s.task_id WHERE 1=1';
  const params = [];

  if (status) {
    sql += ' AND s.status = ?';
    params.push(status);
  }
  if (task_id) {
    sql += ' AND s.task_id = ?';
    params.push(task_id);
  }
  sql += ' ORDER BY s.id DESC';

  try {
    const [rows] = await db.query(sql, params);
    res.json({ total: rows.length, submissions: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/submissions — Candidate ส่งงาน
router.post('/', async (req, res) => {
  const { candidate_id, task_id, submission_url } = req.body;

  if (!candidate_id || !task_id || !submission_url) {
    return res.status(400).json({
      error: 'ต้องระบุ candidate_id, task_id และ submission_url',
    });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO submissions (candidate_id, task_id, submission_url, status)
       VALUES (?, ?, ?, 'submitted')`,
      [candidate_id, task_id, submission_url]
    );

    res.status(201).json({
      message      : 'ส่งงานสำเร็จ',
      submissionId : result.insertId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/submissions/:id/score — Judge ให้คะแนน
router.put('/:id/score', async (req, res) => {
  const { id }    = req.params;
  const { score } = req.body;

  if (typeof score !== 'number' || score < 0 || score > 100) {
    return res.status(400).json({ error: 'score ต้องเป็นตัวเลข 0-100' });
  }

  try {
    const [result] = await db.query(
      `UPDATE submissions SET score = ?, status = 'scored' WHERE id = ?`,
      [score, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบ Submission' });
    }

    // Invalidate Leaderboard Cache
    await invalidateLeaderboardCache();

    res.json({
      message      : 'บันทึกคะแนนและล้าง Cache สำเร็จ',
      submissionId : Number(id),
      score,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
```

```js [app.js]
/**
 * Main App — WSA2026 Test Submission Management System
 */
require('dotenv').config();

const express     = require('express');
const app         = express();

app.use(express.json());

// Routes
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/submissions', require('./routes/submissions'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', system: 'WSA2026 Test Submission Management System' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

:::

---

## 🧪 Step 6: ทดสอบ (Expected Output)

**ทดสอบด้วย Postman หรือ curl:**

```bash
# ครั้งแรก — Cache MISS (ดึงจาก DB)
curl -i http://localhost:3000/api/leaderboard

# Response Headers:
# X-Cache: MISS
# Content-Type: application/json

# Response Body:
# { "total": 5, "leaderboard": [...] }

# ─────────────────────────────────────────

# ครั้งที่สอง — Cache HIT (ดึงจาก Redis)
curl -i http://localhost:3000/api/leaderboard

# Response Headers:
# X-Cache: HIT
# X-Cache-Key: cache:GET:/api/leaderboard

# ─────────────────────────────────────────

# Judge ให้คะแนน → Invalidate Cache
curl -X PUT http://localhost:3000/api/submissions/5/score \
  -H "Content-Type: application/json" \
  -d '{"score": 95}'

# Response:
# { "message": "บันทึกคะแนนและล้าง Cache สำเร็จ", "submissionId": 5, "score": 95 }

# ─────────────────────────────────────────

# ครั้งถัดไป — Cache MISS อีกครั้ง (ดึงข้อมูลใหม่จาก DB)
curl -i http://localhost:3000/api/leaderboard
# X-Cache: MISS  ← เพราะ Cache ถูก Invalidate แล้ว
```

**ตาราง Performance:**

```
REQUEST PERFORMANCE COMPARISON
============================================================
  Request #   Source      Response Time
  ─────────   ─────────   ─────────────
  #1          Database    ~120ms  (MISS - Query DB)
  #2          Redis       ~3ms    (HIT)
  #3          Redis       ~3ms    (HIT)
  #4 (score)  -           ~80ms   (UPDATE + Invalidate)
  #5          Database    ~120ms  (MISS - Cache cleared)
  #6          Redis       ~3ms    (HIT)

  Speed improvement: ~40x faster on cache hit ✅
```

---

## 🔥 Challenge (โจทย์ท้าทาย!)

เพิ่มฟีเจอร์ **Cache Statistics Endpoint**:

```
GET /api/cache/stats
Response:
{
  "totalCachedKeys": 8,
  "keys": [
    "cache:GET:/api/leaderboard",
    "cache:GET:/api/leaderboard/task/1",
    ...
  ]
}
```

ใช้ `redis.scan()` เพื่อหา keys ทั้งหมดที่ขึ้นต้นด้วย `cache:`

---

## 🗣️ ทบทวน (Review)

::: details ❓ คำถามทบทวน

**คำถาม 1:** ทำไมต้องใช้ `redis.scan()` แทน `redis.keys('cache:*')` ใน Production?
**แนวคำตอบ:** `KEYS` เป็น O(N) blocking command ถ้ามี key หลายล้านตัวจะทำให้ Redis ค้างและ API หยุดชะงัก; `SCAN` ทำงานแบบ iterative ทีละชุดจึงปลอดภัยกว่า

**คำถาม 2:** Middleware ดัก `res.json` เพื่อทำอะไร?
**แนวคำตอบ:** เพื่อเก็บ Response body ลง Redis Cache ก่อนส่งให้ Client โดยไม่ต้องเขียน Cache logic ซ้ำในทุก Route Handler

**คำถาม 3:** ถ้า Redis Server ล่ม API จะทำงานได้ไหม?
**แนวคำตอบ:** ได้ เพราะ middleware มี try-catch และ fallback ไปเรียก `next()` เมื่อ Redis error ทำให้ request ยังผ่านไปถึง Database ได้ตามปกติ

:::

---

> 👉 **ไปต่อ: [12-01: WebSockets Introduction](/node/12-01-websockets-intro)**
