# Input Validation with Joi 🛡️

> 💡 **เป้าหมาย:** เข้าใจว่าทำไมการตรวจสอบข้อมูล (Input Validation) จึงสำคัญ และสามารถใช้ Library Joi เขียน Validation Schema สำหรับ API ของ WSA2026 Test Submission Management System ได้อย่างถูกต้อง

## 📖 ทฤษฎีและแนวคิด (Theory & Concepts)

### ทำไมต้องตรวจสอบ Input?

```
INPUT VALIDATION — ทำไมต้องทำ?
================================

  สถานการณ์ที่ 1: ไม่มี Validation
  ----------------------------------
  Client ส่ง:
    { "score": "abc", "submission_url": "not-a-url", "role": "admin" }
          │
          ▼ (ไม่มีด่านตรวจ)
  Controller รับไปแล้ว INSERT ลง Database
          │
          ▼
  MySQL Error / Data เสียหาย / Logic พัง
  ← แก้ยากมาก ไม่รู้ว่าข้อมูลผิดตั้งแต่เมื่อไหร่

  สถานการณ์ที่ 2: มี Validation
  --------------------------------
  Client ส่ง:
    { "score": "abc", "submission_url": "not-a-url", "role": "admin" }
          │
          ▼
  [Validation Middleware] ตรวจก่อน
          │
          ▼ Error ทันที!
  HTTP 400 {
    "errors": [
      "score ต้องเป็นตัวเลข 0-100",
      "submission_url ต้องเป็น URL ที่ถูกต้อง",
      "role ต้องเป็น candidate เท่านั้น"
    ]
  }
  ← ชัดเจน! Client แก้ได้ทันที
```

**เหตุผลหลักที่ต้อง Validate Input:**

1. **Security** — ป้องกัน SQL Injection, XSS, และ Malformed Data
2. **Data Integrity** — ข้อมูลในฐานข้อมูลถูกต้องและสอดคล้องกัน
3. **Clear Error Messages** — บอก Client ว่าผิดตรงไหน แก้ยังไง
4. **Business Logic Protection** — เช่น score ต้องอยู่ระหว่าง 0-100 เสมอ
5. **ลด Bug ใน Controller** — Controller ไม่ต้องตรวจซ้ำเพราะ Middleware ตรวจให้แล้ว

---

### Manual Validation vs Joi: ต่างกันอย่างไร?

```
MANUAL VALIDATION — น่าเบื่อและเกิด Bug ง่าย
=============================================

  function validateRegister(req, res, next) {
    const { username, password, name, role } = req.body;

    if (!username)
      return res.status(400).json({ message: 'username จำเป็น' });
    if (username.length < 3)
      return res.status(400).json({ message: 'username ≥ 3 ตัว' });
    if (username.length > 50)
      return res.status(400).json({ message: 'username ≤ 50 ตัว' });
    if (!password)
      return res.status(400).json({ message: 'password จำเป็น' });
    if (password.length < 8)
      return res.status(400).json({ message: 'password ≥ 8 ตัว' });
    if (!name)
      return res.status(400).json({ message: 'name จำเป็น' });
    if (role !== 'candidate')
      return res.status(400).json({ message: 'role ต้องเป็น candidate' });
    next();
  }
  // 20+ บรรทัดสำหรับแค่ 4 field!
  // ยิ่ง field เยอะ โค้ดยิ่งยาว
  // Error ทีละอัน (ไม่เห็น error ทั้งหมดพร้อมกัน)


JOI VALIDATION — กระชับ อ่านง่าย ทรงพลัง
==========================================

  const schema = Joi.object({
    username: Joi.string().min(3).max(50).required(),
    password: Joi.string().min(8).required(),
    name:     Joi.string().required(),
    role:     Joi.string().valid('candidate').required(),
  });
  // 5 บรรทัด ทำงานเหมือนกัน!
  // Error ทุกตัวพร้อมกัน (abortEarly: false)
  // อ่าน Schema แล้วรู้ทันทีว่า field นั้นต้องการอะไร
```

