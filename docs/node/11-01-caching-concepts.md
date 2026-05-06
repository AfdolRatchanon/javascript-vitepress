# 11-01: Caching Concepts ⚡

> 💡 **เป้าหมาย:** เข้าใจหลักการ Caching ทั้งเชิงทฤษฎีและรูปแบบที่ใช้ในระบบจริง
> เมื่อเรียนจบจะสามารถออกแบบ Cache Layer สำหรับ TP2026 Leaderboard API ได้อย่างมีประสิทธิภาพ

---

## 📖 ทฤษฎีและแนวคิด (Theory & Concepts)

### Cache คืออะไร?

**Cache** คือพื้นที่จัดเก็บข้อมูลชั่วคราวที่อยู่ "ใกล้" กับผู้ใช้งานมากกว่าแหล่งข้อมูลต้นทาง
เปรียบได้กับ "สมุดโน้ตส่วนตัว" ที่จดคำตอบที่ใช้บ่อยไว้ แทนที่จะต้องเปิดหนังสือหนักๆ ทุกครั้ง

---

### ทำไมต้องใช้ Cache? (Why Caching?)

**ปัญหาหลัก 2 ข้อที่ Cache แก้ได้:**

1. **ความเร็ว (Speed)** — Query จาก Database ทั่วไปใช้เวลา 50-200ms แต่การอ่านจาก In-Memory Cache ใช้เวลาแค่ < 1ms
2. **Database Load** — ถ้ามี 1,000 คนกดดูหน้า Leaderboard พร้อมกัน การ Query DB 1,000 ครั้งนั้นหนักมาก แต่ถ้า Cache ไว้ DB จะถูกเรียกแค่ครั้งเดียว

```
WITHOUT CACHE — ทุก Request ไปถึง DB
============================================================

  [Browser]  Request x1000   [Node API]   SQL x1000   [MySQL]
     [ ]  ─────────────────►    [ ]    ────────────►   [ ]
     [ ]  ◄─────────────────    [ ]    ◄────────────   [ ]
           ~100ms each                  ~50ms each

  ผลลัพธ์: DB โหลดสูง, ตอบช้า, อาจ Timeout

WITH CACHE — DB ถูกเรียกแค่ครั้งแรก
============================================================

  [Browser]  Request x1000   [Node API]   Cache?    [Redis]
     [ ]  ─────────────────►    [ ]    ──────────►   [ ]
     [ ]  ◄─────────────────    [ ]    ◄──────────   [ ]
            < 1ms (HIT!)                 HIT: < 1ms

  MISS ครั้งแรก → ไป DB แล้วเก็บ Cache
  HIT ครั้งถัดมา → ไม่ยุ่ง DB เลย ✅
```

---

### Caching Patterns (รูปแบบการใช้ Cache)

#### 1. Cache-Aside (Lazy Loading) — ใช้บ่อยที่สุด

แอปพลิเคชันเป็นคนจัดการ Cache เอง "ดึงเมื่อต้องการ"

```
CACHE-ASIDE FLOW
============================================================

  1. Request เข้ามา
        │
        ▼
  2. ถาม Cache ก่อน
     ┌──────────────┐
     │  Cache HIT?  │
     └──────┬───────┘
     YES ◄──┤──► NO
      │              │
      │         3. Query DB
      │              │
      │         4. SET cache(key, value, TTL)
      │              │
      └──────►  5. ส่งข้อมูลกลับ

  ข้อดี : App ควบคุมได้เต็มที่
  ข้อเสีย: MISS ครั้งแรกช้า (Cold Start)
```

---

#### 2. Write-Through

ทุกครั้งที่เขียนข้อมูลลง DB จะเขียนลง Cache พร้อมกันเสมอ

```
WRITE-THROUGH FLOW
============================================================

  Write Request
        │
        ├──────────────► Cache (เขียนพร้อมกัน)
        │
        └──────────────► Database

  ข้อดี : Cache ตรงกับ DB เสมอ ไม่มี Stale Data
  ข้อเสีย: Write ช้าลงนิดหน่อย (ต้องเขียน 2 ที่)
```

---

#### 3. Write-Behind (Write-Back)

เขียนลง Cache ก่อน แล้วค่อยเขียนลง DB ทีหลังแบบ Async

```
WRITE-BEHIND FLOW
============================================================

  Write Request
        │
        ▼
      Cache ──── ตอบ OK ทันที ────► Client
        │
        │  (background job, async)
        ▼
      Database  ← เขียนทีหลัง

  ข้อดี : Write เร็วมาก
  ข้อเสีย: ข้อมูล DB อาจล้าหลัง Cache ชั่วคราว
           ถ้า Cache พังก่อน DB เขียน = สูญข้อมูล
```

---

### TTL (Time-To-Live)

