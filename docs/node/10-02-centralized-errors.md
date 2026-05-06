# Centralized Error Handling 🚨

> 💡 **เป้าหมาย:** เข้าใจปัญหาของ Try-Catch ที่กระจัดกระจาย และสามารถสร้างระบบจัดการ Error แบบรวมศูนย์ (Centralized) สำหรับ WSA2026 Test Submission Management System ด้วย AppError class, asyncHandler wrapper, และ Global Error Handler Middleware

## 📖 ทฤษฎีและแนวคิด (Theory & Concepts)

### ปัญหา: Try-Catch Hell

ลองนึกภาพระบบ WSA2026 ที่มี Controller หลายสิบตัว ทุกตัวต้องเขียน try-catch ซ้ำๆ:

```
TRY-CATCH HELL — ปัญหาที่พบบ่อย
===================================

  authController.js:
  async function login(req, res) {
    try { ... }
    catch (err) { res.status(500).json({ message: err.message }) }
    //          ↑ โค้ดซ้ำกันทุก Controller!
  }

  submissionController.js:
  async function create(req, res) {
    try { ... }
    catch (err) { res.status(500).json({ message: err.message }) }
    //          ↑ เหมือนกันเป๊ะ!
  }

  scoreController.js:
  async function score(req, res) {
    try { ... }
    catch (err) { res.status(500).json({ message: 'Server Error' }) }
    //          ↑ บางทีเขียน message ต่างกัน! ไม่ consistent
  }

  ปัญหา:
  1. โค้ดซ้ำ 50+ ครั้ง ถ้าอยากเปลี่ยน format ต้องแก้ทุกไฟล์
  2. Error message ไม่ consistent (บางที 'Server Error' บางที err.message)
  3. ลืม try-catch = App crash ทั้งระบบ!
  4. Log error ไม่ครบ ตามหา bug ยาก
```

---

### ทางออก: 3 เลเยอร์ที่ทำงานร่วมกัน

```
CENTRALIZED ERROR HANDLING ARCHITECTURE
=========================================

  [Controller throws Error]
          │
          │  throw new AppError('ไม่พบ Submission', 404)
          │  หรือ Error จาก MySQL/JWT/ฯลฯ
          │
          ▼
  ┌──────────────────────────┐
  │   asyncHandler Wrapper   │  ← ดัก async errors อัตโนมัติ
  │   .catch(next)           │    ส่งต่อไป Global Handler
  └──────────────┬───────────┘
                 │  next(err)
                 ▼
  ┌──────────────────────────┐
  │  Global Error Handler    │  ← Middleware 4 params
  │  (err, req, res, next)   │    จัดการ error ทุกประเภท
  │                          │    ในที่เดียว
  └──────────────┬───────────┘
                 │
        ┌────────▼────────┐
        │ Response Format  │
        │ {                │
        │   success: false │
        │   message: ...   │
        │   statusCode: .. │
        │ }                │
        └─────────────────┘

  LAYER 1: AppError class      — กำหนด statusCode + isOperational
  LAYER 2: asyncHandler        — ห่อ Controller ให้ไม่ต้องมี try-catch
  LAYER 3: Global Error Handler — จัดการ format response ในที่เดียว
```

---

### AppError Class

```
APPERROR CLASS DESIGN
======================

  ปกติ: Error ของ JavaScript ไม่มี statusCode
  ┌─────────────────────────────────────────┐
  │  Error (built-in)                       │
  │  ├── message: string                    │
  │  └── stack: string                      │
  └─────────────────────────────────────────┘

  เราต้องการ: Error ที่มี statusCode ด้วย
  ┌─────────────────────────────────────────┐
  │  AppError extends Error                 │
  │  ├── message: string  (รับมาจาก Error) │
  │  ├── statusCode: number  (เราเพิ่มเอง) │
  │  └── isOperational: boolean            │
  │      true  = Error ที่คาดไว้ (404,400) │
  │      false = Bug ที่ไม่คาดไว้ (500)    │
  └─────────────────────────────────────────┘

  ใช้งาน:
  throw new AppError('ไม่พบ Submission', 404)
  throw new AppError('ไม่มีสิทธิ์', 403)
  throw new AppError('ข้อมูลไม่ถูกต้อง', 400)
```

---

### Error Types ใน TP2026