---

### ติดตั้ง Joi

```bash
npm install joi
```

---

### Joi Types และ Modifiers ที่ใช้บ่อย

```
JOI SCHEMA BUILDING BLOCKS
============================

  TYPES:
  Joi.string()     ← ต้องเป็น string
  Joi.number()     ← ต้องเป็น number
  Joi.boolean()    ← ต้องเป็น true/false
  Joi.array()      ← ต้องเป็น array
  Joi.object()     ← ต้องเป็น object

  MODIFIERS (ต่อท้าย type ได้เลย):
  .required()      ← ห้ามว่าง ต้องมี field นี้
  .optional()      ← ไม่มีก็ได้ (default ถ้าไม่ระบุ)
  .allow('')       ← อนุญาตให้เป็น string ว่างได้
  .min(n)          ← string: ความยาวขั้นต่ำ / number: ค่าขั้นต่ำ
  .max(n)          ← string: ความยาวสูงสุด / number: ค่าสูงสุด
  .email()         ← ต้องเป็น format email
  .uri()           ← ต้องเป็น URL ที่ถูกต้อง
  .valid('a','b')  ← ต้องเป็นค่าใดค่าหนึ่ง
  .integer()       ← ต้องเป็นจำนวนเต็ม (ใช้กับ number)
  .positive()      ← ต้องเป็นค่าบวก (ใช้กับ number)
  .precision(2)    ← ทศนิยมไม่เกิน 2 ตำแหน่ง
  .alphanum()      ← a-z, A-Z, 0-9 เท่านั้น

  CUSTOM MESSAGES (ข้อความภาษาไทย):
  .messages({
    'string.empty':    'กรุณากรอก {#label}',
    'string.min':      '{#label} ต้องมีอย่างน้อย {#limit} ตัวอักษร',
    'string.max':      '{#label} ต้องมีไม่เกิน {#limit} ตัวอักษร',
    'any.required':    '{#label} จำเป็นต้องกรอก',
    'any.only':        '{#label} ต้องเป็น {#valids}',
    'number.base':     '{#label} ต้องเป็นตัวเลข',
    'number.min':      '{#label} ต้องมีค่าอย่างน้อย {#limit}',
    'string.uri':      '{#label} ต้องเป็น URL ที่ถูกต้อง',
  })
  // {#label} = ชื่อ field, {#limit} = ค่า min/max, {#valids} = ค่าที่อนุญาต
```

---

### Validation Middleware Flow

```
REQUEST LIFECYCLE WITH VALIDATION
===================================

  [Client]
     │
     │  POST /api/auth/register
     │  Body: { username: "ab", password: "123", role: "judge" }
     │
     ▼
  ┌──────────────────────────────────────┐
  │  validate(registerSchema) Middleware  │
  │                                      │
  │  schema.validate(req.body, {         │
  │    abortEarly: false,                │
  │    stripUnknown: true               │
  │  })                                  │
  │      │                              │
  │      ├─ Valid? ─────────────────────┼──> next() ──> Controller
  │      │                              │              (มั่นใจได้ว่า
  │      └─ Invalid? ───────────────────┼──> res.status(400)
  │                                      │   ส่ง errors กลับทันที
  └──────────────────────────────────────┘

  SAMPLE ERROR RESPONSE (abortEarly: false):
  {
    "success": false,
    "message": "ข้อมูลที่ส่งมาไม่ถูกต้อง",
    "errors": [
      "username ต้องมีอย่างน้อย 3 ตัวอักษร",
      "password ต้องมีอย่างน้อย 8 ตัวอักษร",
      "ชื่อ-นามสกุลจำเป็นต้องกรอก",
      "role ต้องเป็น candidate เท่านั้น"
    ]
  }
```

---

### TP2026 Schemas ที่ต้องใช้

