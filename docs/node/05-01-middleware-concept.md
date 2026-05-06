# Middleware Concept 🛣️

> 💡 **เป้าหมาย:** เข้าใจกลไก Middleware Pipeline ของ Express.js และนำไปใช้งานในระบบ WSA2026 Test Submission Management System ได้อย่างถูกต้อง เพื่อจัดการ Request ที่เข้ามาก่อนถึง Controller เช่น การ Log, ตรวจสอบสิทธิ์, และ Validate ข้อมูล Submission

---

## 📖 ทฤษฎีและแนวคิด (Theory & Concepts)

### Middleware คืออะไร?

**Middleware** คือ `function(req, res, next)` — ฟังก์ชันที่คั่นอยู่กลางระหว่าง Request กับ Response
มันมีสิทธิ์เข้าถึง:
- `req` — ข้อมูลขาเข้า (Request Object)
- `res` — ข้อมูลขาออก (Response Object)
- `next` — ฟังก์ชันที่บอกว่า "ทำงานเสร็จแล้ว ส่งต่อได้เลย"

```javascript
function myMiddleware(req, res, next) {
    // ทำงานบางอย่าง
    next(); // ส่งต่อให้ Middleware ตัวถัดไป
}
```

ถ้าลืมเรียก `next()` — Request จะ **Hang** (Browser หมุนวน ไม่ได้รับ Response)
ถ้าเรียก `next(error)` — Express จะข้ามไปยัง **Error-handling Middleware** ทันที

---

### Middleware Pipeline (ท่อน้ำ)

```
Request เข้ามา
     │
     ▼
┌──────────────────────────────────────────────────────┐
│                  Express Pipeline                    │
│                                                      │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐   │
│  │ Middleware │──▶│ Middleware │──▶│ Middleware │   │
│  │     1      │   │     2      │   │     3      │   │
│  │  (Logger)  │   │  (Auth)    │   │ (Validate) │   │
│  └────────────┘   └────────────┘   └────────────┘   │
│         │                │                │          │
│       next()           next()           next()       │
│                                            │          │
│                                     ┌─────▼──────┐  │
│                                     │ Controller │  │
│                                     │  (Logic)   │  │
│                                     └─────┬──────┘  │
└───────────────────────────────────────────┼──────────┘
                                            │
                                     ┌──────▼──────┐
                                     │  Response   │
                                     └─────────────┘
```

**ลำดับสำคัญมาก!** Express จะรัน Middleware ตามลำดับบรรทัดที่เขียน `app.use()`

---

### ประเภทของ Middleware

**1. Built-in Middleware** — Express เตรียมมาให้:
| Middleware | หน้าที่ |
|:---|:---|
| `express.json()` | Parse JSON body จาก `Content-Type: application/json` |
| `express.urlencoded()` | Parse Form data |
| `express.static()` | เสิร์ฟไฟล์ Static (รูป, CSS, JS) |

**2. Third-party Middleware** — ติดตั้งผ่าน npm:
| Package | หน้าที่ |
|:---|:---|
| `morgan` | Log HTTP requests สวยงาม |
| `cors` | จัดการ Cross-Origin Resource Sharing |
| `helmet` | เพิ่ม Security Headers |
| `express-rate-limit` | จำกัดจำนวน Request ต่อวินาที |

**3. Custom Middleware** — เขียนเอง ตรงตามความต้องการของระบบ

**4. Error-handling Middleware** — มี **4 parameters** `(err, req, res, next)`:
```javascript
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});
```

---

### Order Matters! ลำดับทำให้พัง

```javascript
// ❌ ผิด: cors() อยู่หลัง Routes — CORS จะไม่ทำงาน!
app.use('/api/submissions', submissionRoutes); // Routes ก่อน
app.use(cors());                               // cors ทีหลัง — ไม่มีผล!

// ✅ ถูก: cors() ต้องมาก่อน Routes เสมอ
app.use(cors());
app.use(express.json());
app.use('/api/submissions', submissionRoutes);
app.use(errorHandler); // Error handler ต้องอยู่ล่างสุด
```

