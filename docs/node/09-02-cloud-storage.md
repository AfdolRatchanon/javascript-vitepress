# Cloud Storage (AWS S3 / Cloudinary) ☁️

> 💡 **เป้าหมาย:** เข้าใจหลักการจัดเก็บไฟล์บน Cloud Storage แทนการเก็บบน Local Disk และสามารถใช้ AWS S3 หรือ Cloudinary เพื่ออัปโหลดไฟล์หลักฐานการส่งงาน (Submission Screenshot) ใน WSA2026 Test Submission Management System ได้จริง

## 📖 ทฤษฎีและแนวคิด (Theory & Concepts)

### ทำไมต้องใช้ Cloud Storage?

ลองนึกภาพระบบ WSA2026 ที่มีผู้เข้าแข่งขันหลายร้อยคนจากทั่วโลกส่งหลักฐานรูปภาพเข้ามาพร้อมกัน
ถ้าเก็บไฟล์ไว้ใน Local Disk ของ Server จะเกิดปัญหาดังนี้:

```
LOCAL DISK — ปัญหาที่พบบ่อย
==============================

  [Candidate TH] ──┐
  [Candidate JP] ──┤──> [Server /uploads/]   ← ดิสก์เต็ม!
  [Candidate SG] ──┤      ├── img_001.jpg      ← Server ล่ม = ไฟล์หาย
  [Candidate AU] ──┘      ├── img_002.jpg      ← Scale หลาย Server ไม่ได้
                           └── ... (1000+ files)  ← ไม่มี CDN, โหลดช้า
```

**ปัญหาหลักของ Local Disk:**
- **ดิสก์เต็ม** — พื้นที่มีจำกัด เมื่อไฟล์สะสมมากขึ้นก็หมด
- **Single Point of Failure** — Server ล่มหรือย้าย ไฟล์หายหมด
- **Scale ลำบาก** — ถ้าต้องการ Server หลายตัว (Load Balancer) ไฟล์จะอยู่แค่ตัวเดียว
- **ไม่มี CDN** — ผู้ใช้ต่างประเทศโหลดรูปช้า เพราะ Server อยู่ที่เดียว
- **Backup ยาก** — ต้องทำ Backup เองทุกขั้นตอน

---

### Cloud Storage แก้ปัญหาอย่างไร?

```
CLOUD STORAGE ARCHITECTURE
===========================

  [Candidate TH] ──┐
  [Candidate JP] ──┤──> [Node.js API]
  [Candidate SG] ──┤         │
  [Candidate AU] ──┘         │  Upload Buffer
                             ▼
                   ┌──────────────────────────────┐
                   │         AWS S3               │
                   │  Bucket: wsa2026-submissions  │
                   │  ├── screenshots/             │
                   │  │     ├── 001.jpg            │
                   │  │     ├── 002.jpg            │
                   │  │     └── ... (unlimited)    │
                   │  └── reports/                 │
                   └──────────────┬───────────────┘
                                  │  CDN Distribution
                         ┌────────▼────────┐
                         │  CDN Edge Nodes  │
                         │  🌏 Asia         │
                         │  🌍 Europe       │
                         │  🌎 Americas     │
                         └────────┬────────┘
                                  │
                   Return CDN URL ──> https://cdn.wsa2026.s3.amazonaws.com/
                                      screenshots/001.jpg
```

**ข้อดีของ Cloud Storage:**
- **Unlimited Space** — เก็บได้ไม่จำกัด จ่ายตามที่ใช้จริง
- **Durability สูง** — AWS S3 รับประกัน 99.999999999% (11 nines) ไฟล์ไม่หาย
- **CDN ในตัว** — ไฟล์กระจายทั่วโลก โหลดเร็วจากทุกประเทศ
- **Scalable** — รองรับการอัปโหลดพร้อมกันหลายพัน Request
- **Managed Backup** — Provider จัดการ Backup และ Replication ให้อัตโนมัติ

---

### AWS S3 Concepts

**S3** ย่อมาจาก **Simple Storage Service** เป็น Object Storage ของ Amazon Web Services