```
WSA2026 VALIDATION REQUIREMENTS
=================================

  users table:
  ┌──────────────┬────────────────────────────────────────┐
  │ Field        │ Rule                                   │
  ├──────────────┼────────────────────────────────────────┤
  │ username     │ string, alphanum, 3-50 chars, required │
  │ password     │ string, min 8 chars, required          │
  │ name         │ string, 2-100 chars, required          │
  │ role         │ only 'candidate' (สมัครผ่าน API ได้)  │
  │ country      │ string, optional, allow empty          │
  │ region       │ string, optional, allow empty          │
  └──────────────┴────────────────────────────────────────┘

  submissions table:
  ┌─────────────────┬────────────────────────────────────┐
  │ Field           │ Rule                               │
  ├─────────────────┼────────────────────────────────────┤
  │ candidate_id    │ number, integer, positive, required │
  │ task_id         │ number, integer, positive, required │
  │ submission_url  │ string, valid URI (http/https)     │
  └─────────────────┴────────────────────────────────────┘

  scoring (judge เท่านั้น):
  ┌─────────────────┬────────────────────────────────────┐
  │ Field           │ Rule                               │
  ├─────────────────┼────────────────────────────────────┤
  │ score           │ number, 0-100, precision 2 decimal │
  │ status          │ only 'scored'                      │
  └─────────────────┴────────────────────────────────────┘
```

---

## 💻 ตัวอย่างโค้ด (Code Implementation)

::: code-group

