# Module 8.3: Authentication & Authorization Middleware 🛡️

> 💡 **เป้าหมาย:** สร้าง middleware สองชั้นสำหรับ WSA2026 ได้แก่ `authenticate` (ตรวจสอบ JWT) และ `authorize(roles)` (ตรวจสอบสิทธิ์ตาม role) และเข้าใจ request flow ตั้งแต่ส่ง token จนถึง controller

## 📖 ทฤษฎีและแนวคิด (Theory & Concepts)

### Middleware คืออะไรในบริบท Auth?

ใน Express, middleware คือฟังก์ชันที่รับ `(req, res, next)` ทำงานแล้ว "ส่งต่อ" หรือ "ปฏิเสธ" request

**ใน WSA2026 เราใช้ middleware 2 ชั้น:**

```
 REQUEST FLOW ใน WSA2026
 ========================

  HTTP Request
  "PUT /api/submissions/5/score"
  Authorization: Bearer eyJ...
       |
       v
  +-------------------+
  |  authenticate     |  ชั้นที่ 1: ตรวจสอบ JWT
  |                   |
  |  - แกะ token      |
  |  - verify JWT     |
  |  - req.user = {   |  <-- แปะข้อมูล user ลง request
  |      userId: 42,  |
  |      role: 'judge'|
  |      country: ... |
  |    }              |
  +-------------------+
       |
       | next()  ถ้าผ่าน
       v
  +-------------------+
  |  authorize        |  ชั้นที่ 2: ตรวจสอบสิทธิ์
  |  ('judge')        |
  |                   |
  |  - เช็ค req.user.role|
  |  - 'judge' === ?  |
  |    allowedRoles   |
  +-------------------+
       |
       | next()  ถ้า role ตรง
       v
  +-------------------+
  |  Controller       |  ชั้นที่ 3: Business Logic
  |  scoreSubmission  |
  |                   |
  |  - update score   |
  |  - return result  |
  +-------------------+
       |
       v
  HTTP Response 200
```

---

### Error Cases ทั้ง 4 แบบ

```
 AUTHENTICATION ERRORS (ชั้น authenticate)
 ==========================================

  Case 1: ไม่มี token เลย
  GET /api/users
  (ไม่มี Authorization header)
  ----> HTTP 401 Unauthorized
        { "success": false, "message": "กรุณาเข้าสู่ระบบ" }

  Case 2: Token format ผิด
  Authorization: "eyJ..." (ขาด "Bearer ")
  ----> HTTP 401 Unauthorized
        { "success": false, "message": "รูปแบบ token ไม่ถูกต้อง" }

  Case 3: Token หมดอายุ
  Authorization: Bearer eyJ...(expired)
  ----> HTTP 401 Unauthorized
        { "success": false, "message": "Token หมดอายุ กรุณา login ใหม่" }

  Case 4: Token ถูกแก้ไข / secret ผิด
  Authorization: Bearer eyJ...(tampered)
  ----> HTTP 401 Unauthorized
        { "success": false, "message": "Token ไม่ถูกต้อง" }


 AUTHORIZATION ERROR (ชั้น authorize)
 =====================================

  Case 5: Role ไม่มีสิทธิ์
  candidate พยายาม PUT /api/submissions/5/score
  req.user.role = 'candidate'
  allowedRoles = ['judge']
  ----> HTTP 403 Forbidden
        { "success": false, "message": "สิทธิ์ไม่เพียงพอ role 'candidate' ไม่ได้รับอนุญาต" }

  401 = "ยังไม่ login / token ปัญหา" (Authentication failed)
  403 = "login แล้ว แต่ role ไม่พอ" (Authorization failed)
```

---

### RBAC ใน WSA2026: ใครทำอะไรได้บ้าง?

```
 ROLE-BASED ACCESS CONTROL — WSA2026
 =====================================

  ROUTE                              PUBLIC  CANDIDATE  JUDGE  MANAGER
  ---------------------------------  ------  ---------  -----  -------
  GET  /api/leaderboard              ✅      ✅         ✅     ✅
  POST /api/auth/register            ✅      ✅         ✅     ✅
  POST /api/auth/login               ✅      ✅         ✅     ✅
  GET  /api/auth/me                  ❌      ✅         ✅     ✅
  POST /api/submissions              ❌      ✅         ❌     ❌
  GET  /api/submissions              ❌      ✅ (own)   ✅     ✅
  PUT  /api/submissions/:id/score    ❌      ❌         ✅     ❌
  GET  /api/users                    ❌      ❌         ❌     ✅
  DELETE /api/users/:id              ❌      ❌         ❌     ✅

  ✅ = อนุญาต   ❌ = ไม่อนุญาต
```

