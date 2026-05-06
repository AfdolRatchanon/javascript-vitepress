# Module 5.2: Layered Architecture 🍰

> 💡 **เป้าหมาย:** เข้าใจการแบ่งโค้ดออกเป็นชั้น (Route → Controller → Service) เพื่อให้ระบบ WSA2026 Test Submission Management System อ่านง่าย ทดสอบได้ และบำรุงรักษาได้ในระยะยาว

---

## 📖 ทฤษฎีและแนวคิด (Theory & Concepts)

### ปัญหาของ "Monolithic Function" — Spaghetti Code 🍝

ลองนึกภาพว่าคุณกำลังพัฒนาระบบ WSA2026 แล้วเขียนโค้ดแบบนี้:

```javascript
// ❌ BAD: ทุกอย่างยัดอยู่ใน Route Handler เดียว
app.post('/api/submissions', async (req, res) => {
    // ตรวจสอบ Input
    if (!req.body.task_id) return res.status(400).json({ error: 'task_id required' });

    // Business Logic: ตรวจว่า candidate ส่งงานซ้ำไหม
    const existing = await db.query(
        'SELECT * FROM submissions WHERE candidate_id = ? AND task_id = ?',
        [req.user.id, req.body.task_id]
    );
    if (existing.length > 0) return res.status(409).json({ error: 'Already submitted' });

    // Business Logic: ตรวจว่า task หมดเวลาหรือยัง
    const task = await db.query('SELECT * FROM tasks WHERE id = ?', [req.body.task_id]);
    // ... คำนวณเวลา ...

    // บันทึก Database
    await db.query('INSERT INTO submissions ...', [...]);

    // ส่ง Email แจ้ง Judge
    await emailService.notifyJudge(...);

    res.status(201).json({ msg: 'Submitted' });
});
```

**ปัญหาที่จะตามมา:**
- **ทดสอบยาก:** จะ Unit Test Business Logic ยังไงโดยไม่ต่อ Database จริง?
- **ใช้ซ้ำไม่ได้:** ถ้าอยากให้ Judge ส่ง submission แทน candidate ต้องก๊อป Code ทั้งหมด
- **แก้ยาก:** แก้ SQL นิดหน่อยต้องอ่านทั้งไฟล์ก่อนถึงจะรู้ว่าแก้ตรงไหน
- **ทีมทำงานร่วมกันลำบาก:** 2 คนแก้ไฟล์เดียวกันพร้อมกัน = Git Conflict ตลอด

---

### แนวคิด Layered Architecture (สถาปัตยกรรมแบบแบ่งชั้น)

แนวคิดหลักคือ **"Separation of Concerns"** — แต่ละชั้นรับผิดชอบแค่งานของตัวเอง

```
╔══════════════════════════════════════════════════════════════╗
║           WSA2026 LAYERED ARCHITECTURE                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║   CLIENT (Frontend / Postman)                                ║
║       │                                                      ║
║       ▼  HTTP Request                                        ║
║  ┌─────────────────────────────────────────────────────┐     ║
║  │  LAYER 1: ROUTE LAYER                               │     ║
║  │  routes/submissionRoutes.js                         │     ║
║  │  หน้าที่: กำหนด URL path และส่งต่อให้ Controller   │     ║
║  │  ห้าม: มี Business Logic, SQL                       │     ║
║  └─────────────────────────────────────────────────────┘     ║
║       │                                                      ║
║       ▼  เรียก Handler Function                             ║
║  ┌─────────────────────────────────────────────────────┐     ║
║  │  LAYER 2: CONTROLLER LAYER                          │     ║
║  │  controllers/submissionController.js                │     ║
║  │  หน้าที่: รับ req/res, ตรวจ Input, เรียก Service  │     ║
║  │  ห้าม: มี SQL, Business Logic ซับซ้อน              │     ║
║  └─────────────────────────────────────────────────────┘     ║
║       │                                                      ║
║       ▼  เรียก Business Function                            ║
║  ┌─────────────────────────────────────────────────────┐     ║
║  │  LAYER 3: SERVICE LAYER                             │     ║
║  │  services/submissionService.js                      │     ║
║  │  หน้าที่: Business Logic, กฎทางธุรกิจ, คำนวณ     │     ║
║  │  ห้าม: มี req/res, ส่ง HTTP Response               │     ║
║  └─────────────────────────────────────────────────────┘     ║
║       │                                                      ║
║       ▼  Query Database                                      ║
║  ┌─────────────────────────────────────────────────────┐     ║
║  │  LAYER 4: REPOSITORY/MODEL (Optional)               │     ║
║  │  repositories/submissionRepository.js               │     ║
║  │  หน้าที่: SQL queries เท่านั้น                     │     ║
║  │  ห้าม: Business Logic, req/res                      │     ║
║  └─────────────────────────────────────────────────────┘     ║
║       │                                                      ║
║       ▼  SQL Result                                          ║
║  ┌─────────────────────────────────────────────────────┐     ║
║  │  DATABASE                                           │     ║
║  │  users / tasks / submissions                        │     ║
║  └─────────────────────────────────────────────────────┘     ║
║       │                                                      ║
║       └──────────────────────────────► HTTP Response         ║
║                                        (ส่งกลับจาก Controller)║
╚══════════════════════════════════════════════════════════════╝
```

