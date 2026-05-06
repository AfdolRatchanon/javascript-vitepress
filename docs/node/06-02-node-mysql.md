# Node.js + MySQL (mysql2) 🗄️

> 💡 **เป้าหมาย:** เรียนรู้การเชื่อมต่อ MySQL จาก Node.js ด้วย package `mysql2/promise` เพื่อจัดการข้อมูล TP2026 (users, tasks, submissions) อย่างปลอดภัยด้วย prepared statements และ connection pooling เพื่อรองรับการแข่งขัน WorldSkills 2026 ระดับนานาชาติ

## 📖 ทฤษฎีและแนวคิด (Theory & Concepts)

### ทำไมต้องใช้ mysql2?

`mysql2` คือ MySQL driver สำหรับ Node.js ที่เร็วกว่า package `mysql` รุ่นเก่า รองรับ Promise API และ `async/await` ได้โดยตรง ทำให้เขียนโค้ดอ่านง่ายและจัดการ error ได้ดีกว่า

```bash
npm install mysql2
```

---

### mysql2/promise vs Callback Style

```
  ╔══════════════════════════════════════════════════════════════════╗
  ║              mysql2: สองวิธีที่ใช้ได้                            ║
  ╠═══════════════════════════════╦══════════════════════════════════╣
  ║  CALLBACK (แบบเก่า)            ║  PROMISE / async-await (แนะนำ)  ║
  ╠═══════════════════════════════╬══════════════════════════════════╣
  ║  require('mysql2')            ║  require('mysql2/promise')       ║
  ║                               ║                                  ║
  ║  pool.query(sql, (err,rows)   ║  const [rows] =                  ║
  ║    => {                       ║    await pool.query(sql, params)  ║
  ║    if (err) throw err;        ║                                  ║
  ║    // nested callback...      ║  // จัดการ error ด้วย try/catch  ║
  ║  });                          ║                                  ║
  ║                               ║                                  ║
  ║  ❌ Callback Hell             ║  ✅ Linear, อ่านง่าย              ║
  ║  ❌ Error handling ซับซ้อน    ║  ✅ try/catch ครอบได้ทันที       ║
  ║  ❌ ซ้อนกันลึกเมื่อมีหลาย    ║  ✅ Transaction เขียนง่าย         ║
  ║     operations ต่อกัน         ║  ✅ รองรับ async flow ได้ดี       ║
  ╚═══════════════════════════════╩══════════════════════════════════╝
```

**ข้อสรุป:** ใช้ `mysql2/promise` เสมอ เพราะทำงานร่วมกับ `async/await` ได้สมบูรณ์ และ error handling ด้วย `try/catch` ชัดเจนกว่า

---

### createPool() vs createConnection()

```
  ╔═════════════════════════════════════════════════════════════╗
  ║           Connection Strategy: Pool vs Single              ║
  ╠══════════════════════════════╦══════════════════════════════╣
  ║  createConnection()          ║  createPool()                ║
  ╠══════════════════════════════╬══════════════════════════════╣
  ║                              ║                              ║
  ║  Request 1 --> [TCP connect] ║  +------ Pool (10 conns) --+ ║
  ║               [query]        ║  | Conn#1  Conn#2  Conn#3  | ║
  ║               [disconnect]   ║  +------------------------+ ║
  ║                              ║       |        |            ║
  ║  Request 2 --> [TCP connect] ║  Req1-+   Req2-+            ║
  ║               [query]        ║  (reuse, no TCP overhead)   ║
  ║               [disconnect]   ║                              ║
  ║                              ║  Req3 --> [Conn#3]           ║
  ║  Request 3 --> [TCP connect] ║  Req4 --> [wait in queue]   ║
  ║  (ต้อง connect ใหม่ทุกครั้ง) ║  (ถ้า pool เต็ม รอได้)      ║
  ║                              ║                              ║
  ║  ❌ ช้า (TCP handshake ใหม่) ║  ✅ เร็ว (reuse connection)  ║
  ║  ❌ ไม่รองรับ concurrent     ║  ✅ รองรับ concurrent users  ║
  ║  ✅ เหมาะ script รันครั้งเดียว║  ✅ เหมาะ Web Application    ║
  ╚══════════════════════════════╩══════════════════════════════╝

  Pool Settings ที่แนะนำ:
  +--------------------------------------------+
  |  connectionLimit:    10  (สูงสุด 10 conns)  |
  |  waitForConnections: true (รอถ้า pool เต็ม) |
  |  queueLimit:         0   (queue ไม่จำกัด)   |
  +--------------------------------------------+
```