```js [validation/schemas.js]
// validation/schemas.js
// Joi Schemas ทั้งหมดสำหรับ WSA2026 Test Submission Management System

const Joi = require('joi');

// =============================================
// Schema 1: Register (สมัครสมาชิก)
// TP2026: ผู้ใช้สมัครได้เฉพาะ role 'candidate'
// judge / admin สร้างโดย admin ผ่านช่องทางอื่น
// =============================================
const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()        // a-z, A-Z, 0-9 เท่านั้น
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.empty':   'กรุณากรอก username',
      'string.alphanum':'username ต้องประกอบด้วยตัวอักษรและตัวเลขเท่านั้น',
      'string.min':     'username ต้องมีอย่างน้อย {#limit} ตัวอักษร',
      'string.max':     'username ต้องมีไม่เกิน {#limit} ตัวอักษร',
      'any.required':   'username จำเป็นต้องกรอก',
    }),

  password: Joi.string()
    .min(8)
    .max(100)
    .required()
    .messages({
      'string.empty': 'กรุณากรอก password',
      'string.min':   'password ต้องมีอย่างน้อย {#limit} ตัวอักษร',
      'any.required': 'password จำเป็นต้องกรอก',
    }),

  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'กรุณากรอกชื่อ-นามสกุล',
      'string.min':   'ชื่อ-นามสกุลต้องมีอย่างน้อย {#limit} ตัวอักษร',
      'any.required': 'ชื่อ-นามสกุลจำเป็นต้องกรอก',
    }),

  // TP2026: เปิดรับเฉพาะ candidate
  role: Joi.string()
    .valid('candidate')
    .required()
    .messages({
      'any.only':     'role ต้องเป็น candidate เท่านั้น',
      'any.required': 'กรุณาระบุ role',
    }),

  country: Joi.string().max(100).optional().allow(''),
  region:  Joi.string().max(100).optional().allow(''),
});

// =============================================
// Schema 2: Login
// =============================================
const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    'string.empty': 'กรุณากรอก username',
    'any.required': 'username จำเป็นต้องกรอก',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'กรุณากรอก password',
    'any.required': 'password จำเป็นต้องกรอก',
  }),
});

// =============================================
// Schema 3: Create Submission
// candidate ส่งงานพร้อม URL
// =============================================
const submissionSchema = Joi.object({
  candidate_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base':     'candidate_id ต้องเป็นตัวเลข',
      'number.integer':  'candidate_id ต้องเป็นจำนวนเต็ม',
      'number.positive': 'candidate_id ต้องเป็นค่าบวก',
      'any.required':    'กรุณาระบุ candidate_id',
    }),

  task_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base':     'task_id ต้องเป็นตัวเลข',
      'number.integer':  'task_id ต้องเป็นจำนวนเต็ม',
      'number.positive': 'task_id ต้องเป็นค่าบวก',
      'any.required':    'กรุณาระบุ task_id',
    }),

  submission_url: Joi.string()
    .uri({ scheme: ['http', 'https'] })  // ต้องขึ้นต้นด้วย http:// หรือ https://
    .required()
    .messages({
      'string.empty': 'กรุณากรอก submission_url',
      'string.uri':   'submission_url ต้องเป็น URL ที่ถูกต้อง (http:// หรือ https://)',
      'any.required': 'submission_url จำเป็นต้องกรอก',
    }),
});

// =============================================
// Schema 4: Score a Submission (judge เท่านั้น)
// TP2026: score เป็น decimal ได้ไม่เกิน 2 ตำแหน่ง
// =============================================
const scoreSchema = Joi.object({
  score: Joi.number()
    .min(0)
    .max(100)
    .precision(2)    // ทศนิยมได้ไม่เกิน 2 ตำแหน่ง เช่น 95.50
    .required()
    .messages({
      'number.base':  'score ต้องเป็นตัวเลข',
      'number.min':   'score ต้องมีค่าอย่างน้อย {#limit}',
      'number.max':   'score ต้องมีค่าไม่เกิน {#limit}',
      'any.required': 'กรุณาระบุ score',
    }),

  // TP2026: เมื่อ judge ให้คะแนนแล้ว status ต้องเป็น 'scored' เท่านั้น
  status: Joi.string()
    .valid('scored')
    .required()
    .messages({
      'any.only':     'status ต้องเป็น scored เท่านั้น',
      'any.required': 'กรุณาระบุ status',
    }),
});

// =============================================
// Schema 5: Create Task (admin เท่านั้น)
// =============================================
const taskSchema = Joi.object({
  title: Joi.string().min(5).max(200).required().messages({
    'string.empty': 'กรุณากรอกชื่อ Task',
    'string.min':   'ชื่อ Task ต้องมีอย่างน้อย {#limit} ตัวอักษร',
    'any.required': 'ชื่อ Task จำเป็นต้องกรอก',
  }),
  description:        Joi.string().max(1000).optional().allow(''),
  time_limit_minutes: Joi.number().integer().min(1).max(480).required().messages({
    'number.min': 'เวลาต้องไม่น้อยกว่า {#limit} นาที',
    'number.max': 'เวลาต้องไม่เกิน {#limit} นาที (8 ชั่วโมง)',
    'any.required': 'กรุณาระบุเวลาจำกัด',
  }),
  max_score: Joi.number().min(1).max(100).required().messages({
    'any.required': 'กรุณาระบุคะแนนเต็ม',
  }),
});

module.exports = { registerSchema, loginSchema, submissionSchema, scoreSchema, taskSchema };
```

```js [middleware/validate.js]
// middleware/validate.js
// Validation Middleware Factory — ใช้คู่กับ Joi Schemas
// รูปแบบ: validate(schema) คืนค่าเป็น Express Middleware

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source];

    const { error, value } = schema.validate(data, {
      abortEarly: false,   // รวบ error ทั้งหมด ไม่หยุดที่ error แรก
      stripUnknown: true,  // ลบ field ที่ไม่อยู่ใน schema ออก (Mass Assignment protection)
    });

    if (error) {
      const errorMessages = error.details.map((d) => d.message);
      return res.status(400).json({
        success: false,
        message: 'ข้อมูลที่ส่งมาไม่ถูกต้อง',
        errors: errorMessages,
      });
    }

    // แทนที่ req.body (หรือ source อื่น) ด้วย validated + stripped value
    req[source] = value;
    next();
  };
};

module.exports = validate;
```