---

### รายละเอียดแต่ละ Layer

#### Layer 1: Route Layer — แผนที่ URL
หน้าที่เดียวของ Route Layer คือ **"ถ้า URL นี้ถูกเรียก ให้ไปหา Controller ตัวนั้น"**

- รู้แค่ว่า URL ไหน → ไปหา Handler ไหน
- รู้ว่า Middleware ไหนต้องทำงานก่อน (เช่น Auth, Validation)
- **ไม่รู้เลย:** Business Logic, SQL, การคำนวณ

#### Layer 2: Controller Layer — ตัวเชื่อมระหว่าง HTTP กับ Business
หน้าที่ของ Controller คือ **"แปลภาษา HTTP เป็นการเรียก Service"**

- แกะข้อมูลออกจาก `req.body`, `req.params`, `req.query`
- ตรวจ Input เบื้องต้น (ต้องมีค่าไหม, format ถูกไหม)
- เรียก Service แล้วรับผลลัพธ์
- แปลผลลัพธ์เป็น HTTP Response (`res.json()`)
- จัดการ Error → แปลงเป็น HTTP Status Code

#### Layer 3: Service Layer — หัวสมองของระบบ
หน้าที่ของ Service คือ **"ทำตามกฎทางธุรกิจ"** (Business Rules)

- ตรวจสอบกฎซับซ้อน เช่น "candidate ส่งงานได้แค่ครั้งเดียว"
- คำนวณ เช่น "เวลาที่เหลือก่อน deadline"
- เรียก Repository/DB เพื่อ Query หรือบันทึกข้อมูล
- **ไม่รู้เลย:** HTTP Request คืออะไร, `req` หรือ `res` คืออะไร

#### Layer 4: Repository Layer (Optional) — ผู้เชี่ยวชาญ Database
เหมาะสำหรับโปรเจกต์ขนาดใหญ่ที่ต้องการความยืดหยุ่นในการเปลี่ยน Database

- เก็บ SQL queries ทุกตัวไว้ที่เดียว
- ถ้าวันหนึ่งเปลี่ยนจาก MySQL → PostgreSQL แก้แค่ไฟล์นี้

---

### โครงสร้างโฟลเดอร์มาตรฐาน

```
wsa2026-api/
├── routes/             ← Layer 1: URL Definitions
│   ├── submissionRoutes.js
│   ├── taskRoutes.js
│   └── userRoutes.js
├── controllers/        ← Layer 2: HTTP Handlers
│   ├── submissionController.js
│   ├── taskController.js
│   └── userController.js
├── services/           ← Layer 3: Business Logic
│   ├── submissionService.js
│   ├── taskService.js
│   └── userService.js
├── repositories/       ← Layer 4: DB Queries (Optional)
│   └── submissionRepository.js
├── middleware/         ← Auth, Validation, Error Handling
│   ├── authMiddleware.js
│   └── errorHandler.js
├── config/             ← DB Connection, Environment
│   └── db.js
├── app.js              ← Express Setup + Middleware Stack
└── server.js           ← Entry Point
```

---

### ตัวเปรียบเทียบ: Bad vs Good