```javascript
// ❌ ผิด: requireAuth ไว้หลัง Route — ไม่ถูก protect เลย!
app.get('/api/tasks', getTasksHandler);   // Route นี้ไม่ได้ถูก protect
app.use(requireAuth);                     // Auth มาทีหลัง — ไม่มีผล!

// ✅ ถูก: requireAuth ต้องอยู่ก่อน Route ที่ต้องการ protect
app.use('/api/tasks', requireAuth, taskRoutes);
```

---

### Error-handling Middleware (4 Parameters)

Express จะรู้ว่าเป็น Error Handler เมื่อเห็น **4 parameters** พอดี:

```javascript
// Error Handler ต้องอยู่ล่างสุดของ app.js เสมอ
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    console.error(`[ERROR] ${req.method} ${req.path} — ${message}`);

    res.status(statusCode).json({
        success: false,
        error: message
    });
});
```

วิธีส่ง Error ไปยัง Error Handler:
```javascript
// ใน Middleware หรือ Controller ปกติ
next(new Error('Something went wrong'));

// หรือสร้าง Custom Error พร้อม statusCode
const err = new Error('Submission not found');
err.statusCode = 404;
next(err);
```

---

## 💻 ตัวอย่างโค้ด (Code Implementation)

Custom Middleware สำหรับ WSA2026 Test Submission Management System:

::: code-group

```js [middlewares/requestLogger.js]
/**
 * requestLogger — บันทึก Method และ URL ทุก Request
 * ใช้ใน: ทุก Request ที่เข้าสู่ระบบ TP2026
 */
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
    next(); // ส่งต่อให้ Middleware ถัดไปเสมอ
};

module.exports = requestLogger;
```

```js [middlewares/requireAuth.js]
/**
 * requireAuth — ตรวจสอบว่ามี x-user-id header ส่งมาหรือไม่
 * ใช้ใน: Route ที่ต้องการ authentication เช่น /api/submissions, /api/tasks
 */
const requireAuth = (req, res, next) => {
    const userId = req.headers['x-user-id'];

    if (!userId) {
        // ส่ง Error กลับทันที ไม่ต้องเรียก next()
        return res.status(401).json({
            success: false,
            error: 'Unauthorized: missing x-user-id header'
        });
    }

    // ฝาก userId ไว้ใน req เพื่อให้ Controller ใช้ต่อได้
    req.userId = userId;
    next();
};

module.exports = requireAuth;
```

```js [middlewares/validateSubmission.js]
/**
 * validateSubmission — ตรวจสอบว่า body มี submission_url หรือไม่
 * ใช้ใน: POST /api/submissions ก่อนบันทึก Submission ลงระบบ
 */
const validateSubmission = (req, res, next) => {
    const { submission_url } = req.body;

    if (!submission_url) {
        return res.status(400).json({
            success: false,
            error: 'Bad Request: submission_url is required'
        });
    }

    // ตรวจสอบรูปแบบ URL อย่างง่าย
    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(submission_url)) {
        return res.status(400).json({
            success: false,
            error: 'Bad Request: submission_url must be a valid URL (http:// or https://)'
        });
    }

    next(); // URL ถูกต้อง ส่งต่อให้ Controller
};

module.exports = validateSubmission;
```

```js [middlewares/errorHandler.js]
/**
 * errorHandler — Error-handling Middleware (4 params)
 * ต้องอยู่ล่างสุดของ app.js เสมอ
 */
const errorHandler = (err, req, res, next) => {
    // Log เพื่อ debug
    console.error(`[ERROR] ${err.stack}`);

    // กำหนด status code จาก Error หรือ default 500
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
};

module.exports = errorHandler;
```