```js [routes/authRoutes.js]
// routes/authRoutes.js
// ตัวอย่างการนำ validate() Middleware ไปใช้ใน TP2026

const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validation/schemas');
const authController = require('../controllers/authController');

// POST /api/auth/register
// validate(registerSchema) ตรวจก่อน ถ้าผ่านค่อยส่งต่อ controller
router.post('/register', validate(registerSchema), authController.register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), authController.login);

module.exports = router;
```

```js [routes/submissionRoutes.js]
// routes/submissionRoutes.js
// Routes สำหรับ Submission และ Scoring ใน TP2026

const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const { submissionSchema, scoreSchema } = require('../validation/schemas');
const { authenticate, authorize } = require('../middleware/auth');
const submissionController = require('../controllers/submissionController');

// POST /api/submissions — candidate สร้าง Submission
router.post(
  '/',
  authenticate,
  authorize('candidate'),
  validate(submissionSchema),
  submissionController.create
);

// PATCH /api/submissions/:id/score — judge ให้คะแนน
router.patch(
  '/:id/score',
  authenticate,
  authorize('judge'),
  validate(scoreSchema),
  submissionController.score
);

module.exports = router;
```

```js [controllers/authController.js]
// controllers/authController.js
// Controller ที่รับข้อมูลผ่าน validate() แล้ว
// req.body ที่นี่มั่นใจได้ว่าถูกต้อง 100% และ field แปลกปลอมถูกลบแล้ว

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

async function register(req, res) {
  try {
    // req.body ผ่าน validate(registerSchema) มาแล้ว
    // มั่นใจ: username 3-50 alphanum, password 8+, role = 'candidate'
    const { username, password, name, role, country, region } = req.body;

    // ตรวจว่า username ซ้ำหรือไม่
    const [existing] = await db.query(
      'SELECT id FROM users WHERE username = ?', [username]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'username นี้ถูกใช้งานแล้ว' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await db.query(
      'INSERT INTO users (username, password_hash, name, role, country, region) VALUES (?, ?, ?, ?, ?, ?)',
      [username, passwordHash, name, role, country || null, region || null]
    );

    res.status(201).json({
      success: true,
      message: 'ลงทะเบียนสำเร็จ',
      data: { id: result.insertId, username, name, role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;
    const [users] = await db.query(
      'SELECT id, username, password_hash, name, role, country FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0 || !(await bcrypt.compare(password, users[0].password_hash))) {
      return res.status(401).json({ success: false, message: 'username หรือ password ไม่ถูกต้อง' });
    }

    const user = users[0];
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, country: user.country },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      data: { token, user: { id: user.id, username: user.username, name: user.name, role: user.role } },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด' });
  }
}

module.exports = { register, login };
```

:::

### ทดสอบ Validation ด้วย curl

```bash
# ส่งข้อมูลที่ผิดหลาย field พร้อมกัน
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"ab","password":"123","role":"judge"}'

# Expected (400) — เห็น error ทุกตัวพร้อมกัน:
# {
#   "success": false,
#   "message": "ข้อมูลที่ส่งมาไม่ถูกต้อง",
#   "errors": [
#     "username ต้องมีอย่างน้อย 3 ตัวอักษร",
#     "password ต้องมีอย่างน้อย 8 ตัวอักษร",
#     "ชื่อ-นามสกุลจำเป็นต้องกรอก",
#     "role ต้องเป็น candidate เท่านั้น"
#   ]
# }

# ส่ง submission_url ที่ไม่ถูกต้อง
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"candidate_id":1,"task_id":1,"submission_url":"not-a-url"}'

# Expected (400):
# {
#   "success": false,
#   "message": "ข้อมูลที่ส่งมาไม่ถูกต้อง",
#   "errors": ["submission_url ต้องเป็น URL ที่ถูกต้อง (http:// หรือ https://)"]
# }

# ส่งข้อมูลถูกต้อง
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"candidate_id":1,"task_id":3,"submission_url":"https://github.com/candidate1/wsa2026-task3"}'

# Expected (201):
# { "success": true, "message": "ส่งงานสำเร็จ", "data": { "id": 42, ... } }
```