```
╔══════════════════════════════════════════════════════════════╗
║  BAD (Monolithic)           GOOD (Layered)                   ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  app.js ──────────────      routes/submissionRoutes.js       ║
║  │ SQL queries         │    │  แค่กำหนด URL               │  ║
║  │ Business Logic      │    controllers/submissionController  ║
║  │ Input Validation    │    │  รับ req, ส่ง res           │  ║
║  │ req / res           │    services/submissionService.js     ║
║  │ Error Handling      │    │  Business Logic เท่านั้น    │  ║
║  └─────────────────────┘    └─────────────────────────────┘  ║
║                                                              ║
║  ผล: ไฟล์เดียว 500+ บรรทัด  ผล: แต่ละไฟล์ 30-50 บรรทัด    ║
║  Test: เป็นไปไม่ได้          Test: Mock Service ได้ง่ายๆ    ║
║  แก้: พังทั้งระบบ            แก้: Isolated, ปลอดภัย          ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 💻 ตัวอย่างโค้ด (Code Implementation)

โค้ดตัวอย่างด้านล่างนี้คือ **Submission Module** สำหรับระบบ WSA2026 — ครอบคลุมทั้ง 3 Layer

::: code-group

```js [routes/submissionRoutes.js]
// =========================================
// LAYER 1: ROUTE LAYER
// หน้าที่: กำหนด URL path เท่านั้น
// =========================================
const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// POST /api/submissions — candidate ส่งงาน
router.post(
    '/',
    authenticate,                      // ต้อง Login ก่อน
    authorize('candidate'),            // เฉพาะ candidate เท่านั้น
    submissionController.createSubmission
);

// GET /api/submissions — judge/manager ดูรายการทั้งหมด
router.get(
    '/',
    authenticate,
    authorize('judge', 'manager'),
    submissionController.getAllSubmissions
);

// GET /api/submissions/:id — ดูรายละเอียด submission
router.get(
    '/:id',
    authenticate,
    submissionController.getSubmissionById
);

// PATCH /api/submissions/:id/score — judge ให้คะแนน
router.patch(
    '/:id/score',
    authenticate,
    authorize('judge'),
    submissionController.scoreSubmission
);

module.exports = router;
```

```js [controllers/submissionController.js]
// =========================================
// LAYER 2: CONTROLLER LAYER
// หน้าที่: รับ req/res, ตรวจ Input, เรียก Service
// ห้ามมี: SQL, Business Logic ซับซ้อน
// =========================================
const submissionService = require('../services/submissionService');

// POST /api/submissions
exports.createSubmission = async (req, res, next) => {
    try {
        // 1. แกะข้อมูลจาก Request
        const { task_id, submission_url } = req.body;
        const candidate_id = req.user.id; // มาจาก Auth Middleware

        // 2. ตรวจ Input เบื้องต้น
        if (!task_id || !submission_url) {
            return res.status(400).json({
                error: 'task_id and submission_url are required'
            });
        }

        // 3. เรียก Service (ไม่รู้ว่า Service ทำอะไร)
        const submission = await submissionService.createSubmission({
            candidate_id,
            task_id,
            submission_url
        });

        // 4. ส่ง Response
        res.status(201).json({
            message: 'Submission created successfully',
            data: submission
        });

    } catch (err) {
        // 5. แปลง Error จาก Service → HTTP Status
        if (err.message === 'ALREADY_SUBMITTED') {
            return res.status(409).json({ error: 'You have already submitted this task' });
        }
        if (err.message === 'TASK_NOT_FOUND') {
            return res.status(404).json({ error: 'Task not found' });
        }
        if (err.message === 'TIME_LIMIT_EXCEEDED') {
            return res.status(403).json({ error: 'Submission time limit exceeded' });
        }
        next(err); // ส่ง Error ที่ไม่รู้จักไปยัง Global Error Handler
    }
};

