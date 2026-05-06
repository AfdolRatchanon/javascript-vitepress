# 11-02: Redis Integration 🔴

> 💡 **เป้าหมาย:** เรียนรู้การติดตั้งและใช้งาน Redis ร่วมกับ Node.js ด้วย redis v4
> เมื่อเรียนจบจะสามารถ Cache ข้อมูล Leaderboard ของ TP2026 ด้วย TTL และ Invalidate Cache ได้อย่างถูกต้อง

---

## 📖 ทฤษฎีและแนวคิด (Theory & Concepts)

### Redis คืออะไร?

**Redis** (Remote Dictionary Server) คือ In-Memory Database แบบ Key-Value ที่เก็บข้อมูลไว้ใน RAM
จึงเร็วกว่า Database ทั่วไปมาก และรองรับ Data Structure หลากหลาย

```
REDIS IN THE STACK
============================================================

  [Node.js API]
       │
       ├──────────► [Redis :6379]  ← Cache Layer (RAM, < 1ms)
       │
       └──────────► [MySQL :3306]  ← Persistent Storage (Disk, ~50ms)

  Flow:
    Request → ถาม Redis ก่อน
      HIT  → ส่งข้อมูลจาก Redis ทันที
      MISS → ถาม MySQL → เก็บใน Redis → ส่งข้อมูล
```

### Cache Hit/Miss Flow

```
CACHE HIT (เร็ว)
  Client ──► Node API ──► Redis ──► Client
                 └─────────┘
                  < 1ms ✅

CACHE MISS (ช้ากว่า แต่ครั้งเดียว)
  Client ──► Node API ──► Redis (MISS)
                 │
                 └────────► MySQL (~50ms)
                                 │
                 ┌───────────────┘
                 │  SET Redis (TTL=60s)
                 ▼
             Client ◄── Node API
```

---

### ทำไมต้องใช้ Redis แทน In-Memory?

```
COMPARISON TABLE
============================================================
  Feature              In-Memory Map      Redis
  ──────────────────   ───────────────    ─────────────────
  ความเร็ว             ns (เร็วสุด)       < 1ms (เร็วมาก)
  Restart Node.js      ❌ ข้อมูลหาย       ✅ ข้อมูลรอด (AOF/RDB)
  Multi-Process        ❌ แชร์ไม่ได้       ✅ แชร์ได้
  Multi-Server         ❌ ทำไม่ได้        ✅ Redis Cluster
  Data Structures      Map เท่านั้น       String/Hash/List/Set/ZSet
  TTL Built-in         ❌ ต้องเขียนเอง     ✅ EXPIRE command
  Pub/Sub              ❌                 ✅ Built-in
```

---

## 🛠️ ติดตั้ง Redis (Installation)

**Option A: Docker (แนะนำสำหรับ Dev)**

```bash
docker run -d --name redis-tp2026 -p 6379:6379 redis:7-alpine
```

**Option B: Windows (Memurai)**

ดาวน์โหลด Memurai จาก memurai.com แล้วติดตั้ง

**Option C: WSL2 (Ubuntu)**

```bash
sudo apt update && sudo apt install redis-server
sudo service redis-server start
```

**ทดสอบว่า Redis ทำงาน:**

```bash
redis-cli ping
# PONG ✅
```

**ติดตั้ง Node.js Package:**

```bash
npm install redis
```

---

## 💻 ตัวอย่างโค้ด (Code Implementation)

::: code-group

```js [config/redis.js]
/**
 * Redis Client Configuration
 * WSA2026 Test Submission Management System
 */
const { createClient } = require('redis');

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

client.on('error',   (err) => console.error('[Redis] Error:', err));
client.on('connect', ()    => console.log('[Redis] Connected ✅'));
client.on('reconnecting', () => console.log('[Redis] Reconnecting...'));

// Auto-connect เมื่อ import module นี้
(async () => {
  await client.connect();
})();

module.exports = client;
```