---

## 🎯 โจทย์ฝึกปฏิบัติเสริมความเข้าใจ (Mini Exercise)

- **โจทย์:** เขียน Joi Schema ชื่อ `updateProfileSchema` สำหรับ PATCH `/api/users/profile` ให้ทุก field เป็น optional แต่ต้องมีอย่างน้อย 1 field โดย field ที่อนุญาตได้แก่ `name` (string 2-100) และ `country` (string max 100) และ `region` (string max 100) หากไม่ส่ง field ใดเลยให้ตอบ error ว่า "กรุณาระบุข้อมูลที่ต้องการอัปเดตอย่างน้อย 1 รายการ"

::: details 💡 คำใบ้ (Hint)
- ทุก field ใช้ `.optional()`
- ใช้ `.min(1)` กับ `Joi.object({...})` เพื่อบังคับให้มีอย่างน้อย 1 field
- ตัวอย่าง: `const schema = Joi.object({ name: Joi.string()... }).min(1).messages({ 'object.min': 'กรุณาระบุ...' })`
- อย่าลืม `.allow('')` ถ้าต้องการให้ลบค่าได้
:::

---

## 🔥 Challenge (โจทย์ท้าทาย!)

- **โจทย์:** ปรับปรุง `validate` middleware ให้รองรับ Multi-Source Validation ในครั้งเดียว เช่น PATCH `/api/submissions/:id/score` ต้องการ validate ทั้ง `req.params` (id ต้องเป็น integer บวก) และ `req.body` (score + status) พร้อมกัน เขียนฟังก์ชัน `validateMultiple({ params: idSchema, body: scoreSchema })` แล้วรวม error ทั้งหมดจากทุก source มาส่งใน Response เดียว

---

## 🗣️ ทบทวน (Review)

::: details ❓ คำถามทบทวน

**คำถาม 1:** `abortEarly: false` ใน Joi options ทำงานอย่างไร และทำไมจึงควรใช้ใน API?

**แนวคำตอบ:** ค่า default คือ `true` ซึ่ง Joi จะหยุดตรวจทันทีที่พบ error แรก การตั้งเป็น `false` ทำให้ Joi ตรวจทุก field จนครบแล้วรวบ error ทั้งหมดมาส่งกลับพร้อมกัน ช่วยให้ผู้ใช้เห็น error ทุกตัวในครั้งเดียวแทนที่จะต้องแก้ทีละตัวแล้ว Submit ใหม่

**คำถาม 2:** `stripUnknown: true` ช่วยป้องกัน Security ปัญหาใด?

**แนวคำตอบ:** ป้องกัน Mass Assignment Attack โดยลบ field ที่ไม่ได้ระบุใน Schema ออกอัตโนมัติ เช่น ถ้า Client ส่ง `{ username, password, role: 'admin' }` มา แต่ `registerSchema` ไม่มี field `role` ที่เป็น 'admin' field นั้นจะถูกตัดออกก่อนถึง Controller

**คำถาม 3:** ใน TP2026 ทำไม `registerSchema` จึงกำหนด `role: Joi.string().valid('candidate')` เท่านั้น แทนที่จะรวม 'judge' และ 'admin' ด้วย?

**แนวคำตอบ:** เพราะใน WSA2026 ผู้ใช้ทั่วไปสมัครได้เฉพาะ role 'candidate' ผ่าน Public API การสร้าง judge หรือ admin ต้องผ่าน admin panel หรือ route แยกต่างหากที่มี authentication เพิ่มเติม การจำกัด role ใน Schema ป้องกันไม่ให้ใครยกระดับสิทธิ์ตัวเองผ่าน API ได้

:::