```
TP2026 ERROR TAXONOMY
======================

  400 Bad Request       — ข้อมูลที่ส่งมาผิด (Validation fail)
  401 Unauthorized      — ไม่มี Token หรือ Token ไม่ถูกต้อง
  403 Forbidden         — มี Token แต่ไม่มีสิทธิ์ (role ต่างกัน)
  404 Not Found         — ไม่พบ Resource (User, Submission, Task)
  409 Conflict          — ข้อมูลซ้ำ (username ซ้ำ, ส่งงานซ้ำ)
  429 Too Many Requests — เกิน Rate Limit
  500 Internal Server   — Bug หรือ Error ที่ไม่ได้คาดไว้

  TP2026 Error Flow:
  [Candidate ส่งงานที่ Task ID ไม่มีอยู่]
        │
        ▼
  submissionController.create:
    const [tasks] = await db.query('SELECT id FROM tasks WHERE id = ?', [task_id])
    if (tasks.length === 0)
      throw new AppError(`ไม่พบ Task ID ${task_id}`, 404)
        │
        ▼  asyncHandler.catch(next)
        ▼  next(error)
  Global Error Handler:
    res.status(404).json({
      success: false,
      message: 'ไม่พบ Task ID 99',
      statusCode: 404
    })
```

---

### Dev vs Production Error Response

```
ERROR RESPONSE: DEV vs PROD
=============================

  DEVELOPMENT (NODE_ENV=development):
  ────────────────────────────────────
  {
    "success": false,
    "message": "ไม่พบ Submission ID 42",
    "statusCode": 404,
    "stack": "AppError: ไม่พบ Submission ID 42\n    at submissionController.js:34\n    at ..."
  }
  ← เห็น stack trace ช่วย debug ได้รวดเร็ว

  PRODUCTION (NODE_ENV=production):
  ──────────────────────────────────
  {
    "success": false,
    "message": "ไม่พบ Submission ID 42",
    "statusCode": 404
  }
  ← ซ่อน stack trace ไม่ให้ Hacker รู้โครงสร้าง App
  ← ถ้าเป็น non-operational error (bug) ส่งแค่ "เกิดข้อผิดพลาด" แทน
```

---

### Error Propagation Chain

```
ERROR PROPAGATION THROUGH MIDDLEWARE CHAIN
==========================================

  [incoming request]
        │
        ▼
  ┌──────────────────┐
  │  CORS Middleware  │
  └────────┬─────────┘
           │ next()
           ▼
  ┌──────────────────┐
  │  Auth Middleware  │──── throw AppError('ไม่มีสิทธิ์', 403)
  └────────┬─────────┘                │
           │ next()                   │ next(err)
           ▼                          │
  ┌──────────────────┐                │
  │  Route Handler   │                │
  │  asyncHandler    │──── Error ─────┤
  │  (Controller)    │     ใน async   │
  └────────┬─────────┘                │
           │                          │
           └────────────┬─────────────┘
                        │ next(err)
                        ▼
  ┌──────────────────────────────────┐
  │   Global Error Handler           │  ← รับทุก error มาที่นี่
  │   (err, req, res, next)          │
  │   format → res.status().json()  │
  └──────────────────────────────────┘
```

---

## 💻 ตัวอย่างโค้ด (Code Implementation)

::: code-group

```js [utils/AppError.js]
// utils/AppError.js
// Custom Error Class สำหรับ WSA2026 Submission Management System

class AppError extends Error {
  /**
   * @param {string} message   - ข้อความ error ที่ส่งกลับ client
   * @param {number} statusCode - HTTP status code เช่น 404, 400, 403
   */
  constructor(message, statusCode) {
    super(message);       // ส่ง message ให้ Error (built-in) parent
    this.statusCode = statusCode;
    // isOperational = true: error ที่คาดไว้ เช่น 404, 403, 400
    // isOperational = false: bug ที่ไม่คาดไว้ จะถูก Global Handler จัดการต่างออกไป
    this.isOperational = true;
    // ตัด stack trace ให้เริ่มต้นที่จุดที่ throw AppError
    // เพื่อให้ stack trace สะอาดขึ้น
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
```