```js [app.js]
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const requestLogger = require('./middlewares/requestLogger');
const requireAuth = require('./middlewares/requireAuth');
const validateSubmission = require('./middlewares/validateSubmission');
const errorHandler = require('./middlewares/errorHandler');

const submissionRoutes = require('./routes/submissionRoutes');

const app = express();

// ────────────────────────────────────────────────
// 1. Global Middleware (ทำงานกับทุก Request)
// ────────────────────────────────────────────────
app.use(cors());                 // CORS ก่อนสุด
app.use(express.json());         // Parse JSON body
app.use(morgan('dev'));           // HTTP logger (third-party)
app.use(requestLogger);          // Custom logger (TP2026)

// ────────────────────────────────────────────────
// 2. Routes (พร้อม Middleware เฉพาะ Route)
// ────────────────────────────────────────────────

// Route ที่ต้องการ Auth — requireAuth ทำงานก่อน Controller
app.use('/api/submissions', requireAuth, submissionRoutes);

// Route สาธารณะ — ไม่ต้องการ Auth
app.get('/health', (req, res) => {
    res.json({ status: 'ok', system: 'TP2026' });
});

// ────────────────────────────────────────────────
// 3. 404 Handler
// ────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: `Not found: ${req.originalUrl}` });
});

// ────────────────────────────────────────────────
// 4. Error Handler — ต้องอยู่ล่างสุดเสมอ!
// ────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
```

```js [routes/submissionRoutes.js]
const express = require('express');
const router = express.Router();
const validateSubmission = require('../middlewares/validateSubmission');

// Controller (placeholder)
const submissionController = require('../controllers/submissionController');

// GET /api/submissions — ดูรายการ submissions ทั้งหมด
router.get('/', submissionController.getAll);

// POST /api/submissions — ส่ง submission ใหม่ (validateSubmission ก่อน)
router.post('/', validateSubmission, submissionController.create);

// GET /api/submissions/:id — ดู submission เฉพาะชิ้น
router.get('/:id', submissionController.getById);

module.exports = router;
```

:::

ทดสอบ Middleware ด้วย cURL:
```bash
# ไม่มี x-user-id header -> 401 Unauthorized
curl -X GET http://localhost:3000/api/submissions

# มี x-user-id header -> ผ่าน requireAuth
curl -X GET http://localhost:3000/api/submissions \
  -H "x-user-id: candidate-001"

# POST ไม่มี submission_url -> 400 Bad Request
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -H "x-user-id: candidate-001" \
  -d '{"task_id": "task-01"}'

# POST มีครบ -> ผ่าน validateSubmission
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -H "x-user-id: candidate-001" \
  -d '{"task_id": "task-01", "submission_url": "https://github.com/user/repo"}'
```

---

## 🎯 โจทย์ฝึกปฏิบัติเสริมความเข้าใจ (Mini Exercise)

- **โจทย์:** สร้าง Middleware ชื่อ `ipWhitelist` ที่อนุญาตเฉพาะ IP ที่กำหนดไว้ใน Array เท่านั้น
  - ถ้า IP อยู่ใน whitelist → ส่งต่อด้วย `next()`
  - ถ้า IP ไม่อยู่ใน whitelist → ตอบกลับ `403 Forbidden` พร้อม message
  - Hint: ดึง IP ของ Client จาก `req.ip` หรือ `req.socket.remoteAddress`
  - กำหนดให้อนุญาต: `['127.0.0.1', '::1', '192.168.1.100']`

::: details 💡 คำใบ้ (Hint)

```javascript
// โครงสร้าง Middleware
const ipWhitelist = (req, res, next) => {
    const clientIp = req.ip || req.socket.remoteAddress;
    const allowed = ['127.0.0.1', '::1', '192.168.1.100'];

    // ตรวจสอบว่า clientIp อยู่ใน allowed หรือไม่
    // ถ้าใช่ → next()
    // ถ้าไม่ใช่ → res.status(403).json(...)
};
```