TTL คือ "อายุ" ของ Cache Entry — ระบุว่าข้อมูลชิ้นนั้นจะหมดอายุเมื่อไหร่

```
TTL COMPARISON TABLE
============================================================
  ข้อมูล                  TTL          เหตุผล
  ──────────────────────  ──────────   ─────────────────────
  GET /leaderboard        30 วินาที    อัปเดตบ่อยเมื่อมีคะแนนใหม่
  GET /tasks              10 นาที      เปลี่ยนน้อย
  GET /users/:id          1 ชั่วโมง    เปลี่ยนนานๆ ครั้ง
  GET /tasks/:id/detail   24 ชั่วโมง   Task Config แทบไม่เปลี่ยน
  POST /submissions       ❌ ห้าม Cache เปลี่ยนทุก Request
  PUT /submissions/score  ❌ ห้าม Cache ผล Write ไม่ Cache
```

---

### Cache Invalidation Problem

> *"There are only two hard things in Computer Science: cache invalidation and naming things."* — Phil Karlton

**ปัญหา:** จะรู้ได้อย่างไรว่าเมื่อไหร่ต้องล้าง Cache?

```
CACHE INVALIDATION SCENARIO — TP2026
============================================================

  STEP 1: GET /api/leaderboard
    Cache MISS → Query DB → เก็บ Cache (TTL 30s)
    Return: [Somchai:285, Ahmed:270, Maria:255]
                         ✅ ถูกต้อง

  STEP 2: Judge ให้คะแนน Ahmed เพิ่มเป็น 300
    PUT /submissions/5/score { score: 100 }
    → Update DB ✅
    → Cache ยังเก็บ [Somchai:285, Ahmed:270] ❌ เก่าแล้ว!

  STEP 3: GET /api/leaderboard (ทันทีหลังให้คะแนน)
    Cache HIT → Return: [Somchai:285, Ahmed:270] ← ผิด! ❌

  วิธีแก้: ลบ Cache key ทันทีเมื่อ Judge ให้คะแนน
    → DEL cache['leaderboard:all']
    → GET /api/leaderboard ครั้งถัดไป: MISS → ดึงจาก DB ใหม่ ✅
```

**กลยุทธ์ Cache Invalidation 3 แบบ:**

| แบบ | วิธี | ข้อดี | ข้อเสีย |
|-----|------|-------|---------|
| **TTL-based** | ปล่อยให้หมดอายุเอง | ง่าย ไม่ต้องเขียน Code พิเศษ | ข้อมูลอาจค้างสูงสุดเท่า TTL |
| **Event-based** | ลบ Cache ทันทีเมื่อข้อมูลเปลี่ยน | ข้อมูลแม่นยำ | ต้องเขียน invalidation logic |
| **Version-based** | เพิ่ม version ใน key เช่น `leaderboard:v3` | ไม่ต้องลบ ใช้ key ใหม่ | Key เก่าค้างใน Cache นาน |

---

### In-Memory Cache vs Redis

```
FEATURE COMPARISON
============================================================
  Feature               In-Memory (JS Map)     Redis
  ──────────────────    ────────────────────   ─────────────────
  ความเร็ว              เร็วที่สุด (ns)        เร็วมาก (< 1ms)
  ข้อมูลอยู่รอด Restart ❌ หายเมื่อ restart    ✅ มี Persistence
  Multi-process share   ❌ แชร์ไม่ได้           ✅ แชร์ได้จากทุก Process
  Data Structures       Map, Object            String/Hash/List/Set
  การ Scale             ❌ ใช้ได้แค่ 1 server  ✅ รองรับ Cluster
  Setup                 ไม่ต้องติดตั้งเพิ่ม    ต้องติดตั้ง Redis
  เหมาะกับ             Dev / small app        Production
```

---

### HTTP Cache-Control Headers

Browser และ CDN ก็ Cache ได้ ควบคุมด้วย Response Header

```
// ให้ Browser Cache ไว้ 5 นาที (public = CDN ก็ Cache ได้)
res.set('Cache-Control', 'public, max-age=300');

// ห้าม Cache เด็ดขาด (ข้อมูล Sensitive)
res.set('Cache-Control', 'no-store');

// ต้อง Revalidate กับ Server ก่อนใช้ Cache
res.set('Cache-Control', 'no-cache');
```

---

## 💻 ตัวอย่างโค้ด (Code Implementation)

In-Memory Cache Class พร้อม TTL สำหรับ TP2026

::: code-group

