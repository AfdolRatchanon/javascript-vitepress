# Module 9.1: File Upload with Multer 📤

> 💡 **เป้าหมาย:** เรียนรู้วิธีรับไฟล์ (รูปภาพ) จาก Client ด้วย Multer Middleware บน Express และเก็บลง Disk อย่างปลอดภัย
> ในบริบทของ WSA2026 ผู้เข้าแข่งขัน (Candidate) จะต้องอัปโหลดภาพหลักฐาน (Screenshot Proof) ของผลงานตัวเอง เข้าสู่ระบบ Test Submission Management System

---

## 📖 ทฤษฎีและแนวคิด (Theory & Concepts)

### multipart/form-data คืออะไร?

เวลา Browser ส่งข้อมูลธรรมดา (ข้อความ, ตัวเลข) ผ่าน Form มันจะส่งในรูปแบบ `application/x-www-form-urlencoded` ซึ่งเป็น Text ล้วน
แต่เวลาส่ง **ไฟล์** (Binary Data เช่น รูปภาพ, PDF) เราต้องใช้รูปแบบพิเศษที่ชื่อว่า **`multipart/form-data`** แทน

เหตุผลที่ชื่อ "multipart" เพราะข้อมูลถูกแบ่งออกเป็นหลาย **"ส่วน" (Part)** แต่ละส่วนมี Header และ Body ของตัวเอง คั่นด้วย **Boundary String**:

```
POST /api/uploads/screenshot HTTP/1.1
Content-Type: multipart/form-data; boundary=----Boundary7MA4YWx

------Boundary7MA4YWx
Content-Disposition: form-data; name="candidateId"

C001
------Boundary7MA4YWx
Content-Disposition: form-data; name="screenshot"; filename="proof.png"
Content-Type: image/png

<... Binary Data ของรูปภาพ ...>
------Boundary7MA4YWx--
```

**ปัญหา:** Express (Node.js) อ่าน `multipart/form-data` แบบปกติไม่ออกครับ! มันอ่านได้แค่ JSON หรือ Text
เราจึงต้องใช้ Middleware ชื่อว่า **Multer** เข้ามาช่วยแปลงข้อมูลส่วนนี้ให้เราใช้งานได้

### Flow การทำงานของ Multer

```
  CLIENT (Postman / Frontend)
         |
         |  POST multipart/form-data
         |  [candidateId=C001] [screenshot=proof.png (binary)]
         v
  +-----------------+
  |  Express Server |
  |                 |
  |  +----------+   |
  |  |  Multer  |   |  <-- Middleware อ่าน multipart/form-data
  |  | (Parser) |   |      แยกไฟล์ออกจาก Text Fields
  |  +----+-----+   |
  |       |         |
  |       | บันทึก  |
  |       v         |
  |  [uploads/screenshots/] <-- Disk Storage
  |  screenshot-1234567890.png
  |                 |
  |  req.file = {   |  <-- ส่งข้อมูลไฟล์ให้ Controller
  |    fieldname,   |
  |    originalname,|
  |    filename,    |
  |    path,        |
  |    size,        |
  |    mimetype     |
  |  }              |
  +-----------------+
         |
         v
  ตอบกลับ: { screenshotUrl: "/uploads/screenshots/..." }
```

---

### Storage Engine: diskStorage vs memoryStorage

Multer มี Storage Engine 2 แบบหลัก:

| Feature | diskStorage | memoryStorage |
|:--------|:------------|:--------------|
| **เก็บไว้ที่ไหน** | Harddisk (โฟลเดอร์ที่กำหนด) | RAM ของ Server |
| **req.file มีอะไร** | `path`, `filename`, `destination` | `buffer` (Buffer object) |
| **เหมาะกับ** | ใช้งานทั่วไป, ไฟล์ใหญ่ | ต้องการแปลงไฟล์ก่อนส่งต่อ (เช่น ส่งไป Cloud) |
| **ความเสี่ยง** | พื้นที่ Disk เต็ม | RAM เต็มถ้าไฟล์ใหญ่ |

> 💡 ในบทนี้จะใช้ `diskStorage` เพื่อบันทึกหลักฐานลงโฟลเดอร์ `uploads/screenshots/`
> ส่วน `memoryStorage` จะพูดถึงในบทถัดไป (Cloud Storage) เพราะต้องส่งไฟล์ต่อไปยัง S3/Cloudinary

---

## 💻 ตัวอย่างโค้ด (Code Implementation)

### Step 0: ติดตั้ง Multer

```bash
npm install multer
```

### Step 1: สร้าง Upload Middleware