```js [redis-basics.js]
/**
 * Redis Basic Commands Demo
 * WSA2026 Test Submission Management System
 */
const redis = require('./config/redis');

async function main() {
  // ─── String Commands ───────────────────────────────────────

  // SET — เก็บข้อมูล
  await redis.set('greeting', 'สวัสดี WSA2026');

  // SET with EX (TTL = 60 วินาที)
  await redis.set('session:abc123', JSON.stringify({ userId: 5, role: 'judge' }), {
    EX: 3600, // 1 ชั่วโมง
  });

  // GET — ดึงข้อมูล
  const greeting = await redis.get('greeting');
  console.log('greeting:', greeting); // สวัสดี WSA2026

  // GET Object (ต้อง parse JSON)
  const raw     = await redis.get('session:abc123');
  const session = JSON.parse(raw);
  console.log('session:', session); // { userId: 5, role: 'judge' }

  // DEL — ลบ key
  await redis.del('greeting');
  const deleted = await redis.get('greeting');
  console.log('after del:', deleted); // null

  // SETEX shorthand (เหมือน SET + EX)
  // redis v4 ใช้ { EX: n } ใน options แทน
  await redis.set('otp:TH001', '826451', { EX: 300 }); // OTP หมดอายุ 5 นาที

  // TTL — ดูอายุที่เหลือ (วินาที)
  const ttl = await redis.ttl('otp:TH001');
  console.log('OTP TTL:', ttl, 'seconds'); // ~300

  // EXISTS — ตรวจว่า key มีอยู่ไหม
  const exists = await redis.exists('otp:TH001');
  console.log('OTP exists:', exists); // 1

  // ─── Hash Commands ─────────────────────────────────────────

  // HSET — เก็บหลาย field ใน key เดียว
  await redis.hSet('user:7', {
    id       : '7',
    username : 'somchai_th',
    name     : 'สมชาย เก่งมาก',
    role     : 'candidate',
    country  : 'TH',
  });

  // HGET — ดึง field เดียว
  const name = await redis.hGet('user:7', 'name');
  console.log('name:', name); // สมชาย เก่งมาก

  // HGETALL — ดึงทุก field
  const userHash = await redis.hGetAll('user:7');
  console.log('user hash:', userHash);

  // ─── List Commands ─────────────────────────────────────────

  // LPUSH — เพิ่มที่ด้านหน้า (head)
  await redis.lPush('recent_submissions', '101', '102', '103');

  // LRANGE — ดึงข้อมูลในช่วง (0 = first, -1 = last)
  const recent = await redis.lRange('recent_submissions', 0, 4);
  console.log('recent submissions:', recent); // ['103', '102', '101']

  // RPUSH — เพิ่มที่ด้านหลัง (tail)
  await redis.rPush('task_queue', 'task:1', 'task:2');

  await redis.quit();
}

main().catch(console.error);
```

```js [leaderboard-cache.js]
/**
 * Leaderboard Cache — Cache-Aside Pattern ด้วย Redis
 * WSA2026 Test Submission Management System
 *
 * Cache leaderboard 60 วินาที
 * Invalidate เมื่อ Judge ให้คะแนน
 */
const express = require('express');
const router  = express.Router();
const redis   = require('../config/redis');
const db      = require('../db');

const LEADERBOARD_KEY = 'leaderboard:global';
const LEADERBOARD_TTL = 60; // 60 วินาที

/**
 * Helper: ดึง Leaderboard จาก DB แล้วเก็บ Cache
 */
async function fetchAndCacheLeaderboard() {
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
      ON s.candidate_id = u.id
      AND s.status = 'scored'
    WHERE u.role = 'candidate'
    GROUP BY u.id, u.name, u.country
    ORDER BY total_score DESC
  `);

  // เก็บ Cache (serialize เป็น JSON String)
  await redis.set(LEADERBOARD_KEY, JSON.stringify(rows), {
    EX: LEADERBOARD_TTL,
  });

  return rows;
}