```
AWS S3 STRUCTURE
=================

  AWS Account
  └── S3 Service
      └── Bucket  (wsa2026-submissions)   ← เหมือน "Root Folder"
          ├── Object  Key: screenshots/42.jpg
          │           Body: <binary data>
          │           ContentType: image/jpeg
          │           Metadata: { submissionId: "42" }
          │
          ├── Object  Key: screenshots/43.jpg
          └── Object  Key: reports/summary.pdf

  KEY   = "path" ของไฟล์ใน Bucket  (ไม่มีโฟลเดอร์จริงๆ เป็นแค่ชื่อ)
  OBJECT = ไฟล์แต่ละชิ้นพร้อม Metadata
  BUCKET = Container หลัก (1 Account มีได้หลาย Bucket)
```

**Concepts สำคัญ:**

| คำศัพท์ | ความหมาย | ตัวอย่าง TP2026 |
|:--------|:---------|:--------------|
| **Bucket** | Container หลักสำหรับเก็บไฟล์ | `wsa2026-submissions` |
| **Object** | ไฟล์แต่ละชิ้น | `screenshots/42.jpg` |
| **Key** | "ชื่อ/Path" ของ Object ใน Bucket | `screenshots/{submissionId}.jpg` |
| **Region** | ที่ตั้ง Data Center | `ap-southeast-1` (Singapore) |
| **ACL** | สิทธิ์การเข้าถึง | `private` หรือ `public-read` |
| **Presigned URL** | URL ชั่วคราวสำหรับอัปโหลด/ดาวน์โหลด | มีอายุ 15 นาที |

---

### S3 Upload Flow: Buffer → PutObjectCommand → CDN URL

```
S3 UPLOAD FLOW
==============

  Step 1: Client ส่ง multipart/form-data
          [Browser/curl] ──POST screenshot + submission_id──> [Express API]

  Step 2: Multer รับไฟล์ไว้ใน RAM (memoryStorage)
          [Express Middleware] ──req.file.buffer──> [Controller]

  Step 3: สร้าง PutObjectCommand
          const cmd = new PutObjectCommand({
            Bucket: 'wsa2026-submissions',
            Key:    'screenshots/42.jpg',    ← TP2026 path spec
            Body:   req.file.buffer,
            ContentType: 'image/jpeg'
          });

  Step 4: ส่ง Command ไปยัง S3
          await s3Client.send(cmd);

  Step 5: สร้าง CDN URL แล้ว UPDATE submissions table
          'https://wsa2026-submissions.s3.ap-southeast-1.amazonaws.com/screenshots/42.jpg'
```

---

### Presigned URLs คืออะไร?

โดยปกติไฟล์ต้องส่งผ่าน Node.js Server แต่ Presigned URL ช่วยให้ Client อัปโหลดตรงไปยัง S3 ได้:

```
NORMAL UPLOAD (ผ่าน Server)
============================

  [Client] ──(ไฟล์ 10MB)──> [Node.js] ──(ส่งต่อ)──> [S3]
                              ↑
                    Server ต้องแบก Buffer 10MB
                    เปลือง RAM และ Bandwidth!


PRESIGNED URL UPLOAD (ตรงจาก Client ไป S3)
============================================

  [Client] ──1. ขอ URL──> [Node.js API]
  [Client] <──2. Presigned URL──  [Server]
  [Client] ──3. PUT ไฟล์ตรง──────────────────> [AWS S3]
                                                ↑
                                      Server ไม่ต้องแบก load!
                                      รับแค่ Request เล็กๆ ก็พอ
```

---

### Local Disk vs Cloud: Flow เปรียบเทียบแบบเห็นภาพ