::: code-group
```js [middleware/uploadMiddleware.js]
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// --- 1. กำหนดโฟลเดอร์ปลายทาง ---
// ตรวจสอบว่ามีโฟลเดอร์ uploads/screenshots/ หรือยัง ถ้าไม่มีให้สร้าง
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'screenshots');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// --- 2. กำหนด diskStorage ---
const storage = multer.diskStorage({
  // destination: บอกว่าจะเก็บไฟล์ไว้ที่โฟลเดอร์ไหน
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },

  // filename: กำหนดชื่อไฟล์ใหม่ (ต้องไม่ซ้ำกัน!)
  filename: function (req, file, cb) {
    // รูปแบบชื่อ: screenshot-<candidateId>-<timestamp><.นามสกุล>
    // เช่น: screenshot-C001-1718000000000.png
    const candidateId = req.body.candidateId || 'unknown';
    const timestamp   = Date.now();
    const ext         = path.extname(file.originalname).toLowerCase();
    cb(null, `screenshot-${candidateId}-${timestamp}${ext}`);
  }
});

// --- 3. กำหนด File Filter (อนุญาตเฉพาะรูปภาพ) ---
const fileFilter = function (req, file, cb) {
  // ตรวจสอบ MIME Type
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);  // ✅ อนุญาต
  } else {
    // ❌ ปฏิเสธ — ส่ง Error กลับ
    cb(new Error('อนุญาตเฉพาะไฟล์รูปภาพ (jpeg, png, gif) เท่านั้น'), false);
  }
};

// --- 4. สร้าง Multer Instance พร้อม Config ครบ ---
const upload = multer({
  storage:    storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // จำกัดขนาดไฟล์: 5 MB
    files:    1                // อนุญาตอัปโหลดได้ครั้งละ 1 ไฟล์
  }
});

module.exports = upload;
```
:::

### Step 2: สร้าง Route สำหรับรับ Screenshot

::: code-group
```js [routes/uploadRoutes.js]
const express = require('express');
const router  = express.Router();
const upload  = require('../middleware/uploadMiddleware');
const multer  = require('multer');

// POST /api/uploads/screenshot
// อัปโหลดภาพหลักฐานของ Submission
// Body (form-data): candidateId, submissionId, screenshot (file)
router.post('/screenshot', upload.single('screenshot'), (req, res) => {
  // ถ้าถึงตรงนี้ แปลว่า Multer ผ่านไฟล์มาให้แล้ว (ไม่ Error)
  if (!req.file) {
    return res.status(400).json({ error: 'กรุณาแนบไฟล์รูปภาพ' });
  }

  const { candidateId, submissionId } = req.body;

  if (!candidateId || !submissionId) {
    return res.status(400).json({ error: 'กรุณาระบุ candidateId และ submissionId' });
  }

  // สร้าง URL ที่ใช้เข้าถึงไฟล์ผ่าน HTTP
  const screenshotUrl = `/uploads/screenshots/${req.file.filename}`;

  // ข้อมูลไฟล์ที่ Multer เตรียมให้ใน req.file
  // {
  //   fieldname:    'screenshot',
  //   originalname: 'proof.png',
  //   encoding:     '7bit',
  //   mimetype:     'image/png',
  //   destination:  '.../uploads/screenshots',
  //   filename:     'screenshot-C001-1718000000000.png',
  //   path:         '.../uploads/screenshots/screenshot-C001-....png',
  //   size:         204800   (bytes)
  // }

  res.status(201).json({
    message:       'อัปโหลดหลักฐานสำเร็จ',
    candidateId,
    submissionId,
    screenshotUrl,
    originalName:  req.file.originalname,
    fileSize:      req.file.size,
    mimeType:      req.file.mimetype
  });
});

// POST /api/uploads/screenshots/multiple
// อัปโหลดได้หลายไฟล์พร้อมกัน (สูงสุด 5 ไฟล์)
router.post('/screenshots/multiple', upload.array('screenshots', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'กรุณาแนบไฟล์รูปภาพอย่างน้อย 1 ไฟล์' });
  }

  const fileList = req.files.map(file => ({
    originalName:  file.originalname,
    screenshotUrl: `/uploads/screenshots/${file.filename}`,
    fileSize:      file.size,
    mimeType:      file.mimetype
  }));

  res.status(201).json({
    message: `อัปโหลดสำเร็จ ${req.files.length} ไฟล์`,
    files:   fileList
  });
});

module.exports = router;
```
:::

### Step 3: Error Handling Middleware สำหรับ Multer