```js [cache.js]
/**
 * SimpleCache — In-Memory Cache พร้อม TTL
 * WSA2026 Test Submission Management System
 */
class SimpleCache {
  constructor() {
    // Map เก็บข้อมูล: key → { value, expiresAt }
    this.store = new Map();
    this.hits   = 0;
    this.misses = 0;

    // Cleanup อัตโนมัติทุก 60 วินาที
    this.cleanupInterval = setInterval(() => {
      this._cleanup();
    }, 60_000);
  }

  /**
   * เก็บข้อมูล
   * @param {string} key
   * @param {*}      value
   * @param {number} ttlSeconds
   */
  set(key, value, ttlSeconds = 300) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
    console.log(`[Cache] SET "${key}" TTL=${ttlSeconds}s`);
  }

  /**
   * ดึงข้อมูล — คืน null ถ้าหมดอายุหรือไม่มี
   * @param {string} key
   * @returns {*|null}
   */
  get(key) {
    const entry = this.store.get(key);

    if (!entry) {
      this.misses++;
      console.log(`[Cache] MISS "${key}"`);
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.misses++;
      console.log(`[Cache] EXPIRED "${key}"`);
      return null;
    }

    this.hits++;
    console.log(`[Cache] HIT  "${key}"`);
    return entry.value;
  }

  /**
   * ลบ Cache Key (Event-based Invalidation)
   * @param {string} key
   */
  del(key) {
    const deleted = this.store.delete(key);
    if (deleted) console.log(`[Cache] DEL  "${key}"`);
    return deleted;
  }

  /**
   * ลบทุก key ที่ขึ้นต้นด้วย prefix
   * เช่น delByPrefix('leaderboard:') ลบ leaderboard ทุก task
   */
  delByPrefix(prefix) {
    let count = 0;
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        count++;
      }
    }
    console.log(`[Cache] DEL prefix "${prefix}" → ${count} keys`);
    return count;
  }

  /** Hit Rate เป็น % */
  hitRate() {
    const total = this.hits + this.misses;
    if (total === 0) return '0.00%';
    return ((this.hits / total) * 100).toFixed(2) + '%';
  }

  /** สถิติ Cache */
  stats() {
    return {
      totalKeys : this.store.size,
      hits      : this.hits,
      misses    : this.misses,
      hitRate   : this.hitRate(),
      keys      : [...this.store.keys()],
    };
  }

  /** ลบ Entry ที่หมดอายุแล้ว (เรียกอัตโนมัติ) */
  _cleanup() {
    const now = Date.now();
    let removed = 0;
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        removed++;
      }
    }
    if (removed > 0) {
      console.log(`[Cache] Cleanup removed ${removed} expired entries`);
    }
  }

  /** ปิด Cleanup Interval เมื่อไม่ใช้งาน */
  destroy() {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Export เป็น Singleton
module.exports = new SimpleCache();
```

```js [leaderboard-route.js]
/**
 * Leaderboard Route — Cache-Aside Pattern
 * WSA2026 Test Submission Management System
 */
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const cache   = require('../cache');

const LEADERBOARD_KEY = 'leaderboard:all';
const LEADERBOARD_TTL = 30; // 30 วินาที

// GET /api/leaderboard
router.get('/', async (req, res) => {
  // 1. ตรวจ Cache ก่อน
  const cached = cache.get(LEADERBOARD_KEY);
  if (cached) {
    return res.json({ source: 'cache', data: cached });
  }

  // 2. Cache MISS — Query DB
  try {
    const [rows] = await db.query(`
      SELECT
        u.id,
        u.name,
        u.country,
        COUNT(s.id)          AS total_submissions,
        COALESCE(SUM(s.score), 0) AS total_score,
        MAX(s.score)         AS best_score,
        RANK() OVER (ORDER BY COALESCE(SUM(s.score), 0) DESC) AS rank
      FROM users u
      LEFT JOIN submissions s
        ON s.candidate_id = u.id
        AND s.status = 'scored'
      WHERE u.role = 'candidate'
      GROUP BY u.id, u.name, u.country
      ORDER BY total_score DESC
    `);

    // 3. เก็บ Cache
    cache.set(LEADERBOARD_KEY, rows, LEADERBOARD_TTL);

    res.json({ source: 'database', data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/submissions/:id/score — Judge ให้คะแนน
// Invalidate Cache หลัง Update
router.put('/submissions/:id/score', async (req, res) => {
  const { id }    = req.params;
  const { score } = req.body;

  if (score === undefined || score < 0) {
    return res.status(400).json({ error: 'score ต้องมากกว่าหรือเท่ากับ 0' });
  }

  try {
    const [result] = await db.query(
      `UPDATE submissions SET score = ?, status = 'scored'
       WHERE id = ? AND status IN ('pending', 'submitted')`,
      [score, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบ Submission หรือไม่สามารถให้คะแนนได้' });
    }

    // Invalidate Cache
    cache.del(LEADERBOARD_KEY);

    res.json({
      message      : 'บันทึกคะแนนสำเร็จ',
      submissionId : id,
      score,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
```