// GET /api/submissions
exports.getAllSubmissions = async (req, res, next) => {
    try {
        const { task_id, status, page = 1, limit = 20 } = req.query;

        const result = await submissionService.getAllSubmissions({
            task_id,
            status,
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

// GET /api/submissions/:id
exports.getSubmissionById = async (req, res, next) => {
    try {
        const submission = await submissionService.getSubmissionById(req.params.id);
        res.json({ data: submission });
    } catch (err) {
        if (err.message === 'SUBMISSION_NOT_FOUND') {
            return res.status(404).json({ error: 'Submission not found' });
        }
        next(err);
    }
};

// PATCH /api/submissions/:id/score
exports.scoreSubmission = async (req, res, next) => {
    try {
        const { score } = req.body;
        const judge_id = req.user.id;

        if (score === undefined || score === null) {
            return res.status(400).json({ error: 'score is required' });
        }

        const updated = await submissionService.scoreSubmission({
            submission_id: req.params.id,
            score: Number(score),
            judge_id
        });

        res.json({
            message: 'Score recorded successfully',
            data: updated
        });
    } catch (err) {
        if (err.message === 'SUBMISSION_NOT_FOUND') {
            return res.status(404).json({ error: 'Submission not found' });
        }
        if (err.message === 'INVALID_SCORE') {
            return res.status(400).json({ error: 'Score must be between 0 and max_score' });
        }
        next(err);
    }
};
```

```js [services/submissionService.js]
// =========================================
// LAYER 3: SERVICE LAYER
// หน้าที่: Business Logic ล้วนๆ
// ห้ามมี: req, res, HTTP status codes
// =========================================
const db = require('../config/db');

// Business Function: สร้าง Submission ใหม่
exports.createSubmission = async ({ candidate_id, task_id, submission_url }) => {
    // Business Rule 1: ตรวจว่า task มีอยู่จริง
    const [tasks] = await db.query(
        'SELECT * FROM tasks WHERE id = ?',
        [task_id]
    );
    if (tasks.length === 0) {
        throw new Error('TASK_NOT_FOUND');
    }
    const task = tasks[0];

    // Business Rule 2: ตรวจว่า candidate ส่งงาน task นี้แล้วหรือยัง
    const [existing] = await db.query(
        'SELECT id FROM submissions WHERE candidate_id = ? AND task_id = ?',
        [candidate_id, task_id]
    );
    if (existing.length > 0) {
        throw new Error('ALREADY_SUBMITTED');
    }

    // Business Rule 3: ตรวจ Time Limit
    // (สมมติว่า task เริ่มต้นตอนที่ judge เปิดให้ส่ง — ตรวจจาก started_at)
    if (task.time_limit_minutes) {
        // ในระบบจริง: ตรวจ started_at + time_limit vs ปัจจุบัน
        // ตัวอย่างง่ายๆ ที่นี่ข้ามไปก่อน
    }

    // บันทึก Submission
    const [result] = await db.query(
        `INSERT INTO submissions 
         (candidate_id, task_id, submission_url, submitted_at, status)
         VALUES (?, ?, ?, NOW(), 'pending')`,
        [candidate_id, task_id, submission_url]
    );

    // ดึงข้อมูลที่เพิ่งบันทึกกลับมา
    const [rows] = await db.query(
        'SELECT * FROM submissions WHERE id = ?',
        [result.insertId]
    );
    return rows[0];
};

// Business Function: ดูรายการ submissions (Judge/Manager)
exports.getAllSubmissions = async ({ task_id, status, page, limit }) => {
    let query = `
        SELECT s.*, u.name AS candidate_name, t.title AS task_title
        FROM submissions s
        JOIN users u ON s.candidate_id = u.id
        JOIN tasks t ON s.task_id = t.id
        WHERE 1=1
    `;
    const params = [];

    if (task_id) {
        query += ' AND s.task_id = ?';
        params.push(task_id);
    }
    if (status) {
        query += ' AND s.status = ?';
        params.push(status);
    }

    // Count total
    const [countResult] = await db.query(
        `SELECT COUNT(*) AS total FROM (${query}) AS sub`,
        params
    );
    const total = countResult[0].total;

    // Pagination
    const offset = (page - 1) * limit;
    query += ' ORDER BY s.submitted_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await db.query(query, params);

    return { total, page, data: rows };
};

// Business Function: ดู Submission เดียว
exports.getSubmissionById = async (id) => {
    const [rows] = await db.query(
        `SELECT s.*, u.name AS candidate_name, u.country,
                t.title AS task_title, t.max_score
         FROM submissions s
         JOIN users u ON s.candidate_id = u.id
         JOIN tasks t ON s.task_id = t.id
         WHERE s.id = ?`,
        [id]
    );
    if (rows.length === 0) throw new Error('SUBMISSION_NOT_FOUND');
    return rows[0];
};

// Business Function: Judge ให้คะแนน
exports.scoreSubmission = async ({ submission_id, score, judge_id }) => {
    // Business Rule: ต้องหา submission ก่อน
    const submission = await exports.getSubmissionById(submission_id);

    // Business Rule: score ต้องอยู่ใน range 0 - max_score
    if (score < 0 || score > submission.max_score) {
        throw new Error('INVALID_SCORE');
    }

    await db.query(
        `UPDATE submissions 
         SET score = ?, status = 'scored', scored_by = ?, scored_at = NOW()
         WHERE id = ?`,
        [score, judge_id, submission_id]
    );

    const [rows] = await db.query(
        'SELECT * FROM submissions WHERE id = ?',
        [submission_id]
    );
    return rows[0];
};
```

:::

---

## 🎯 โจทย์ฝึกปฏิบัติเสริมความเข้าใจ (Mini Exercise)

- **โจทย์:** สร้าง 3-layer structure สำหรับ `tasks` module ของระบบ WSA2026 โดยต้องมี:

  1. `routes/taskRoutes.js` — กำหนด route สำหรับ:
     - `GET /api/tasks` — ดูรายการ tasks ทั้งหมด
     - `GET /api/tasks/:id` — ดูรายละเอียด task
     - `POST /api/tasks` — manager สร้าง task ใหม่

  2. `controllers/taskController.js` — handler สำหรับแต่ละ route (รับ req/res, เรียก service)

  3. `services/taskService.js` — business logic เช่น:
     - `getAllTasks()` — ดึงข้อมูลทั้งหมด
     - `getTaskById(id)` — throw `TASK_NOT_FOUND` ถ้าไม่เจอ
     - `createTask(data)` — validate ว่า `time_limit_minutes > 0`

::: details 💡 คำใบ้ (Hint)

- `taskRoutes.js` ควรมี `router.get('/')`, `router.get('/:id')`, `router.post('/')`
- `taskController.js` แต่ละ function ควรมี `try/catch` และแปลง error จาก service เป็น HTTP status
- `taskService.js` ห้ามมี `req`, `res` — ถ้าไม่เจอ task ให้ `throw new Error('TASK_NOT_FOUND')`
- โครงสร้าง `createTask` ควรตรวจ `time_limit_minutes` ก่อน insert
- ใน Route อย่าลืม `module.exports = router` และใน Controller อย่าลืม `exports.functionName = ...`

:::

---

## 🔥 Challenge (โจทย์ท้าทาย!)

- **โจทย์:** เพิ่ม **Layer ที่ 4 — Repository Layer** สำหรับ `submissions` module โดย:

  1. สร้าง `repositories/submissionRepository.js` ที่มี:
     - `findById(id)` — SELECT submission by ID
     - `findByCandidate(candidate_id)` — SELECT ทั้งหมดของ candidate
     - `create(data)` — INSERT submission ใหม่
     - `updateScore(id, score, judge_id)` — UPDATE score

  2. แก้ `services/submissionService.js` ให้เรียกใช้ Repository แทนการ query DB โดยตรง

  3. ผลลัพธ์ที่ต้องการ: `submissionService.js` ไม่มี `db.query()` เลยแม้แต่บรรทัดเดียว

  **เป้าหมายคือ:** ถ้าวันหนึ่งต้องเปลี่ยนจาก MySQL → MongoDB แก้แค่ Repository Layer เดียว ไม่ต้องแตะ Service หรือ Controller เลย

---

## 🗣️ ทบทวน (Review)

::: details ❓ คำถามทบทวนความเข้าใจ

**คำถาม 1:** ทำไม Controller จึงไม่ควรมี SQL query โดยตรง?

**แนวคำตอบ:** Controller มีหน้าที่คุยกับ HTTP Protocol เท่านั้น (รับ req, ส่ง res) ถ้ามี SQL ปนอยู่ การเปลี่ยน Database จาก MySQL เป็น PostgreSQL จะต้องแก้ไขหลายที่มาก และไม่สามารถ Unit Test Business Logic ได้โดยไม่ต่อ Database จริง

**คำถาม 2:** Service Layer ควร `return` อะไร และควร `throw` อะไร?

**แนวคำตอบ:** Service ควร `return` ข้อมูล (object, array, boolean) ที่ Business Logic ต้องการส่งกลับ และควร `throw new Error('ERROR_CODE')` เมื่อเกิดกรณีที่ขัดกับ Business Rules (เช่น `ALREADY_SUBMITTED`, `TASK_NOT_FOUND`) โดยใช้ Error Code เป็น string ที่ Controller จะนำไปแปลงเป็น HTTP Status อีกที

**คำถาม 3:** ความแตกต่างระหว่าง Route Layer กับ Controller Layer คืออะไร?

**แนวคำตอบ:** Route Layer รู้แค่ว่า URL ไหน (`/api/submissions`) จับคู่กับ Handler Function ไหน และ Middleware ตัวใดต้องทำงานก่อน (เช่น `authenticate`) ส่วน Controller Layer คือตัว Handler Function นั้นเอง ที่อ่านข้อมูลจาก `req`, เรียก Service, และส่ง Response กลับผ่าน `res`

:::
