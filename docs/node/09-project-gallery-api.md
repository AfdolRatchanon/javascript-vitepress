# 💻 Project 9: Screenshot Upload API

> 💡 **เป้าหมาย:** สร้าง REST API สำหรับรับอัปโหลดไฟล์ภาพหลักฐานการส่งงาน (Submission Screenshot) ในระบบ WSA2026 Test Submission Management System โดยใช้ Express + Multer + dotenv + cors และเข้าใจทั้ง Local Storage และ Cloud Storage Option

## 📖 ภาพรวมโปรเจกต์

ใน WSA2026 ผู้เข้าแข่งขัน (Candidate) ต้องส่งหลักฐานการทำงานพร้อมกับ URL ของงาน
API ในโปรเจกต์นี้จะทำหน้าที่รับไฟล์ Screenshot แล้วบันทึก URL ลงใน `submissions` table

```
SCREENSHOT UPLOAD API ARCHITECTURE
====================================

  [Candidate Client]
       │
       │  POST /api/uploads/screenshot
       │  multipart/form-data
       │  - screenshot: <file>
       │  - submission_id: 42
       │  Authorization: Bearer <JWT>
       │
       ▼
  ┌────────────────────────────────┐
  │         Express API            │
  │  ┌────────────────────────┐   │
  │  │   CORS Middleware       │   │
  │  └────────────┬───────────┘   │
  │               ▼               │
  │  ┌────────────────────────┐   │
  │  │   Auth Middleware       │   │
  │  │   (JWT verify +        │   │
  │  │    role: candidate)    │   │
  │  └────────────┬───────────┘   │
  │               ▼               │
  │  ┌────────────────────────┐   │
  │  │   Multer Middleware     │   │
  │  │   (jpg/png ≤ 5MB)      │   │
  │  └────────────┬───────────┘   │
  │               ▼               │
  │  ┌────────────────────────┐   │
  │  │   Upload Controller    │   │
  │  │   - ตรวจสอบสิทธิ์      │   │
  │  │   - บันทึกไฟล์         │   │
  │  │   - UPDATE submissions │   │
  │  └────────────┬───────────┘   │
  └───────────────┼───────────────┘
                  │
       ┌──────────▼──────────┐
       │   LOCAL: /uploads/  │  ← Option A (Development)
       │   OR                │
       │   CLOUD: AWS S3     │  ← Option B (Production)
       └─────────────────────┘
                  │
                  ▼
          ┌──────────────┐
          │  MySQL DB    │
          │  submissions │
          │  screenshot  │
          │  _url column │
          └──────────────┘
```

---

## 🗂️ โครงสร้างไฟล์

```
project-09-screenshot-api/
├── .env                      ← Environment variables
├── .gitignore
├── package.json
├── index.js                  ← Entry point
├── config/
│   └── db.js                 ← MySQL connection pool
├── middleware/
│   ├── auth.js               ← JWT authenticate + authorize
│   └── upload.js             ← Multer config (disk or memory)
├── controllers/
│   └── uploadController.js   ← Upload logic
├── routes/
│   └── uploadRoutes.js       ← Route definitions
└── uploads/                  ← Local storage folder (gitignored)
```

---

## ⏱️ เวลาที่แนะนำ

| ขั้นตอน | เวลาโดยประมาณ |
|:--------|:------------|
| Setup project + install | 10 นาที |
| Middleware (auth + multer) | 20 นาที |
| Controller + Route | 20 นาที |
| ทดสอบด้วย curl / Postman | 15 นาที |
| Challenge | 20 นาที |
| **รวม** | **~85 นาที** |

---

## 📝 ขั้นตอนการพัฒนา

### Step 1: สร้าง Project และติดตั้ง Dependencies

- [ ] สร้าง folder `project-09-screenshot-api` และ `cd` เข้าไป
- [ ] รัน `npm init -y`
- [ ] ติดตั้ง packages:

```bash
npm install express multer dotenv cors jsonwebtoken mysql2
npm install --save-dev nodemon
```

- [ ] เพิ่ม script ใน `package.json`:

```json
"scripts": {
  "dev": "nodemon index.js",
  "start": "node index.js"
}
```

- [ ] สร้างไฟล์ `.env`:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=wsa2026_db
JWT_SECRET=wsa2026-secret-key
BASE_URL=http://localhost:3000
```

- [ ] เพิ่ม `.gitignore`:

```
node_modules/
.env
uploads/
```

---

### Step 2: ตั้งค่า Database Connection (`config/db.js`)

- [ ] สร้างไฟล์ `config/db.js`:

::: code-group

```js [config/db.js]
// config/db.js
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
```

:::

- [ ] ตรวจสอบว่ามี column `screenshot_url` ใน `submissions` table:

```sql
ALTER TABLE submissions ADD COLUMN screenshot_url VARCHAR(500) NULL;
```

---

### Step 3: สร้าง Auth Middleware (`middleware/auth.js`)

- [ ] สร้างไฟล์ `middleware/auth.js`:

::: code-group

```js [middleware/auth.js]
// middleware/auth.js
// ตรวจสอบ JWT Token และสิทธิ์ role