```
LOCAL DISK UPLOAD
=================
  POST /api/uploads/screenshot
         │
         ▼
  [multer diskStorage]
         │  เขียนไฟล์ลง Disk ของ Server
         ▼
  /uploads/screenshot-42.jpg    ← อยู่บน Server นี้เท่านั้น!
         │
         ▼
  UPDATE submissions
  SET screenshot_url = 'http://localhost:3000/uploads/screenshot-42.jpg'
         │
  ปัญหา: URL ใช้ได้เฉพาะ Server นี้ Server ล่ม = ไฟล์หาย


CLOUD STORAGE UPLOAD (S3)
==========================
  POST /api/uploads/screenshot
         │
         ▼
  [multer memoryStorage]   ← ไม่แตะ Disk เลย!
         │  req.file.buffer (อยู่ใน RAM)
         ▼
  [PutObjectCommand → AWS S3]
         │  ไฟล์ถูกส่งตรงไปยัง Cloud
         ▼
  wsa2026-submissions/screenshots/42.jpg  ← อยู่บน Cloud
         │
         ▼
  UPDATE submissions
  SET screenshot_url = 'https://cdn.wsa2026.s3.amazonaws.com/screenshots/42.jpg'
         │
  ดี: URL ใช้ได้ทั่วโลก + CDN + ไม่หายแม้ Server ล่ม!
```

---

### Cloudinary: ทางเลือกที่ง่ายกว่า

**Cloudinary** คือ Cloud Storage ที่ออกแบบมาเพื่อรูปภาพโดยเฉพาะ มี Feature พิเศษคือ **On-the-fly Image Transformation** ผ่าน URL:

```
CLOUDINARY URL TRANSFORMATION
==============================

  ต้นฉบับ:
  https://res.cloudinary.com/wsa2026/image/upload/screenshots/42.jpg

  Resize 300x200:
  https://res.cloudinary.com/wsa2026/image/upload/w_300,h_200/screenshots/42.jpg

  Thumbnail crop:
  https://res.cloudinary.com/wsa2026/image/upload/w_100,h_100,c_fill/screenshots/42.jpg

  แปลงเป็น WebP อัตโนมัติ:
  https://res.cloudinary.com/wsa2026/image/upload/f_webp/screenshots/42.jpg

  ไม่ต้องเขียนโค้ด resize เพิ่มเลย! แค่แก้ URL ก็พอ
```

**เปรียบเทียบ S3 กับ Cloudinary:**

| Feature | AWS S3 | Cloudinary |
|:--------|:-------|:-----------|
| ความยืดหยุ่น | สูงมาก | ปานกลาง |
| Image Transform | ต้องทำเอง (sharp) | มีในตัว ผ่าน URL |
| ราคา | จ่ายตามใช้ | Free Tier 25GB |
| ความซับซ้อน Setup | ปานกลาง | ต่ำ |
| เหมาะสำหรับ | Production Enterprise | Rapid Development |

---

## 💻 ตัวอย่างโค้ด (Code Implementation)

### ติดตั้ง Dependencies

```bash
# AWS S3 SDK (v3 — modular, ขนาดเล็กกว่า v2)
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner multer dotenv
```

### Environment Variables (`.env`)

```env
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=ap-southeast-1
S3_BUCKET_NAME=wsa2026-submissions
S3_BASE_URL=https://wsa2026-submissions.s3.ap-southeast-1.amazonaws.com
```

::: code-group

```js [config/s3.js]
// config/s3.js
// ตั้งค่า AWS S3 Client สำหรับ WSA2026 Submission Management System

const { S3Client } = require('@aws-sdk/client-s3');

// สร้าง S3 Client จาก Environment Variables
// Credentials จะถูกอ่านจาก env อัตโนมัติ ไม่ต้อง hardcode
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// TP2026 constants
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'wsa2026-submissions';
const SCREENSHOT_PREFIX = 'screenshots'; // path: screenshots/{submissionId}.jpg

module.exports = { s3Client, BUCKET_NAME, SCREENSHOT_PREFIX };
```