**กฎ:** ใน Web Application ใช้ `createPool()` เสมอ ใช้ `createConnection()` เฉพาะ script ที่รันครั้งเดียว เช่น database migration หรือ seed script

---

### Prepared Statements ป้องกัน SQL Injection

SQL Injection คือการโจมตีที่ผู้ใช้ส่งค่าที่มี SQL code แทรกอยู่ เช่น:

```
ค่าที่ส่งมา: "1 OR 1=1; DROP TABLE submissions --"
```

```
  ❌ String Concatenation (อันตราย):
  +--------------------------------------------------+
  |  const sql = "SELECT * FROM submissions          |
  |               WHERE id = " + req.params.id;      |
  |                                                  |
  |  กลายเป็น:                                       |
  |  SELECT * FROM submissions WHERE id =            |
  |  1 OR 1=1; DROP TABLE submissions --             |
  |  --> Return ทุกแถว + ลบ table!                   |
  +--------------------------------------------------+

  ✅ Prepared Statement (ปลอดภัย):
  +--------------------------------------------------+
  |  pool.query(                                     |
  |    "SELECT * FROM submissions WHERE id = ?",     |
  |    [req.params.id]    <-- mysql2 escape ให้       |
  |  )                                               |
  |                                                  |
  |  mysql2 แปลงเป็น:                                |
  |  WHERE id = '1 OR 1=1; DROP TABLE...'            |
  |  --> String literal ไม่ execute เป็น SQL         |
  +--------------------------------------------------+
```

---

### Transaction: Atomic Operations

Transaction รับประกันว่า SQL หลายคำสั่งจะสำเร็จหรือล้มเหลวพร้อมกัน ตัวอย่าง: เมื่อ judge ให้คะแนน ต้อง UPDATE submissions และ INSERT log พร้อมกัน

```
  Transaction Flow (Scoring a Submission):
  +--------------------------------------------------+
  |  conn.beginTransaction()                         |
  |          |                                       |
  |          v                                       |
  |  UPDATE submissions SET score=92.5               |
  |  WHERE id = 3 AND status = 'pending'             |
  |          |                                       |
  |     success? ---NO---> conn.rollback()           |
  |          |                  |                    |
  |         YES                 v                    |
  |          |            undo all changes           |
  |          v                  |                    |
  |  INSERT INTO score_logs     v                    |
  |  (submission_id, score,   return error           |
  |   judge_id, scored_at)                           |
  |          |                                       |
  |     success? ---NO---> conn.rollback()           |
  |          |                                       |
  |         YES                                      |
  |          v                                       |
  |  conn.commit()  <-- บันทึกทุกอย่างถาวร          |
  +--------------------------------------------------+
```

---

### Architecture ของ db.js Module Pattern

```
  +------------------------------------------+
  |  config/db.js  (Singleton Pool Module)    |
  |                                          |
  |  require('mysql2/promise')               |
  |  mysql.createPool({ host, user, ... })   |
  |  module.exports = pool                   |
  +------------------+-----------------------+
                     |
       +-------------+-------------+
       |             |             |
       v             v             v
  submissionModel  userModel   taskModel
  .js              .js         .js
  (require pool    (require    (require
  เดิมซ้ำ)         pool)       pool)

  Node.js cache module --> pool ถูกสร้างครั้งเดียว
  ไม่ว่าจะ require กี่ครั้งก็ได้ pool instance เดิม
```

---

## 💻 ตัวอย่างโค้ด (Code Implementation)

::: code-group

```js [config/db.js]
// config/db.js
// Singleton MySQL Connection Pool สำหรับระบบ TP2026
// require ไฟล์นี้จากทุกที่ที่ต้องการ DB — Node.js จะ cache instance
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               parseInt(process.env.DB_PORT) || 3306,
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'tp2026_db',
  waitForConnections: true,
  connectionLimit:    10,   // สูงสุด 10 connections พร้อมกัน
  queueLimit:         0,    // queue ไม่จำกัด (0 = unlimited)
  charset:            'utf8mb4'
});

// ทดสอบ connection ตอน boot
pool.getConnection()
  .then(conn => {
    console.log('[DB] MySQL pool connected to', process.env.DB_NAME);
    conn.release(); // คืน connection กลับ pool ทันที
  })
  .catch(err => {
    console.error('[DB] Cannot connect to MySQL:', err.message);
    process.exit(1); // หยุด process ถ้าต่อ DB ไม่ได้
  });

module.exports = pool;
```