const jwt = require('jsonwebtoken');

/**
 * authenticate — ตรวจสอบว่ามี JWT Token และ Valid
 * ผลคือ req.user จะมีข้อมูล { id, username, role }
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ success: false, message: 'กรุณา Login ก่อนใช้งาน' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, role, country }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
  }
}

/**
 * authorize — ตรวจสอบ role
 * @param {...string} roles - roles ที่อนุญาต เช่น 'candidate', 'judge'
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `เฉพาะ ${roles.join(', ')} เท่านั้นที่มีสิทธิ์ใช้งาน`,
      });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
```

:::

---

### Step 4: สร้าง Multer Middleware (`middleware/upload.js`)

- [ ] สร้างไฟล์ `middleware/upload.js`:

::: code-group

```js [middleware/upload.js]
// middleware/upload.js
// Multer config สำหรับรับ Screenshot
// Option A: diskStorage (Local) — เหมาะสำหรับ Development
// Option B: memoryStorage (Cloud) — เหมาะสำหรับ Production + S3

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// === OPTION A: Local Disk Storage ===
const uploadDir = path.join(__dirname, '..', 'uploads', 'screenshots');

// สร้างโฟลเดอร์ถ้ายังไม่มี
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // ตั้งชื่อตาม submission_id เพื่อง่ายต่อการค้นหา
    // ถ้ายังไม่มี submission_id ใช้ timestamp แทน
    const submissionId = req.body.submission_id || Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `submission_${submissionId}${ext}`);
  },
});

// === OPTION B: Memory Storage (สำหรับส่งต่อไปยัง Cloud) ===
// const memoryStorage = multer.memoryStorage();

// Filter: รับเฉพาะ JPG และ PNG
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('อนุญาตเฉพาะไฟล์ภาพ JPG และ PNG เท่านั้น'), false);
  }
};

// Export multer instance
// เปลี่ยน storage เป็น memoryStorage เพื่อใช้กับ S3
const upload = multer({
  storage: diskStorage,  // เปลี่ยนเป็น memoryStorage สำหรับ Cloud
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1,
  },
});

module.exports = upload;
```

:::

---

### Step 5: สร้าง Upload Controller (`controllers/uploadController.js`)

- [ ] สร้างไฟล์ `controllers/uploadController.js`:

::: code-group

```js [controllers/uploadController.js]
// controllers/uploadController.js
// Controller สำหรับจัดการการอัปโหลด Screenshot

const db = require('../config/db');
const path = require('path');

/**
 * POST /api/uploads/screenshot
 * รับ Screenshot หลักฐานการส่งงานและบันทึก URL ลง Database
 *
 * Form Fields:
 *   - screenshot: file (jpg/png ≤ 5MB)
 *   - submission_id: number
 *
 * Auth Required: candidate เท่านั้น
 */
async function uploadSubmissionScreenshot(req, res) {
  try {
    // 1. ตรวจสอบว่ามีไฟล์แนบมา
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาแนบไฟล์ Screenshot (field name: screenshot)',
      });
    }

    const { submission_id } = req.body;
    const candidateId = req.user.id;

    if (!submission_id) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ submission_id',
      });
    }

    // 2. ตรวจสอบว่า Submission มีอยู่และเป็นของ candidate คนนี้
    const [rows] = await db.query(
      'SELECT id, candidate_id, status FROM submissions WHERE id = ?',
      [submission_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `ไม่พบ Submission ID ${submission_id}`,
      });
    }

    if (rows[0].candidate_id !== candidateId) {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์แนบหลักฐานใน Submission นี้',
      });
    }

    // 3. สร้าง URL ของไฟล์
    // Option A: Local Disk — ใช้ Static File URL
    const screenshotUrl = `${process.env.BASE_URL}/uploads/screenshots/${req.file.filename}`;

    // Option B: Cloud (S3/Cloudinary)
    // const { uploadScreenshot } = require('../services/storageService');
    // const screenshotUrl = await uploadScreenshot(req.file.buffer, submission_id, req.file.mimetype);

    // 4. UPDATE submissions table
    await db.query(
      'UPDATE submissions SET screenshot_url = ? WHERE id = ?',
      [screenshotUrl, submission_id]
    );

    // 5. Response
    res.status(200).json({
      success: true,
      message: 'อัปโหลด Screenshot หลักฐานการส่งงานสำเร็จ',
      data: {
        submission_id: parseInt(submission_id),
        screenshot_url: screenshotUrl,
        original_filename: req.file.originalname,
        file_size_bytes: req.file.size,
      },
    });

  } catch (error) {
    console.error('[uploadController] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * GET /api/uploads/screenshot/:submissionId
 * ดูข้อมูล Screenshot ของ Submission ที่ระบุ
 */
async function getScreenshotInfo(req, res) {
  try {
    const { submissionId } = req.params;

    const [rows] = await db.query(
      `SELECT s.id, s.candidate_id, s.task_id, s.screenshot_url,
              u.name AS candidate_name, t.title AS task_title
       FROM submissions s
       JOIN users u ON s.candidate_id = u.id
       JOIN tasks t ON s.task_id = t.id
       WHERE s.id = ?`,
      [submissionId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบ Submission' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด' });
  }
}

module.exports = { uploadSubmissionScreenshot, getScreenshotInfo };
```

:::

---

### Step 6: สร้าง Routes (`routes/uploadRoutes.js`)

- [ ] สร้างไฟล์ `routes/uploadRoutes.js`:

::: code-group

```js [routes/uploadRoutes.js]
// routes/uploadRoutes.js

const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadSubmissionScreenshot, getScreenshotInfo } = require('../controllers/uploadController');

// POST /api/uploads/screenshot — candidate เท่านั้น
router.post(
  '/screenshot',
  authenticate,
  authorize('candidate'),
  upload.single('screenshot'),
  uploadSubmissionScreenshot
);

// GET /api/uploads/screenshot/:submissionId — candidate และ judge ดูได้
router.get(
  '/screenshot/:submissionId',
  authenticate,
  authorize('candidate', 'judge'),
  getScreenshotInfo
);

module.exports = router;
```

:::

---

### Step 7: สร้าง Entry Point (`index.js`)

- [ ] สร้างไฟล์ `index.js`:

::: code-group

```js [index.js]
// index.js — Entry point สำหรับ WSA2026 Screenshot Upload API

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Static files — ให้เข้าถึงไฟล์ใน uploads/ ผ่าน URL
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'WSA2026 Screenshot Upload API', version: '1.0.0' });
});