```js [services/storageService.js]
// services/storageService.js
// Service Layer สำหรับจัดการ Cloud Storage ใน TP2026

const {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client, BUCKET_NAME, SCREENSHOT_PREFIX } = require('../config/s3');

/**
 * อัปโหลด Screenshot หลักฐานการส่งงานไปยัง S3
 * TP2026 path spec: wsa2026-submissions/screenshots/{submissionId}.jpg
 *
 * @param {Buffer} fileBuffer   - ข้อมูลไฟล์จาก multer memoryStorage
 * @param {number} submissionId - ID ของ Submission ใน TP2026
 * @param {string} mimeType     - เช่น 'image/jpeg' หรือ 'image/png'
 * @returns {Promise<string>}   - CDN URL ของไฟล์
 */
async function uploadScreenshot(fileBuffer, submissionId, mimeType) {
  const extension = mimeType === 'image/png' ? 'png' : 'jpg';

  // Key = path ของไฟล์ใน Bucket ตาม TP2026 spec
  const key = `${SCREENSHOT_PREFIX}/${submissionId}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileBuffer,        // Buffer จาก multer memoryStorage
    ContentType: mimeType,
    Metadata: {
      submissionId: String(submissionId),
      uploadedAt: new Date().toISOString(),
      system: 'wsa2026-submission-mgmt',
    },
  });

  await s3Client.send(command);

  // สร้าง Public URL (ใช้ได้เมื่อ Bucket Policy เป็น public-read)
  const cdnUrl = `${process.env.S3_BASE_URL}/${key}`;
  return cdnUrl;
}

/**
 * สร้าง Presigned URL ให้ Client อัปโหลดตรงไปยัง S3
 * Server ไม่ต้องรับ Buffer ขนาดใหญ่เลย!
 *
 * @param {number} submissionId
 * @param {string} mimeType
 * @param {number} expiresIn  - อายุ URL (วินาที) default 900 = 15 นาที
 * @returns {Promise<{uploadUrl, fileKey, expiresIn}>}
 */