```js [utils/asyncHandler.js]
// utils/asyncHandler.js
// Wrapper ที่ช่วยให้ Controller ไม่ต้องมี try-catch
// Error จาก async function จะถูกส่งไปยัง next() อัตโนมัติ

/**
 * asyncHandler(fn) — ห่อ async Controller
 *
 * แทน:
 *   async function myController(req, res) {
 *     try { ... } catch(err) { next(err) }
 *   }
 *
 * ใช้:
 *   const myController = asyncHandler(async (req, res) => {
 *     // ไม่ต้อง try-catch เลย!
 *     // ถ้า error ใด error ก็จะถูกส่งไป Global Handler อัตโนมัติ
 *   })
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    // Promise.resolve ครอบ fn ให้แน่ใจว่าเป็น Promise
    // .catch(next) ส่ง error ไปยัง Express Error Middleware
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;
```

```js [middleware/errorHandler.js]
// middleware/errorHandler.js
// Global Error Handler Middleware
// วางไว้ล่างสุดของ app.js ต่อจาก routes ทั้งหมด
// Express จะรู้จักว่านี่คือ Error Handler เพราะมี 4 parameters

const AppError = require('../utils/AppError');

/**
 * handleDatabaseError — แปลง MySQL errors เป็น AppError ที่อ่านง่าย
 */
function handleDatabaseError(err) {
  // MySQL Duplicate Entry (เช่น username ซ้ำ)
  if (err.code === 'ER_DUP_ENTRY') {
    const field = err.message.match(/for key '(.+?)'/)?.[1] || 'field';
    return new AppError(`ข้อมูลนี้มีอยู่แล้ว (${field})`, 409);
  }

  // MySQL Foreign Key Constraint (เช่น candidate_id ไม่มีในตาราง users)
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return new AppError('ข้อมูลอ้างอิงไม่พบในระบบ', 400);
  }

  // MySQL Connection Error
  if (err.code === 'ECONNREFUSED') {
    return new AppError('ไม่สามารถเชื่อมต่อฐานข้อมูลได้', 503);
  }

  return null; // ไม่ใช่ MySQL error ที่รู้จัก
}

/**
 * handleJWTError — แปลง JWT errors เป็น AppError
 */
function handleJWTError(err) {
  if (err.name === 'JsonWebTokenError') {
    return new AppError('Token ไม่ถูกต้อง กรุณา Login ใหม่', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return new AppError('Token หมดอายุ กรุณา Login ใหม่', 401);
  }
  return null;
}

/**
 * Global Error Handler (4-parameter middleware)
 * Express จะเรียกใช้ middleware นี้เมื่อมีการเรียก next(err)
 */
const errorHandler = (err, req, res, next) => {
  // Log error เสมอ (สามารถเปลี่ยนเป็น Winston/Sentry ใน production)
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`);
  console.error(`       ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // แปลง specific errors ให้เป็น AppError ก่อน
  let error = err;

  const dbError = handleDatabaseError(err);
  if (dbError) error = dbError;

  const jwtError = handleJWTError(err);
  if (jwtError) error = jwtError;

  // ถ้าเป็น AppError (Operational error ที่เรา throw เอง)
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      statusCode: error.statusCode,
      // แสดง stack trace เฉพาะใน development
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }

  // Non-operational error (Bug ที่ไม่คาดไว้)
  // ใน Production ไม่บอก detail ให้ Client
  console.error('[UNEXPECTED ERROR]', err);
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development'
      ? err.message
      : 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ กรุณาลองใหม่ภายหลัง',
    statusCode: 500,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
```

```js [controllers/submissionController.js]
// controllers/submissionController.js
// ตัวอย่าง Controller ที่ใช้ asyncHandler + AppError
// ไม่มี try-catch เลย! โค้ดสะอาดขึ้นมาก

const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const db = require('../config/db');

/**
 * POST /api/submissions
 * candidate ส่งงาน
 */
const create = asyncHandler(async (req, res) => {
  // req.body ผ่าน validate(submissionSchema) แล้ว
  const { candidate_id, task_id, submission_url } = req.body;

  // ตรวจว่า Task มีอยู่จริง
  const [tasks] = await db.query('SELECT id, time_limit_minutes FROM tasks WHERE id = ?', [task_id]);
  if (tasks.length === 0) {
    throw new AppError(`ไม่พบ Task ID ${task_id}`, 404);
  }

  // ตรวจว่า candidate_id ตรงกับ user ที่ Login อยู่
  if (candidate_id !== req.user.id) {
    throw new AppError('candidate_id ต้องตรงกับ user ที่ Login อยู่', 403);
  }

  // ตรวจว่าส่งงาน Task นี้ไปแล้วหรือยัง
  const [existing] = await db.query(
    'SELECT id FROM submissions WHERE candidate_id = ? AND task_id = ?',
    [candidate_id, task_id]
  );
  if (existing.length > 0) {
    throw new AppError(`คุณส่งงาน Task ${task_id} ไปแล้ว`, 409);
  }

  // INSERT submission
  const [result] = await db.query(
    `INSERT INTO submissions (candidate_id, task_id, submission_url, submitted_at, status)
     VALUES (?, ?, ?, NOW(), 'pending')`,
    [candidate_id, task_id, submission_url]
  );

  res.status(201).json({
    success: true,
    message: 'ส่งงานสำเร็จ',
    data: {
      id: result.insertId,
      candidate_id,
      task_id,
      submission_url,
      status: 'pending',
    },
  });
  // ไม่มี try-catch เลย! asyncHandler จัดการให้ทั้งหมด
});

/**
 * PATCH /api/submissions/:id/score
 * judge ให้คะแนน
 */
const score = asyncHandler(async (req, res) => {
  const submissionId = parseInt(req.params.id);
  const { score: scoreValue, status } = req.body;

  if (isNaN(submissionId) || submissionId < 1) {
    throw new AppError('submission ID ไม่ถูกต้อง', 400);
  }

  const [rows] = await db.query('SELECT id, status FROM submissions WHERE id = ?', [submissionId]);
  if (rows.length === 0) {
    throw new AppError(`ไม่พบ Submission ID ${submissionId}`, 404);
  }

  if (rows[0].status === 'scored') {
    throw new AppError('Submission นี้ถูกให้คะแนนไปแล้ว', 409);
  }

  await db.query(
    'UPDATE submissions SET score = ?, status = ? WHERE id = ?',
    [scoreValue, status, submissionId]
  );

  res.json({
    success: true,
    message: 'ให้คะแนนสำเร็จ',
    data: { submission_id: submissionId, score: scoreValue, status },
  });
});

/**
 * GET /api/submissions/:id
 * ดู Submission (candidate เห็นเฉพาะของตัว, judge เห็นทั้งหมด)
 */
const getOne = asyncHandler(async (req, res) => {
  const submissionId = parseInt(req.params.id);

  const [rows] = await db.query(
    `SELECT s.*, u.name AS candidate_name, u.country,
            t.title AS task_title, t.max_score
     FROM submissions s
     JOIN users u ON s.candidate_id = u.id
     JOIN tasks t ON s.task_id = t.id
     WHERE s.id = ?`,
    [submissionId]
  );

  if (rows.length === 0) {
    throw new AppError(`ไม่พบ Submission ID ${submissionId}`, 404);
  }

  const submission = rows[0];

  // candidate เห็นเฉพาะของตัวเอง
  if (req.user.role === 'candidate' && submission.candidate_id !== req.user.id) {
    throw new AppError('คุณไม่มีสิทธิ์ดู Submission นี้', 403);
  }

  res.json({ success: true, data: submission });
});

module.exports = { create, score, getOne };
```

```js [index.js]
// index.js — แสดงตำแหน่งการวาง Error Handler และ 404 Handler

require('dotenv').config();
const express = require('express');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');

const app = express();
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/submissions', require('./routes/submissionRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));

// 404 Handler — ต้องอยู่หลัง Routes ทั้งหมด
// จะถูกเรียกเมื่อไม่มี Route ใดตรงกับ request
app.use((req, res, next) => {
  next(new AppError(`ไม่พบ Route ${req.originalUrl}`, 404));
});

// Global Error Handler — ต้องอยู่ล่างสุดของทุกอย่าง
// มี 4 parameters (err, req, res, next) = Express รู้จักเป็น Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`WSA2026 API running on port ${PORT}`));
```

:::

### ทดสอบ Error Handling

```bash
# 404 — Route ไม่มี
curl http://localhost:3000/api/nonexistent
# { "success": false, "message": "ไม่พบ Route /api/nonexistent", "statusCode": 404 }

# 403 — Candidate พยายามให้คะแนน
curl -X PATCH http://localhost:3000/api/submissions/1/score \
  -H "Authorization: Bearer <CANDIDATE_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"score":85,"status":"scored"}'
# { "success": false, "message": "เฉพาะ judge เท่านั้นที่มีสิทธิ์ใช้งาน", "statusCode": 403 }

# 404 — Submission ไม่มี
curl http://localhost:3000/api/submissions/9999 \
  -H "Authorization: Bearer <JUDGE_TOKEN>"
# { "success": false, "message": "ไม่พบ Submission ID 9999", "statusCode": 404 }

# 409 — ส่งงานซ้ำ
curl -X POST http://localhost:3000/api/submissions \
  -H "Authorization: Bearer <CANDIDATE_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"candidate_id":1,"task_id":1,"submission_url":"https://github.com/..."}'
# { "success": false, "message": "คุณส่งงาน Task 1 ไปแล้ว", "statusCode": 409 }
```

---

## 🎯 โจทย์ฝึกปฏิบัติเสริมความเข้าใจ (Mini Exercise)

- **โจทย์:** สร้าง Helper Functions ชื่อ `notFound(resource, id)` และ `forbidden(action)` ที่คืนค่า AppError พร้อม message ภาษาไทย เพื่อใช้ใน Controller โดยไม่ต้องเขียน `new AppError(...)` ทุกครั้ง เช่น `throw notFound('Submission', 42)` ควรสร้าง `AppError('ไม่พบ Submission ID 42', 404)` และ `throw forbidden('ให้คะแนน')` ควรสร้าง `AppError('คุณไม่มีสิทธิ์ให้คะแนน', 403)`

::: details 💡 คำใบ้ (Hint)
- สร้างไฟล์ `utils/errors.js` แล้ว export หลาย functions
- แต่ละ function รับ parameter แล้ว `return new AppError(message, statusCode)`
- เพิ่ม `unauthorized()` สำหรับ 401 ด้วย
- เพิ่มเป็น method ใน AppError class ก็ได้: `AppError.notFound(resource, id)`
:::

---

## 🔥 Challenge (โจทย์ท้าทาย!)

- **โจทย์:** เพิ่ม **Request Logger Middleware** ที่ทำงานร่วมกับ Error Handler โดย log ข้อมูลต่อไปนี้ลงไฟล์ `logs/requests.log` ในรูปแบบ JSON ทุก request ที่มีสถานะ 4xx หรือ 5xx:
  - timestamp, method, url, statusCode, message, responseTime (ms), ip
  - ถ้าเป็น 5xx error ให้ส่ง notification ออก console ด้วยสีแดงโดยใช้ ANSI escape codes (`\x1b[31m`)
  - Hint: ใช้ `res.on('finish', callback)` เพื่อดักจับหลัง response ถูกส่งออกไปแล้ว

---

## 🗣️ ทบทวน (Review)

::: details ❓ คำถามทบทวน

**คำถาม 1:** ทำไม Global Error Handler Middleware จึงต้องมี 4 parameters `(err, req, res, next)` แทนที่จะเป็น 3 `(req, res, next)` แบบ Middleware ทั่วไป?

**แนวคำตอบ:** Express ใช้จำนวน parameter เป็นตัวแยกว่า Middleware นั้นคือ "Error Handler" หรือไม่ ถ้ามี 4 parameters Express จะรู้ว่านี่คือ Error Handler และจะเรียกใช้เฉพาะเมื่อมีการเรียก `next(err)` หรือ `throw` จาก async Handler เท่านั้น

**คำถาม 2:** `isOperational: true` ใน AppError ใช้ทำอะไร และ Global Error Handler ใช้ค่านี้อย่างไร?

**แนวคำตอบ:** `isOperational: true` หมายความว่า error นี้คาดไว้แล้วและเกิดจาก user behavior (เช่น 404, 403) Global Error Handler ใช้ค่านี้เพื่อตัดสินใจว่าจะส่ง message จริงๆ กลับไปหรือไม่ ถ้า `isOperational = false` (คือ bug) ใน Production จะส่งแค่ "เกิดข้อผิดพลาด" แทนโดยไม่บอก detail

**คำถาม 3:** asyncHandler ทำงานอย่างไร และช่วยลดโค้ดซ้ำในระบบ TP2026 ได้อย่างไร?

**แนวคำตอบ:** asyncHandler เป็น Wrapper ที่รับ async function แล้วครอบด้วย `.catch(next)` อัตโนมัติ ทำให้ Controller ทุกตัวไม่ต้องเขียน try-catch เอง ถ้า error เกิดขึ้นจะถูกส่งไปยัง Global Error Handler ทันที ในระบบ TP2026 ที่มี Controller หลายสิบตัว ช่วยลด boilerplate code ได้มาก

:::