---

### authenticate vs authorize: ต่างกันอย่างไร?

| | authenticate | authorize(roles) |
|:--|:-------------|:-----------------|
| **ถามว่า** | "คุณคือใคร?" | "คุณมีสิทธิ์ไหม?" |
| **ตรวจสอบ** | JWT signature + expiry | req.user.role vs allowedRoles |
| **ผิดพลาด** | 401 Unauthorized | 403 Forbidden |
| **ทำงานเมื่อ** | ทุก protected route | หลัง authenticate เสมอ |
| **แปะข้อมูล** | req.user = decoded JWT | ไม่แปะ แค่ gate-keep |

---

### Middleware Factory Pattern

`authorize` เป็น **factory function** — ฟังก์ชันที่สร้างและคืน middleware อีกฟังก์ชัน

```
 FACTORY PATTERN
 ================

  authorize(['judge', 'manager'])
        |
        v
  returns function(req, res, next) {
    // ตรวจ req.user.role
  }
        |
        v
  ใช้ใน route:
  router.put('/score', authenticate, authorize(['judge']), controller)
```

---

## 💻 ตัวอย่างโค้ด (Code Implementation)

### TP2026: Complete Auth Middleware Module

::: code-group
```js [middleware/auth.js]
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// ============================================================
// authenticate - ตรวจสอบ JWT token
// ใช้กับทุก protected route
// แปะ req.user = { userId, role, country, ... }
// ============================================================
function authenticate(req, res, next) {
  // 1. ดึง Authorization header
  const authHeader = req.headers['authorization'];

  // 2. ตรวจว่ามี header และขึ้นต้นด้วย "Bearer "
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'กรุณาเข้าสู่ระบบ (ไม่พบ Authorization header)'
    });
  }

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'รูปแบบ token ไม่ถูกต้อง ต้องเป็น "Bearer <token>"'
    });
  }

  // 3. แกะ token ออกจาก "Bearer <token>"
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'ไม่พบ token หลัง Bearer'
    });
  }

  // 4. verify token
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'wsa2026-system',
    });

    // 5. แปะข้อมูล user ลง req สำหรับ middleware/controller ถัดไป
    req.user = {
      userId:   decoded.userId,
      role:     decoded.role,
      country:  decoded.country,
      username: decoded.username,
    };

    next(); // ✅ ผ่านการยืนยันตัวตน

  } catch (err) {
    // จำแนก error type เพื่อ message ที่ชัดเจน
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token หมดอายุแล้ว กรุณา login ใหม่',
        code: 'TOKEN_EXPIRED'
      });
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Token ไม่ถูกต้อง',
        code: 'INVALID_TOKEN'
      });
    }
    // unexpected error
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบ token'
    });
  }
}

// ============================================================
// authorize - ตรวจสอบสิทธิ์ตาม role (Factory Function)
// ต้องเรียกหลัง authenticate เสมอ
//
// Usage:
//   router.post('/submissions', authenticate, authorize(['candidate']), controller)
//   router.put('/submissions/:id/score', authenticate, authorize(['judge']), controller)
//   router.get('/users', authenticate, authorize(['manager']), controller)
// ============================================================
function authorize(allowedRoles) {
  // allowedRoles = array เช่น ['judge'] หรือ ['manager', 'judge']
  return function (req, res, next) {
    // ต้องผ่าน authenticate ก่อน (req.user ต้องมีค่า)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'กรุณายืนยันตัวตนก่อน (authenticate middleware ขาดหาย)'
      });
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `สิทธิ์ไม่เพียงพอ role '${userRole}' ไม่ได้รับอนุญาต`,
        required: allowedRoles,
        yours: userRole
      });
    }

    next(); // ✅ role ตรงกับที่กำหนด
  };
}

module.exports = { authenticate, authorize };
```

```js [routes/submissions.js]
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const submissionsController = require('../controllers/submissionsController');

// ============================================================
// WSA2026 Submissions Routes
// ============================================================

// POST /api/submissions — candidates เท่านั้น
// ผู้เข้าแข่งขัน submit งานของตัวเอง
router.post(
  '/',
  authenticate,
  authorize(['candidate']),
  submissionsController.create
);

// GET /api/submissions — candidate (ดูของตัวเอง), judge/manager (ดูทั้งหมด)
router.get(
  '/',
  authenticate,
  authorize(['candidate', 'judge', 'manager']),
  submissionsController.getAll
);

// GET /api/submissions/:id — ดูรายละเอียด submission
router.get(
  '/:id',
  authenticate,
  authorize(['candidate', 'judge', 'manager']),
  submissionsController.getById
);

// PUT /api/submissions/:id/score — judges เท่านั้น (ให้คะแนน)
router.put(
  '/:id/score',
  authenticate,
  authorize(['judge']),
  submissionsController.score
);

module.exports = router;
```