// GET /api/leaderboard
router.get('/', async (req, res) => {
  try {
    // 1. ตรวจ Redis Cache ก่อน
    const cached = await redis.get(LEADERBOARD_KEY);

    if (cached) {
      return res.json({
        source : 'cache',
        ttl    : await redis.ttl(LEADERBOARD_KEY),
        data   : JSON.parse(cached),
      });
    }

    // 2. Cache MISS — ดึงจาก DB แล้ว Cache
    const data = await fetchAndCacheLeaderboard();

    res.json({
      source : 'database',
      ttl    : LEADERBOARD_TTL,
      data,
    });
  } catch (err) {
    console.error('[Leaderboard]', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
});

// PUT /api/submissions/:id/score — Judge ให้คะแนน
router.put('/submissions/:id/score', async (req, res) => {
  const { id }    = req.params;
  const { score } = req.body;

  if (typeof score !== 'number' || score < 0 || score > 100) {
    return res.status(400).json({ error: 'score ต้องเป็นตัวเลข 0-100' });
  }

  try {
    const [result] = await db.query(
      `UPDATE submissions
       SET score = ?, status = 'scored', updated_at = NOW()
       WHERE id = ?`,
      [score, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบ Submission' });
    }

    // Invalidate Cache — ลบทันทีเพื่อให้ GET ครั้งถัดไปดึงข้อมูลใหม่
    await redis.del(LEADERBOARD_KEY);
    console.log(`[Redis] Invalidated "${LEADERBOARD_KEY}" after scoring submission ${id}`);

    res.json({
      message      : 'บันทึกคะแนนสำเร็จ',
      submissionId : Number(id),
      score,
    });
  } catch (err) {
    console.error('[Score]', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
});

module.exports = router;
```

```js [pubsub-demo.js]
/**
 * Redis Pub/Sub Demo
 * Broadcast score-update event ไปยัง Subscriber ทั้งหมด
 * WSA2026 Test Submission Management System
 */
const { createClient } = require('redis');

// Pub/Sub ต้องใช้คนละ Client
const publisher  = createClient({ url: 'redis://localhost:6379' });
const subscriber = createClient({ url: 'redis://localhost:6379' });

async function main() {
  await publisher.connect();
  await subscriber.connect();

  // Subscriber รับ event จาก channel 'score-updates'
  await subscriber.subscribe('score-updates', (message) => {
    const event = JSON.parse(message);
    console.log('[Subscriber] Score updated:', event);
    // → { submissionId: 42, candidateId: 7, taskId: 3, score: 95 }
  });

  // Publisher ส่ง event เมื่อมีการให้คะแนน
  const scoreEvent = {
    submissionId : 42,
    candidateId  : 7,
    taskId       : 3,
    score        : 95,
    judgeId      : 2,
    timestamp    : new Date().toISOString(),
  };

  await publisher.publish('score-updates', JSON.stringify(scoreEvent));
  console.log('[Publisher] Sent score event');

  // Cleanup
  setTimeout(async () => {
    await subscriber.unsubscribe('score-updates');
    await publisher.quit();
    await subscriber.quit();
  }, 1000);
}

main().catch(console.error);
```

:::

---

## 🎯 โจทย์ฝึกปฏิบัติเสริมความเข้าใจ (Mini Exercise)

**โจทย์:** เพิ่ม Cache สำหรับ `GET /api/tasks` โดย:
1. Cache key = `tasks:all`
2. TTL = 10 นาที (600 วินาที)
3. ถ้ามีการสร้าง Task ใหม่ (`POST /api/tasks`) ให้ Invalidate Cache

::: details 💡 คำใบ้ (Hint)

```js
// GET /api/tasks
const cached = await redis.get('tasks:all');
if (cached) return res.json(JSON.parse(cached));

const [tasks] = await db.query('SELECT * FROM tasks ORDER BY id');
await redis.set('tasks:all', JSON.stringify(tasks), { EX: 600 });
res.json(tasks);

// POST /api/tasks (หลัง INSERT)
await redis.del('tasks:all');
```

:::

---

## 🔥 Challenge (โจทย์ท้าทาย!)

สร้าง **Rate Limiter Middleware** ด้วย Redis สำหรับ Judge Scoring API:

- แต่ละ Judge ให้คะแนนได้ไม่เกิน **10 ครั้งต่อนาที**
- ใช้ Redis Key `rate:judge:{judgeId}` เก็บ counter
- ถ้าเกิน limit → ตอบ 429 Too Many Requests พร้อม Header `Retry-After`

```js
// Hint: ใช้ INCR + EXPIRE
const key     = `rate:judge:${judgeId}`;
const current = await redis.incr(key);
if (current === 1) await redis.expire(key, 60);
if (current > 10) { /* return 429 */ }
```

---

## 🗣️ ทบทวน (Review)

::: details ❓ คำถามทบทวน

**คำถาม 1:** ทำไมต้องใช้ `JSON.stringify()` ก่อน `redis.set()`?
**แนวคำตอบ:** Redis เก็บข้อมูลเป็น String เท่านั้น Object หรือ Array ใน JavaScript ต้องแปลงเป็น JSON String ก่อน แล้ว `JSON.parse()` ตอนดึงออกมา

**คำถาม 2:** `EX` ใน `redis.set(key, val, { EX: 60 })` หมายความว่าอะไร?
**แนวคำตอบ:** EX = EXpire = TTL เป็นวินาที ค่า 60 หมายถึง key นี้จะหมดอายุใน 60 วินาทีโดยอัตโนมัติ

**คำถาม 3:** Hash (`hSet`/`hGet`) ต่างจาก String (`set`/`get`) อย่างไร?
**แนวคำตอบ:** Hash เก็บได้หลาย field ใน key เดียวและสามารถอัปเดตทีละ field ได้ เช่น `hSet('user:7', 'score', 95)` โดยไม่ต้องดึงทั้ง Object มาแล้วแปลง JSON ใหม่

**คำถาม 4:** Pub/Sub ใน Redis ใช้ทำอะไร?
**แนวคำตอบ:** ใช้ Broadcast message ไปยัง Subscriber หลายตัวพร้อมกัน เช่น เมื่อ Judge ให้คะแนน → Publish event → Subscriber ทุกตัว (เช่น WebSocket server) รับรู้และส่ง notification ไปยัง Client

:::

---

> 👉 **ไปต่อ: [Project 11: Fast API with Redis Cache](/node/11-project-fast-api)**