::: code-group
```js [middleware/multerErrorHandler.js]
const multer = require('multer');

// Middleware นี้ต้องใส่หลัง Route ที่ใช้ Multer
// และต้องมี Parameter 4 ตัว (err, req, res, next) เพื่อให้ Express รู้ว่านี่คือ Error Handler
function multerErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    // Error จาก Multer เอง
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          error: 'ขนาดไฟล์ใหญ่เกินไป (สูงสุด 5 MB)'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          error: 'อัปโหลดได้สูงสุด 5 ไฟล์ต่อครั้ง'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          error: `ชื่อ field ไม่ถูกต้อง: ${err.field}`
        });
      default:
        return res.status(400).json({ error: err.message });
    }
  }

  if (err) {
    // Error ที่เราโยนเองใน fileFilter (เช่น ประเภทไฟล์ผิด)
    return res.status(400).json({ error: err.message });
  }

  next();
}

module.exports = multerErrorHandler;
```
:::

### Step 4: ประกอบ app.js

::: code-group
```js [app.js]
const express            = require('express');
const path               = require('path');
const uploadRoutes       = require('./routes/uploadRoutes');
const multerErrorHandler = require('./middleware/multerErrorHandler');

const app = express();
app.use(express.json());

// เปิดโฟลเดอร์ uploads/ เป็น Static Files
// ทำให้เข้าถึงได้ผ่าน URL: http://localhost:3000/uploads/screenshots/filename.png
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/uploads', uploadRoutes);

// Error Handler ของ Multer (ต้องอยู่หลัง Routes เสมอ!)
app.use(multerErrorHandler);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```
:::

---

## 🧪 การทดสอบด้วย Postman

```
Method  : POST
URL     : http://localhost:3000/api/uploads/screenshot
Tab     : Body -> form-data

Key             | Type  | Value
----------------|-------|-------------------
candidateId     | Text  | C001
submissionId    | Text  | SUB-2026-001
screenshot      | File  | (เลือกไฟล์ .png/.jpg)
```

**Response สำเร็จ (201):**
```json
{
  "message": "อัปโหลดหลักฐานสำเร็จ",
  "candidateId": "C001",
  "submissionId": "SUB-2026-001",
  "screenshotUrl": "/uploads/screenshots/screenshot-C001-1718000000000.png",
  "originalName": "proof.png",
  "fileSize": 204800,
  "mimeType": "image/png"
}
```

**ทดสอบ Error Cases:**
- ลองอัปโหลดไฟล์ `.pdf` หรือ `.exe` -> ต้องได้ Error ประเภทไฟล์ผิด
- ลองอัปโหลดไฟล์ขนาดมากกว่า 5 MB -> ต้องได้ Error ขนาดเกิน
- ลองไม่แนบไฟล์เลย -> ต้องได้ Error กรุณาแนบไฟล์

---

## 🎯 โจทย์ฝึกปฏิบัติเสริมความเข้าใจ (Mini Exercise)

**โจทย์:** จงแก้ไข `fileFilter` ในไฟล์ `uploadMiddleware.js` ให้ตรวจสอบทั้ง **MIME Type** และ **นามสกุลไฟล์** (extension) ควบคู่กัน เพื่อป้องกันกรณีที่คนเปลี่ยนนามสกุลไฟล์หลอก (เช่น เอาไฟล์ `.exe` มาเปลี่ยนชื่อเป็น `.jpg`)

::: details 💡 คำใบ้ (Hint)
- ใช้ `path.extname(file.originalname).toLowerCase()` เพื่อดึงนามสกุล
- ใช้ Regex `/jpeg|jpg|png|gif/` ทดสอบทั้งนามสกุลและ MIME Type
- ต้องผ่านทั้งสองเงื่อนไขจึงจะอนุญาต (`extname && mimetype`)

```js
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extOk  = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowedTypes.test(file.mimetype);

  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error('อนุญาตเฉพาะ jpeg, jpg, png, gif เท่านั้น'), false);
  }
};
```
:::

---

## 🔥 Challenge (โจทย์ท้าทาย!)

**โจทย์:** ในระบบ TP2026 ผู้เข้าแข่งขันแต่ละคน (candidateId) ควรมีโฟลเดอร์ของตัวเองแยกกัน เช่น `uploads/screenshots/C001/`, `uploads/screenshots/C002/` เป็นต้น

จงแก้ไขฟังก์ชัน `destination` ใน `diskStorage` ให้สร้างโฟลเดอร์ตาม `candidateId` อัตโนมัติ และบันทึกไฟล์ในโฟลเดอร์นั้น

::: details 💡 คำใบ้ (Hint)
```js
destination: function (req, file, cb) {
  const candidateId  = req.body.candidateId || 'unknown';
  const candidateDir = path.join(__dirname, '..', 'uploads', 'screenshots', candidateId);

  // สร้างโฟลเดอร์ถ้ายังไม่มี (recursive: true = สร้าง nested ได้)
  if (!fs.existsSync(candidateDir)) {
    fs.mkdirSync(candidateDir, { recursive: true });
  }

  cb(null, candidateDir);
}
```
:::