```js [models/submissionModel.js]
// models/submissionModel.js
// CRUD + Transaction สำหรับ submissions TP2026
const pool = require('../config/db');

// ─────────────────────────────────────────────────────────────
// SELECT: ดู submissions ทั้งหมด พร้อม 3-table JOIN
// JOIN users  --> candidate_name, country, region
// JOIN tasks  --> task_title, max_score
// รองรับ filter ตาม status และ pagination
// ─────────────────────────────────────────────────────────────
async function findAllSubmissions({ status = null, limit = 20, offset = 0 } = {}) {
  let sql = `
    SELECT
      s.id,
      s.submission_url,
      s.submitted_at,
      s.score,
      s.status,
      u.name       AS candidate_name,
      u.country,
      u.region,
      t.title      AS task_title,
      t.max_score
    FROM submissions s
    JOIN users u ON s.candidate_id = u.id
    JOIN tasks t  ON s.task_id     = t.id
    WHERE u.role = 'candidate'
  `;

  const params = [];

  if (status && ['pending', 'scored'].includes(status)) {
    sql += ' AND s.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY s.submitted_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const [rows] = await pool.query(sql, params);
  return rows;
}

// ─────────────────────────────────────────────────────────────
// SELECT: ดู submission เดียวตาม id พร้อม full detail
// ─────────────────────────────────────────────────────────────
async function findSubmissionById(id) {
  const sql = `
    SELECT
      s.*,
      u.name    AS candidate_name,
      u.country,
      u.region,
      t.title   AS task_title,
      t.max_score,
      t.time_limit_minutes
    FROM submissions s
    JOIN users u ON s.candidate_id = u.id
    JOIN tasks t  ON s.task_id     = t.id
    WHERE s.id = ?
  `;

  const [rows] = await pool.query(sql, [id]);
  return rows[0] || null; // null ถ้าไม่พบ
}

// ─────────────────────────────────────────────────────────────
// INSERT: เพิ่ม submission ใหม่
// params: { candidate_id, task_id, submission_url }
// ─────────────────────────────────────────────────────────────
async function createSubmission({ candidate_id, task_id, submission_url }) {
  const sql = `
    INSERT INTO submissions (candidate_id, task_id, submission_url)
    VALUES (?, ?, ?)
  `;

  try {
    const [result] = await pool.query(sql, [candidate_id, task_id, submission_url]);
    return { id: result.insertId };
  } catch (err) {
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      throw new Error('candidate_id หรือ task_id ไม่มีอยู่ใน database');
    }
    if (err.code === 'ER_DUP_ENTRY') {
      throw new Error('Submission นี้มีอยู่แล้ว');
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────
// UPDATE: Judge ให้คะแนน submission
// คืนค่า affectedRows: 0=ไม่พบ, 1=สำเร็จ
// ─────────────────────────────────────────────────────────────
async function scoreSubmission(submissionId, score) {
  const sql = `
    UPDATE submissions
    SET score  = ?,
        status = 'scored'
    WHERE id = ?
  `;

  const [result] = await pool.query(sql, [score, submissionId]);
  return result.affectedRows;
}

// ─────────────────────────────────────────────────────────────
// DELETE: ลบ submission (เฉพาะ manager เรียกใช้)
// ─────────────────────────────────────────────────────────────
async function deleteSubmission(id) {
  const [result] = await pool.query(
    'DELETE FROM submissions WHERE id = ?',
    [id]
  );
  return result.affectedRows;
}

// ─────────────────────────────────────────────────────────────
// TRANSACTION: Score submission + บันทึก audit log
// ทั้ง 2 operations ต้องสำเร็จพร้อมกัน (Atomic)
// ─────────────────────────────────────────────────────────────
async function scoreWithAuditLog({ submissionId, score, judgeId }) {
  const conn = await pool.getConnection(); // ขอ connection โดยตรง

  try {
    await conn.beginTransaction();

    // Step 1: ตรวจสอบ submission พร้อม lock row (FOR UPDATE)
    const [[submission]] = await conn.query(
      'SELECT id, status FROM submissions WHERE id = ? FOR UPDATE',
      [submissionId]
    );

    if (!submission) {
      throw new Error('ไม่พบ submission id: ' + submissionId);
    }
    if (submission.status === 'scored') {
      throw new Error('Submission นี้ถูกให้คะแนนไปแล้ว');
    }

    // Step 2: อัปเดต score + status
    await conn.query(
      `UPDATE submissions SET score = ?, status = 'scored' WHERE id = ?`,
      [score, submissionId]
    );

    // Step 3: บันทึก audit log
    // (ต้องสร้าง table score_logs ก่อนใช้งานจริง)
    // await conn.query(
    //   `INSERT INTO score_logs
    //    (submission_id, score, judge_id, scored_at)
    //    VALUES (?, ?, ?, NOW())`,
    //   [submissionId, score, judgeId]
    // );

    await conn.commit(); // บันทึกถาวร
    return { success: true, submissionId, score };

  } catch (err) {
    await conn.rollback(); // ยกเลิกทุกอย่างถ้า error
    throw err;
  } finally {
    conn.release(); // คืน connection กลับ pool เสมอ (ใน finally)
  }
}