```js [cache-demo.js]
/**
 * Demo: แสดงการทำงานของ Cache พร้อม Stats
 * WSA2026 Test Submission Management System
 */
const cache = require('./cache');

console.log('=== TP2026 Cache Demo ===\n');

// SET ข้อมูล
cache.set('leaderboard:all', [
  { rank: 1, name: 'Somchai', country: 'TH', total_score: 285 },
  { rank: 2, name: 'Ahmed',   country: 'SA', total_score: 270 },
  { rank: 3, name: 'Maria',   country: 'BR', total_score: 255 },
], 30);

// HIT
const data = cache.get('leaderboard:all');
console.log('Leaderboard entries:', data.length);

// HIT อีกครั้ง
cache.get('leaderboard:all');

// DEL (simulate judge scoring)
cache.del('leaderboard:all');

// MISS หลัง DEL
cache.get('leaderboard:all'); // null

// Stats
console.log('\n--- Cache Stats ---');
console.log(cache.stats());
// { totalKeys: 0, hits: 2, misses: 1, hitRate: '66.67%', keys: [] }
```

:::

---

## 🎯 โจทย์ฝึกปฏิบัติเสริมความเข้าใจ (Mini Exercise)

**โจทย์:** เพิ่ม method `getOrSet(key, fetchFn, ttl)` ใน SimpleCache
- ถ้า Cache HIT → คืนค่าทันที
- ถ้า Cache MISS → เรียก `fetchFn()` เพื่อดึงข้อมูล แล้วเก็บ Cache แล้วคืนค่า
- ช่วยลด Boilerplate Code ใน Route Handler

```js
// ตัวอย่างการใช้งาน
const leaderboard = await cache.getOrSet(
  'leaderboard:all',
  () => db.query('SELECT ...'),
  30
);
```

::: details 💡 คำใบ้ (Hint)

```js
async getOrSet(key, fetchFn, ttlSeconds = 300) {
  const cached = this.get(key);
  if (cached !== null) return cached;

  const data = await fetchFn();
  this.set(key, data, ttlSeconds);
  return data;
}
```

:::

---

## 🔥 Challenge (โจทย์ท้าทาย!)

สร้าง Express Middleware ชื่อ `cacheMiddleware(ttlSeconds)` ที่:

1. ใช้ `req.originalUrl` เป็น Cache key
2. Cache HIT → ตอบทันที พร้อม Header `X-Cache: HIT`
3. Cache MISS → ดัก `res.json()` เพื่อเก็บ Cache ก่อนส่ง พร้อม Header `X-Cache: MISS`
4. เพิ่ม Header `X-Cache-Age` บอกอายุที่เหลือเป็นวินาที

```js
// ตัวอย่างการใช้งาน
router.get('/leaderboard', cacheMiddleware(30), leaderboardHandler);
router.get('/tasks',       cacheMiddleware(600), tasksHandler);
```

---

## 🗣️ ทบทวน (Review)

::: details ❓ คำถามทบทวน

**คำถาม 1:** Cache-Aside ต่างจาก Write-Through อย่างไร?
**แนวคำตอบ:** Cache-Aside — App ดึง Cache เอง ถ้า Miss ค่อยไป DB แล้วค่อยเก็บ Cache; Write-Through — ทุกครั้งที่ Write จะอัปเดทั้ง DB และ Cache พร้อมกัน ทำให้ Cache ตรงกับ DB เสมอ

**คำถาม 2:** TTL สั้นเกินไปและยาวเกินไปมีผลอย่างไร?
**แนวคำตอบ:** สั้นเกินไป → Cache MISS บ่อย ประสิทธิภาพไม่ดี; ยาวเกินไป → Stale Data ผู้ใช้เห็นข้อมูลเก่านานเกินไป

**คำถาม 3:** ทำไม Cache Invalidation ถึงเป็นปัญหายาก?
**แนวคำตอบ:** ต้องรู้แน่ชัดว่า event ใดบ้างที่ทำให้ข้อมูลเปลี่ยน และ Cache อาจกระจายอยู่หลาย Server ทำให้ invalidate ทั้งหมดพร้อมกันทำได้ยาก

**คำถาม 4:** In-Memory Cache กับ Redis ต่างกันอย่างไรในแง่ Multi-process?
**แนวคำตอบ:** In-Memory Cache อยู่ใน Process เดียว ถ้ารัน Node.js หลาย Process จะแชร์ Cache ด้วยกันไม่ได้ แต่ละ Process มี Cache แยกกัน; Redis เป็น External Service แชร์ได้จากทุก Process ทุก Server

:::

---

> 👉 **ไปต่อ: [11-02: Redis Integration](/node/11-02-redis-integration)**