---

## 🗣️ ทบทวน (Review)

::: details ❓ คำถามทบทวนความเข้าใจ

**คำถาม 1:** ทำไม Express ถึงอ่าน `multipart/form-data` ไม่ออกโดยตรง ทำไมต้องใช้ Multer?

**แนวคำตอบ:** เพราะ `express.json()` และ `express.urlencoded()` ออกแบบมารับแค่ Text-based body เท่านั้น ส่วน `multipart/form-data` เป็นรูปแบบ Binary ที่ซับซ้อนกว่า มีการแบ่ง Boundary และมี Binary Data ผสมอยู่ด้วย Multer คือ Middleware ที่รู้วิธีแยก (parse) รูปแบบนี้โดยเฉพาะ

**คำถาม 2:** ความแตกต่างของ `diskStorage` กับ `memoryStorage` คืออะไร และแต่ละแบบเหมาะกับงานแบบไหน?

**แนวคำตอบ:** `diskStorage` บันทึกไฟล์ลง Harddisk ทันที เหมาะกับไฟล์ขนาดใหญ่และงานที่ไม่ต้องแปลงไฟล์ก่อน ส่วน `memoryStorage` เก็บไฟล์ใน RAM เป็น Buffer object เหมาะกับงานที่ต้องส่งไฟล์ต่อทันทีเช่นส่งขึ้น Cloud Storage (S3/Cloudinary) เพราะไม่ต้องเขียนลง Disk ก่อน

**คำถาม 3:** ทำไมต้องมี `fileFilter` ทั้งที่ Client สามารถส่งแค่รูปภาพมาให้เองได้?

**แนวคำตอบ:** เพราะ Client สามารถแก้ Request ได้ตลอดเวลา (ผ่าน Postman, curl หรือ Script) ไม่ได้ถูกจำกัดด้วย Frontend เท่านั้น หากไม่มี `fileFilter` ฝั่ง Server Hacker อาจอัปโหลดไฟล์ `.php` หรือ `.exe` เข้ามาทำ Web Shell Attack หรืออัปโหลดไฟล์ขนาดยักษ์มา DoS Server ได้

**คำถาม 4:** `req.file` และ `req.files` ต่างกันอย่างไร?

**แนวคำตอบ:** `req.file` (ไม่มี s) ใช้กับ `upload.single()` รับไฟล์เดียว เป็น Object หนึ่งตัว ส่วน `req.files` (มี s) ใช้กับ `upload.array()` หรือ `upload.fields()` รับหลายไฟล์ เป็น Array ของ Object
:::

---

## 📚 Glossary

| คำศัพท์ | ความหมาย |
|:--------|:---------|
| **multipart/form-data** | รูปแบบการส่ง HTTP Request สำหรับไฟล์และ Binary Data (แต่ละส่วนคั่นด้วย Boundary) |
| **Multer** | Node.js Middleware ที่ parse `multipart/form-data` และส่ง `req.file` / `req.files` ให้เรา |
| **diskStorage** | Storage Engine ของ Multer ที่บันทึกไฟล์ลง Harddisk โดยตรง |
| **memoryStorage** | Storage Engine ของ Multer ที่เก็บไฟล์ใน RAM เป็น `Buffer` ชั่วคราว |
| **fileFilter** | ฟังก์ชันตรวจสอบประเภทไฟล์ก่อนอนุญาตให้อัปโหลด |
| **MIME Type** | ชนิดของไฟล์ที่ Browser/Client ประกาศมา เช่น `image/jpeg`, `application/pdf` |
| **req.file** | Object ข้อมูลไฟล์ที่ Multer เตรียมให้ใช้กับ `upload.single()` |
| **req.files** | Array ของ Object ข้อมูลไฟล์ ใช้กับ `upload.array()` |
| **Static Files** | ไฟล์ที่ไม่เปลี่ยนแปลง (รูป, CSS) ที่ต้องเปิดสิทธิ์ด้วย `express.static()` |
| **MulterError** | Class Error ของ Multer ที่ต้องตรวจสอบใน Error Handler (`instanceof multer.MulterError`) |

---

## 🔗 References

- [Multer — GitHub](https://github.com/expressjs/multer)
- [MDN: input type="file"](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file)
- [Express Static Files](https://expressjs.com/en/starter/static-files.html)

> 👉 **ไปต่อ: [Cloud Storage Integration](/node/09-02-cloud-storage)**