วิธีทดสอบ — เพิ่ม IP ที่ไม่อยู่ใน whitelist แล้วลอง request ดู:
```javascript
// ใช้งานใน app.js
app.use('/api/admin', ipWhitelist, adminRoutes);
```

:::

---

## 🔥 Challenge (โจทย์ท้าทาย!)

- **โจทย์:** สร้าง **Configurable Middleware Factory** ชื่อ `requireRole` ที่รับ role ที่อนุญาตเป็น Array แล้ว return Middleware

ตัวอย่างการใช้งาน:
```javascript
// อนุญาตเฉพาะ 'judge' และ 'manager' เท่านั้น
router.get('/scores', requireRole(['judge', 'manager']), getScoresHandler);

// อนุญาตเฉพาะ 'manager'
router.delete('/tasks/:id', requireRole(['manager']), deleteTaskHandler);
```

**Requirement:**
1. ตรวจสอบ `req.headers['x-user-role']`
2. ถ้าไม่มี header → 401 Unauthorized
3. ถ้า role ไม่อยู่ใน allowedRoles → 403 Forbidden
4. ถ้าผ่าน → บันทึก role ไว้ใน `req.userRole` แล้วเรียก `next()`
5. ต้องทำงานร่วมกับ `requireAuth` ได้ (ใช้พร้อมกันได้)

ทดสอบด้วย:
```bash
# role ไม่ตรง → 403
curl -H "x-user-id: u1" -H "x-user-role: candidate" \
  http://localhost:3000/api/scores

# role ตรง → ผ่าน
curl -H "x-user-id: u1" -H "x-user-role: judge" \
  http://localhost:3000/api/scores
```

---

## 🗣️ ทบทวน (Review)

::: details ❓ คำถามทบทวนความเข้าใจ

**คำถาม 1:** ถ้า Middleware ไม่เรียก `next()` และไม่ส่ง Response กลับ จะเกิดอะไรขึ้น?

**แนวคำตอบ:** Request จะ "Hang" — Browser จะแสดงการหมุน Loading ตลอดไปโดยไม่ได้รับ Response เพราะ Express รอการตัดสินใจจาก Middleware นั้นอยู่ ต้องเรียก `next()` หรือ `res.send()`/`res.json()` เสมอ

---

**คำถาม 2:** Error-handling Middleware ต่างจาก Middleware ปกติอย่างไร?

**แนวคำตอบ:** Error-handling Middleware มี **4 parameters** `(err, req, res, next)` ในขณะที่ Middleware ปกติมีเพียง 3 parameters `(req, res, next)` Express จะรู้ว่าเป็น Error Handler จาก signature นี้ และจะเรียกมันโดยอัตโนมัติเมื่อมีการเรียก `next(error)` หรือ `throw` ภายใน async handler

---

**คำถาม 3:** ทำไม `cors()` ต้องอยู่ก่อน Routes ทุกตัว?

**แนวคำตอบ:** เพราะ CORS Headers ต้องถูกเพิ่มลง Response ทุกครั้ง รวมถึง OPTIONS Preflight Request ด้วย ถ้าวาง `cors()` หลัง Routes Browser จะได้รับ Response โดยไม่มี `Access-Control-Allow-Origin` header และ JavaScript ฝั่ง Client จะอ่านข้อมูลไม่ได้

---

**คำถาม 4:** อะไรคือความแตกต่างระหว่าง `app.use(middleware)` กับ `app.use('/path', middleware)`?

**แนวคำตอบ:** `app.use(middleware)` จะทำงานกับ **ทุก Request** ที่เข้ามา (Global Middleware) ส่วน `app.use('/path', middleware)` จะทำงานเฉพาะ Request ที่ URL ขึ้นต้นด้วย `/path` เท่านั้น เหมาะสำหรับ Middleware เฉพาะกลุ่ม เช่น Auth เฉพาะ `/api/admin`

:::

---

> 👉 **บทต่อไป: [05-02 Layered Architecture](/node/05-02-layered-architecture)**