async function generatePresignedUploadUrl(submissionId, mimeType, expiresIn = 900) {
  const extension = mimeType === 'image/png' ? 'png' : 'jpg';
  const key = `${SCREENSHOT_PREFIX}/${submissionId}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: mimeType,
  });

  // getSignedUrl สร้าง URL พร้อม Signature ที่หมดอายุตาม expiresIn
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });

  return { uploadUrl, fileKey: key, expiresIn };
}

/**
 * ดึง Presigned URL สำหรับดาวน์โหลด (ใช้เมื่อ Bucket เป็น private)
 *
 * @param {string} fileKey   - Key ของไฟล์ใน S3
 * @param {number} expiresIn - อายุ URL (วินาที)
 * @returns {Promise<string>}
 */
async function generatePresignedDownloadUrl(fileKey, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
  });
  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * ลบ Screenshot ออกจาก S3 (เมื่อ Submission ถูกยกเลิก)
 *
 * @param {number} submissionId
 * @param {string} extension - 'jpg' หรือ 'png'
 */
async function deleteScreenshot(submissionId, extension = 'jpg') {
  const key = `${SCREENSHOT_PREFIX}/${submissionId}.${extension}`;

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
  console.log(`[S3] ลบไฟล์ ${key} สำเร็จ`);
}

module.exports = {
  uploadScreenshot,
  generatePresignedUploadUrl,
  generatePresignedDownloadUrl,
  deleteScreenshot,
};
```

```js [middleware/upload.js]
// middleware/upload.js
// Multer config สำหรับรับไฟล์ก่อนส่งต่อไปยัง Cloud Storage
// ใช้ memoryStorage() — ไม่เขียนลง Disk เลย เก็บใน RAM ชั่วคราว

const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('อนุญาตเฉพาะไฟล์ภาพ JPG และ PNG เท่านั้น'), false);
  }
};

// TP2026: จำกัดขนาดไม่เกิน 5MB ต่อไฟล์
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

module.exports = upload;
```

```js [controllers/uploadController.js]
// controllers/uploadController.js
// POST /api/uploads/screenshot — บันทึก URL ลงใน submissions table

const db = require('../config/db');
const { uploadScreenshot, generatePresignedUploadUrl } = require('../services/storageService');

/**
 * POST /api/uploads/screenshot
 * multipart/form-data fields:
 *   - screenshot: ไฟล์ภาพ (jpg/png ≤ 5MB)
 *   - submission_id: number
 * Auth: candidate เท่านั้น
 */
async function uploadSubmissionScreenshot(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'กรุณาแนบไฟล์ Screenshot' });
    }

    const { submission_id } = req.body;
    const candidateId = req.user.id; // มาจาก JWT Middleware

    // ตรวจว่า Submission มีอยู่และเป็นของ candidate คนนี้
    const [rows] = await db.query(
      'SELECT id, candidate_id FROM submissions WHERE id = ?',
      [submission_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: `ไม่พบ Submission ID ${submission_id}` });
    }

    if (rows[0].candidate_id !== candidateId) {
      return res.status(403).json({ success: false, message: 'คุณไม่มีสิทธิ์แนบหลักฐานใน Submission นี้' });
    }

    // อัปโหลดไปยัง S3
    // TP2026 path: wsa2026-submissions/screenshots/{submissionId}.jpg
    const screenshotUrl = await uploadScreenshot(
      req.file.buffer,
      submission_id,
      req.file.mimetype
    );

    // บันทึก URL ลงในฐานข้อมูล
    await db.query(
      'UPDATE submissions SET screenshot_url = ? WHERE id = ?',
      [screenshotUrl, submission_id]
    );

    res.status(200).json({
      success: true,
      message: 'อัปโหลด Screenshot สำเร็จ',
      data: {
        submission_id: parseInt(submission_id),
        screenshot_url: screenshotUrl,
      },
    });
  } catch (error) {
    console.error('[uploadController] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * GET /api/uploads/screenshot/presigned?submission_id=42&mime_type=image/jpeg
 * ออก Presigned URL ให้ Client อัปโหลดตรงไปยัง S3
 */
async function getPresignedUrl(req, res) {
  try {
    const { submission_id, mime_type } = req.query;

    if (!submission_id || !mime_type) {
      return res.status(400).json({ success: false, message: 'กรุณาระบุ submission_id และ mime_type' });
    }

    const result = await generatePresignedUploadUrl(submission_id, mime_type, 900);

    res.json({
      success: true,
      data: {
        ...result,
        instruction: 'ใช้ HTTP PUT ส่งไฟล์ตรงไปยัง uploadUrl ภายใน 15 นาที',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด' });
  }
}

module.exports = { uploadSubmissionScreenshot, getPresignedUrl };
```

```js [cloudinary-option.js]
// cloudinary-option.js
// ทางเลือก: ใช้ Cloudinary แทน S3 (ง่ายกว่า เหมาะสำหรับ Rapid Dev)
// npm install cloudinary

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * อัปโหลด Screenshot ไปยัง Cloudinary
 * @param {Buffer} fileBuffer
 * @param {number} submissionId
 * @returns {Promise<string>} secure_url
 */
async function uploadToCloudinary(fileBuffer, submissionId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'wsa2026/screenshots',
        public_id: `submission_${submissionId}`,
        overwrite: true,
        resource_type: 'image',
        transformation: [
          { width: 1920, height: 1080, crop: 'limit' },
          { quality: 'auto' },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
}
// URL ที่ได้: https://res.cloudinary.com/wsa2026/image/upload/v1234/wsa2026/screenshots/submission_42.jpg
// Thumbnail: เพิ่ม /w_300,h_200/ ใน URL ได้เลยโดยไม่ต้องเขียนโค้ด!

module.exports = { uploadToCloudinary };
```

:::

### ทดสอบด้วย curl

```bash
# อัปโหลด Screenshot ผ่าน Server
curl -X POST http://localhost:3000/api/uploads/screenshot \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "screenshot=@/path/to/screenshot.jpg" \
  -F "submission_id=42"

# Expected Response:
# {
#   "success": true,
#   "message": "อัปโหลด Screenshot สำเร็จ",
#   "data": {
#     "submission_id": 42,
#     "screenshot_url": "https://wsa2026-submissions.s3.ap-southeast-1.amazonaws.com/screenshots/42.jpg"
#   }
# }

# ขอ Presigned URL สำหรับอัปโหลดตรง
curl "http://localhost:3000/api/uploads/screenshot/presigned?submission_id=43&mime_type=image/jpeg" \
  -H "Authorization: Bearer <JWT_TOKEN>"

# จากนั้นใช้ PUT ส่งไฟล์ตรงไปยัง S3:
curl -X PUT "<PRESIGNED_UPLOAD_URL>" \
  -H "Content-Type: image/jpeg" \
  --data-binary @screenshot.jpg
```

---

## 🎯 โจทย์ฝึกปฏิบัติเสริมความเข้าใจ (Mini Exercise)

- **โจทย์:** เขียนฟังก์ชัน `listTaskScreenshots(taskId)` ที่ใช้ `ListObjectsV2Command` จาก `@aws-sdk/client-s3` เพื่อดึงรายการไฟล์ทั้งหมดใน Prefix `screenshots/` แล้ว JOIN กับตาราง `submissions` ในฐานข้อมูลเพื่อกรองเฉพาะ Screenshot ของ Task ที่กำหนด Return เป็น Array ของ `{ submission_id, screenshot_url, file_size }` พร้อม Unit Test ง่ายๆ

::: details 💡 คำใบ้ (Hint)
- `ListObjectsV2Command` รับ `{ Bucket, Prefix: 'screenshots/' }`
- ผลที่ได้คือ `response.Contents` เป็น Array ของ `{ Key, Size, LastModified }`
- แปลง Key เป็น URL: `` `${process.env.S3_BASE_URL}/${obj.Key}` ``
- ดึง `submissionId` จาก Key โดย `Key.split('/')[1].split('.')[0]`
- JOIN กับ `submissions` โดย `WHERE candidate_id IN (SELECT id FROM users WHERE role = 'candidate')` แล้วกรองด้วย `task_id`
:::

---

## 🔥 Challenge (โจทย์ท้าทาย!)

- **โจทย์:** ปรับปรุงระบบให้ทำ **Automatic Thumbnail Generation** เมื่อ Candidate อัปโหลด Screenshot ให้อัปโหลดขึ้น S3 เป็น 2 ไฟล์พร้อมกันโดยใช้ `Promise.all`:
  - `screenshots/42.jpg` — ต้นฉบับขนาดเต็ม
  - `screenshots/thumbs/42.jpg` — Thumbnail 300×200 ที่ย่อด้วย `sharp` (`npm install sharp`)

  จากนั้นบันทึก URL ทั้งสองลงใน `submissions` table (ต้องเพิ่ม column `thumbnail_url`) พร้อมคืนค่าทั้งสอง URL ใน Response

---

## 🗣️ ทบทวน (Review)

::: details ❓ คำถามทบทวน

**คำถาม 1:** เหตุใดจึงใช้ `multer.memoryStorage()` แทน `multer.diskStorage()` เมื่อต้องการอัปโหลดไปยัง S3?

**แนวคำตอบ:** `memoryStorage()` เก็บข้อมูลไฟล์ไว้ใน `req.file.buffer` (RAM) โดยไม่เขียนลง Disk เลย เหมาะสำหรับการส่งต่อไปยัง Cloud Storage ทันที ในขณะที่ `diskStorage()` จะเขียนไฟล์ลง Disk ก่อน ซึ่งเป็นขั้นตอนที่ไม่จำเป็นและเปลือง I/O

**คำถาม 2:** Presigned URL คืออะไร และมีประโยชน์อย่างไรเปรียบเทียบกับการอัปโหลดผ่าน Server ปกติ?

**แนวคำตอบ:** Presigned URL คือ URL ชั่วคราวที่มีลายเซ็นดิจิทัล (Signature) ทำให้ Client อัปโหลดไฟล์ตรงไปยัง S3 ได้โดยไม่ผ่าน Node.js Server ข้อดีคือลด Load บน Server มาก เพราะ Server ทำหน้าที่แค่ออก URL เล็กๆ แทนที่จะรับ Buffer ไฟล์ขนาดใหญ่

**คำถาม 3:** ใน TP2026 ไฟล์ Screenshot ถูกเก็บที่ S3 Key รูปแบบใด และทำไมต้องใช้รูปแบบนั้น?

**แนวคำตอบ:** Key รูปแบบคือ `screenshots/{submissionId}.jpg` เช่น `screenshots/42.jpg` เหตุผลคือใช้ `submissionId` ซึ่งเป็น Primary Key ใน Database ทำให้ค้นหาไฟล์ได้ทันที ไม่ซ้ำกัน และสัมพันธ์กับ Record ใน `submissions` table โดยตรง

:::