app.use('/api/uploads', uploadRoutes);

// Global Error Handler สำหรับ Multer Errors
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'ไฟล์ใหญ่เกินกว่า 5MB' });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`WSA2026 Upload API running on port ${PORT}`);
});
```

:::

---

## ✅ Expected Output

### สถานการณ์ที่ 1: อัปโหลดสำเร็จ

```bash
curl -X POST http://localhost:3000/api/uploads/screenshot \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "screenshot=@proof.jpg" \
  -F "submission_id=42"
```

```json
{
  "success": true,
  "message": "อัปโหลด Screenshot หลักฐานการส่งงานสำเร็จ",
  "data": {
    "submission_id": 42,
    "screenshot_url": "http://localhost:3000/uploads/screenshots/submission_42.jpg",
    "original_filename": "proof.jpg",
    "file_size_bytes": 184320
  }
}
```

### สถานการณ์ที่ 2: ไม่มี Token (401)

```bash
curl -X POST http://localhost:3000/api/uploads/screenshot \
  -F "screenshot=@proof.jpg" \
  -F "submission_id=42"
```

```json
{ "success": false, "message": "กรุณา Login ก่อนใช้งาน" }
```

### สถานการณ์ที่ 3: ไฟล์ผิดประเภท (400)

```bash
curl -X POST http://localhost:3000/api/uploads/screenshot \
  -H "Authorization: Bearer <TOKEN>" \
  -F "screenshot=@document.pdf" \
  -F "submission_id=42"
```

```json
{ "success": false, "message": "อนุญาตเฉพาะไฟล์ภาพ JPG และ PNG เท่านั้น" }
```

### สถานการณ์ที่ 4: ไฟล์ใหญ่เกิน 5MB (400)

```json
{ "success": false, "message": "ไฟล์ใหญ่เกินกว่า 5MB" }
```

### สถานการณ์ที่ 5: ไม่ใช่ Candidate (403)

```json
{
  "success": false,
  "message": "เฉพาะ candidate เท่านั้นที่มีสิทธิ์ใช้งาน"
}
```

---

## 🔥 Challenge

### Challenge A: Image Size Validation

เพิ่มการตรวจสอบขนาดรูปภาพ (Width × Height) ก่อนบันทึก โดยใช้ Library `sharp`:

```bash
npm install sharp
```

- รับเฉพาะรูปที่มีขนาดอย่างน้อย **640×480 pixels**
- ถ้าเล็กกว่านี้ให้ตอบ `400` พร้อมข้อความ "Screenshot ต้องมีขนาดอย่างน้อย 640x480 pixels"
- **Hint:** ใช้ `sharp(req.file.buffer).metadata()` เพื่อดึงข้อมูล width และ height

### Challenge B: Thumbnail Generation

เมื่ออัปโหลดสำเร็จ ให้สร้าง Thumbnail ขนาด 300×200 โดยอัตโนมัติ:

```bash
# ผลลัพธ์ที่ต้องการ:
uploads/
├── screenshots/
│   └── submission_42.jpg      ← ต้นฉบับ
└── thumbnails/
    └── submission_42.jpg      ← Thumbnail 300x200
```

Response ควรมี field `thumbnail_url` เพิ่มขึ้น

---

> 👉 **บทต่อไป: [Module 10.1: Input Validation with Joi](/node/10-01-input-validation)**