```js [routes/users.js]
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const usersController = require('../controllers/usersController');

// ============================================================
// WSA2026 Users Routes
// ============================================================

// GET /api/users — managers เท่านั้น (ดูรายชื่อทุกคน)
router.get(
  '/',
  authenticate,
  authorize(['manager']),
  usersController.getAll
);

// DELETE /api/users/:id — managers เท่านั้น
router.delete(
  '/:id',
  authenticate,
  authorize(['manager']),
  usersController.remove
);

// GET /api/leaderboard — public ไม่ต้อง auth
router.get('/leaderboard', usersController.leaderboard);

module.exports = router;
```

```js [controllers/submissionsController.js]
const db = require('../db');

// ============================================================
// POST /api/submissions
// candidates submit งาน — req.user.userId มาจาก authenticate
// ============================================================
async function create(req, res) {
  try {
    const { task_id, submission_url } = req.body;
    const candidate_id = req.user.userId; // มาจาก JWT payload

    if (!task_id || !submission_url) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ task_id และ submission_url'
      });
    }

    // ตรวจว่า task มีอยู่จริง
    const [tasks] = await db.query(
      'SELECT id, title FROM tasks WHERE id = ?',
      [task_id]
    );
    if (tasks.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบ task นี้' });
    }

    // บันทึก submission
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
        status: 'pending'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ============================================================
// PUT /api/submissions/:id/score
// judges ให้คะแนน — req.user.role ตรวจแล้วโดย authorize
// ============================================================
async function score(req, res) {
  try {
    const { id } = req.params;
    const { score } = req.body;
    const judgeId = req.user.userId;

    if (score === undefined || score < 0 || score > 100) {
      return res.status(400).json({
        success: false,
        message: 'score ต้องเป็นตัวเลข 0-100'
      });
    }

    const [result] = await db.query(
      `UPDATE submissions
       SET score = ?, status = 'scored'
       WHERE id = ?`,
      [score, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบ submission นี้' });
    }

    res.json({
      success: true,
      message: `ให้คะแนน submission #${id} สำเร็จ`,
      data: { submissionId: id, score, scoredBy: judgeId }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getAll(req, res) {
  try {
    const { role, userId } = req.user;

    let query, params;

    if (role === 'candidate') {
      // candidates เห็นเฉพาะงานของตัวเอง
      query  = `SELECT s.*, u.name as candidate_name, t.title as task_title
                FROM submissions s
                JOIN users u ON s.candidate_id = u.id
                JOIN tasks t ON s.task_id = t.id
                WHERE s.candidate_id = ?
                ORDER BY s.submitted_at DESC`;
      params = [userId];
    } else {
      // judges/managers เห็นทั้งหมด
      query  = `SELECT s.*, u.name as candidate_name, u.country,
                       t.title as task_title
                FROM submissions s
                JOIN users u ON s.candidate_id = u.id
                JOIN tasks t ON s.task_id = t.id
                ORDER BY s.submitted_at DESC`;
      params = [];
    }

    const [rows] = await db.query(query, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getById(req, res) {
  const [rows] = await db.query(
    'SELECT * FROM submissions WHERE id = ?',
    [req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ success: false, message: 'ไม่พบ' });
  res.json({ success: true, data: rows[0] });
}

module.exports = { create, score, getAll, getById };
```
:::

---

### ตัวอย่าง Project Structure

```
wsa2026-api/
  middleware/
    auth.js          <- authenticate + authorize
  routes/
    auth.js          <- /api/auth/*
    submissions.js   <- /api/submissions/*
    users.js         <- /api/users/*
  controllers/
    authController.js
    submissionsController.js
    usersController.js
  services/
    auth.service.js  <- hashPassword, comparePassword
    jwt.service.js   <- generateToken, verifyToken
  db.js              <- mysql2 pool
  app.js             <- express setup
  .env
```

---

## 🎯 โจทย์ฝึกปฏิบัติเสริมความเข้าใจ (Mini Exercise)

- **โจทย์:** เพิ่ม middleware `authenticateOptional` สำหรับ route ที่ "ถ้ามี token ก็ดี แต่ถ้าไม่มีก็ยังเข้าได้"

**ตัวอย่าง use case ใน WSA2026:**
`GET /api/leaderboard` — ถ้าเป็น public ดูคะแนนรวมได้ แต่ถ้า login แล้วจะเห็นรายละเอียดเพิ่ม

ผลลัพธ์ที่ต้องการ:
- ถ้ามี token และ valid → `req.user = decoded`, ดำเนินการต่อ
- ถ้าไม่มี token หรือ token invalid → `req.user = null`, ดำเนินการต่อ (ไม่ error)

::: details 💡 คำใบ้ (Hint)
- ใช้ try-catch เหมือน authenticate แต่ใน catch ให้ `req.user = null` แล้ว `next()` แทนการ return error
- ใน controller ตรวจ `if (req.user)` เพื่อแสดงข้อมูลต่างกัน
:::

::: details ✅ เฉลย
```js
function authenticateOptional(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
  } catch (err) {
    // token ปัญหา แต่ไม่ reject request
    req.user = null;
  }

  next();
}

// ใช้ใน route:
// router.get('/leaderboard', authenticateOptional, (req, res) => {
//   if (req.user) {
//     // return ข้อมูล detailed
//   } else {
//     // return ข้อมูล public เท่านั้น
//   }
// });
```
:::

---

## 🔥 Challenge (โจทย์ท้าทาย!)

- **โจทย์:** สร้าง Ownership Middleware สำหรับ WSA2026

**Scenario:** candidate ควรแก้ไขได้เฉพาะ submission ของตัวเองเท่านั้น ไม่ใช่ของคนอื่น แม้จะ login แล้วก็ตาม

**ต้องทำ:**
1. สร้าง middleware `authorizeOwnerOrJudge` ที่รับ `req.params.id` (submission id)
2. ดึง submission จาก DB แล้วตรวจว่า `submission.candidate_id === req.user.userId`
3. ถ้าเป็น judge หรือ manager → ผ่านได้เสมอ
4. ถ้าเป็น candidate แต่ submission ไม่ใช่ของตัวเอง → HTTP 403

ใช้งาน: `router.put('/:id', authenticate, authorizeOwnerOrJudge, submissionsController.update)`

**Bonus:** ถ้า submission มี status = 'scored' แล้ว ห้าม candidate แก้ไขอีก (return 403 "งานถูกให้คะแนนแล้ว ไม่สามารถแก้ไขได้")

---

## 🗣️ ทบทวน (Review)

::: details ❓ คำถามทบทวนความเข้าใจ

**คำถาม 1:** HTTP 401 กับ 403 ต่างกันอย่างไร และ WSA2026 ใช้แต่ละอันเมื่อไหร่?

**แนวคำตอบ:** 401 Unauthorized หมายถึงยังไม่ยืนยันตัวตน เกิดเมื่อ: ไม่มี token, token หมดอายุ, token ผิด ระบบไม่รู้ว่าคุณเป็นใคร 403 Forbidden หมายถึงยืนยันตัวตนแล้วรู้ว่าคุณเป็นใคร แต่ role ไม่มีสิทธิ์ เช่น candidate พยายาม PUT /submissions/:id/score ซึ่งเป็นสิทธิ์ judge เท่านั้น

**คำถาม 2:** ทำไม `authorize` ถึงออกแบบเป็น factory function (`authorize(['judge'])`) แทนที่จะเขียน middleware ตรงๆ?

**แนวคำตอบ:** Factory function ทำให้ reusable กับหลาย role ได้ในไฟล์เดียว ถ้าเขียน middleware ตรงๆ ต้องสร้างฟังก์ชันแยกสำหรับทุก combination เช่น `judgeOnly`, `managerOnly`, `judgeOrManager` ซึ่งซ้ำซ้อน factory pattern คืน middleware function ที่มี allowedRoles ฝังอยู่ด้วย closure ทำให้ใช้ `authorize(['judge', 'manager'])` ได้ยืดหยุ่น

**คำถาม 3:** ทำไมต้อง `next()` ใน middleware และถ้าลืม `next()` จะเกิดอะไรขึ้น?

**แนวคำตอบ:** `next()` คือสัญญาณบอก Express ว่า "ทำงานเสร็จแล้ว ส่งต่อให้ middleware/handler ถัดไป" ถ้าลืม `next()` และไม่ได้ส่ง response (`res.json()`) request จะ hang ค้างอยู่เรื่อยๆ จนหมด timeout client รอค้างไม่ได้รับ response เลย ใน authenticate ถ้าผ่านทุกอย่างแล้วต้องเรียก `next()` เสมอ ถ้า error ต้อง `return res.status(401).json(...)` โดยไม่เรียก `next()`

:::

---

> 👉 **ไปต่อ: [Project 8: Auth System](/node/08-project-auth-system)**