// ─────────────────────────────────────────────────────────────
// COUNT: นับจำนวน submissions สำหรับ pagination
// ─────────────────────────────────────────────────────────────
async function countSubmissions({ status = null } = {}) {
  let sql = `
    SELECT COUNT(*) AS total
    FROM submissions s
    JOIN users u ON s.candidate_id = u.id
    WHERE u.role = 'candidate'
  `;
  const params = [];

  if (status && ['pending', 'scored'].includes(status)) {
    sql += ' AND s.status = ?';
    params.push(status);
  }

  const [[{ total }]] = await pool.query(sql, params);
  return total;
}

module.exports = {
  findAllSubmissions,
  findSubmissionById,
  createSubmission,
  scoreSubmission,
  deleteSubmission,
  scoreWithAuditLog,
  countSubmissions
};
```

```js [demo-usage.js]
// demo-usage.js — ทดสอบ model functions ทั้งหมด
// รัน: node demo-usage.js
require('dotenv').config();

const {
  findAllSubmissions,
  findSubmissionById,
  createSubmission,
  scoreSubmission,
  deleteSubmission,
  scoreWithAuditLog,
  countSubmissions
} = require('./models/submissionModel');

async function main() {
  console.log('=== TP2026 Submission Model Demo ===\n');

  // ── 1. SELECT all ──────────────────────────────────────────
  console.log('--- 1. findAllSubmissions() ---');
  const all = await findAllSubmissions({ limit: 5, offset: 0 });
  console.log(`พบ ${all.length} submissions`);
  if (all[0]) {
    console.log('ตัวอย่างแถวแรก:', {
      id:             all[0].id,
      candidate_name: all[0].candidate_name,
      country:        all[0].country,
      task_title:     all[0].task_title,
      status:         all[0].status
    });
  }

  // ── 2. SELECT by id ────────────────────────────────────────
  console.log('\n--- 2. findSubmissionById(1) ---');
  const one = await findSubmissionById(1);
  if (one) {
    console.log('พบ:', one.candidate_name, '|', one.task_title);
  } else {
    console.log('ไม่พบ submission id=1');
  }

  // ── 3. INSERT ──────────────────────────────────────────────
  console.log('\n--- 3. createSubmission() ---');
  try {
    const created = await createSubmission({
      candidate_id:   2,
      task_id:        3,
      submission_url: 'https://repo.tp2026.com/submissions/sg001-task3'
    });
    console.log('สร้างสำเร็จ, insertId:', created.id);

    // ── 4. UPDATE (score) ──────────────────────────────────
    console.log('\n--- 4. scoreSubmission() ---');
    const affected = await scoreSubmission(created.id, 88.5);
    console.log('affectedRows:', affected);

    // ── 5. DELETE ──────────────────────────────────────────
    console.log('\n--- 5. deleteSubmission() ---');
    const deleted = await deleteSubmission(created.id);
    console.log('deletedRows:', deleted);

  } catch (err) {
    console.error('Error:', err.message);
  }

  // ── 6. TRANSACTION ────────────────────────────────────────
  console.log('\n--- 6. scoreWithAuditLog() Transaction ---');
  try {
    const pending = await findAllSubmissions({ status: 'pending', limit: 1 });
    if (pending.length > 0) {
      const result = await scoreWithAuditLog({
        submissionId: pending[0].id,
        score:        75.0,
        judgeId:      4  // judge_01 id=4 จาก seed data
      });
      console.log('Transaction สำเร็จ:', result);
    } else {
      console.log('ไม่มี pending submissions สำหรับทดสอบ');
    }
  } catch (err) {
    console.error('Transaction failed:', err.message);
  }

  // ── 7. COUNT ──────────────────────────────────────────────
  console.log('\n--- 7. countSubmissions() ---');
  const total   = await countSubmissions();
  const pending = await countSubmissions({ status: 'pending' });
  const scored  = await countSubmissions({ status: 'scored' });
  console.log('total:', total, '| pending:', pending, '| scored:', scored);

  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
```

:::

---

## 🎯 โจทย์ฝึกปฏิบัติเสริมความเข้าใจ (Mini Exercise)

- **โจทย์:** สร้างไฟล์ `models/taskModel.js` ที่มี 3 functions คือ:
  1. `findAllTasks()` — ดึง tasks ทั้งหมด เรียงตาม `title ASC`
  2. `findTaskWithStats(id)` — ดึง task เดียว พร้อมนับ `submission_count` และคำนวณ `avg_score` ของ task นั้น (ใช้ subquery หรือ LEFT JOIN)
  3. `createTask({ title, description, time_limit_minutes, max_score })` — เพิ่ม task ใหม่

  ตัวอย่าง output ของ `findTaskWithStats(1)`:
  ```json
  {
    "id": 1,
    "title": "Web Technologies",
    "description": "Build responsive website...",
    "time_limit_minutes": 240,
    "max_score": 100,
    "submission_count": 3,
    "avg_score": 87.50
  }
  ```

::: details 💡 คำใบ้ (Hint)
- ใช้ `require('../config/db')` เพื่อ import pool
- สำหรับ `findTaskWithStats` ใช้ LEFT JOIN กับ aggregate:
  ```sql
  SELECT t.*,
    COUNT(s.id)           AS submission_count,
    ROUND(AVG(s.score),2) AS avg_score
  FROM tasks t
  LEFT JOIN submissions s ON s.task_id = t.id
  WHERE t.id = ?
  GROUP BY t.id
  ```
- `const [[task]] = await pool.query(sql, [id])` — double destructure เพราะ `pool.query` คืน `[rows, fields]` และ `rows` เป็น array
- ตรวจสอบ `if (!task) return null` ก่อน return เสมอ
:::

---

## 🔥 Challenge (โจทย์ท้าทาย!)

- **โจทย์:** สร้าง function `getTopCandidatesByCountry(country, limit = 5)` ใน `submissionModel.js` ที่:
  - กรองเฉพาะ users ที่ `role = 'candidate'` จาก `country` ที่ระบุ
  - นับจำนวน tasks ที่ส่งแล้ว (`task_count`)
  - คำนวณ `avg_score` เฉพาะ submissions ที่ `status = 'scored'`
  - เรียงตาม `avg_score DESC`
  - ใช้ Transaction เพื่อให้ผล query ที่อ่านได้มีความ consistent กัน (`START TRANSACTION READ ONLY`)

---

## 🗣️ ทบทวน (Review)

::: details ❓ คำถามทบทวนความเข้าใจ

**คำถาม 1:** ทำไม `createPool()` ถึงดีกว่า `createConnection()` ใน Web Application?

**แนวคำตอบ:** Web Application รับ HTTP requests หลายอันพร้อมกัน ถ้าใช้ `createConnection()` ต้อง connect ใหม่ทุกครั้ง ซึ่งมี TCP handshake overhead และไม่รองรับ concurrent requests ได้ดี `createPool()` เก็บ connections ไว้ล่วงหน้า (เช่น 10 connections) และ reuse ทันทีโดยไม่ต้อง connect ใหม่ ทำให้เร็วกว่าและรองรับ concurrent users ได้มากกว่า

**คำถาม 2:** Prepared Statements ป้องกัน SQL Injection ได้อย่างไร?

**แนวคำตอบ:** เมื่อใช้ `pool.query('SELECT * FROM submissions WHERE id = ?', [id])` mysql2 จะ escape ค่า `id` ก่อนนำไป query โดย treat เป็น string literal เสมอ ไม่ว่า input จะเป็นอะไร ดังนั้นถ้า user ส่ง `"1; DROP TABLE submissions"` มา mysql2 จะ escape เป็น string ที่ MySQL จะ parse ว่าเป็น id มีค่าเป็น text นั้น ไม่ใช่ SQL command แยก ทำให้ injection ไม่สำเร็จ

**คำถาม 3:** ในโค้ด `const [[{ total }]] = await pool.query(sql, params)` เครื่องหมาย `[[...]]` หมายถึงอะไร?

**แนวคำตอบ:** `pool.query()` คืน array 2 ตัว คือ `[rows, fields]` ดังนั้น `[rows] = await pool.query(...)` จะได้ `rows` ซึ่งเป็น array ของ result rows อีกชั้น `[{ total }] = rows` คือการ destructure element แรก และ `{ total }` คือดึง property `total` จาก object นั้น รวมเป็น `[[{ total }]]` ในบรรทัดเดียว เหมาะสำหรับ `SELECT COUNT(*) AS total` ที่คืนแค่แถวเดียว

:::

---

> 👉 **ไปต่อ: [Advanced SQL — Aggregation & Query Optimization](/node/06-03-advanced-sql)**
