# Module 4.2: Handling Requests 🛣️

> 💡 **เป้าหมาย:** เข้าใจวิธีการอ่านข้อมูลจาก HTTP Request ทุกรูปแบบที่ Client ส่งมา เพื่อสร้าง API สำหรับระบบ WSA2026 Test Submission Management System ที่รับข้อมูลผู้สมัคร (`candidateId`), ผลงานส่ง (`submissionUrl`) และคะแนน (`score`) ได้อย่างถูกต้องและปลอดภัย


## 📖 ทฤษฎีและแนวคิด (Theory & Concepts)

### Request คืออะไร?

เมื่อ Browser หรือ App ส่ง HTTP Request มาที่ Server ข้อมูลจะถูกแพ็กมาในหลายส่วนพร้อมกัน Express.js ห่อทั้งหมดไว้ในออบเจกต์ `req` ให้เราเรียกใช้ได้ทันที

```
┌─────────────────────────────────────────────────────────────────────┐
│               HTTP REQUEST ANATOMY (โครงสร้าง Request)             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  GET /api/candidates/42?country=TH&role=judge  HTTP/1.1            │
│  │   │              │  └──────────────────────── req.query         │
│  │   │              └──────────────────────────── req.params.id    │
│  │   └─────────────────────────────────────────── req.path         │
│  └─────────────────────────────────────────────── req.method       │
│                                                                     │
│  Host: api.wsa2026.local                                            │
│  Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...  ◄── req.headers   │
│  Content-Type: application/json                                     │
│                                                                     │
│  {                                                                  │
│    "submissionUrl": "https://github.com/...",  ◄── req.body        │
│    "score": 85                                                      │
│  }                                                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 1. `req.params` — Route Parameters (ค่าใน URL Path)

ใช้เมื่อต้องการระบุ **ทรัพยากรเฉพาะ** เช่น Candidate ID หรือ Submission ID

```
Route Pattern:    /api/submissions/:submissionId
Actual URL:       /api/submissions/99
                                    ↑
                           req.params.submissionId === "99"
```

::: warning ระวัง Type!
ค่าจาก `req.params` เป็น **String** เสมอ ถ้าจะเปรียบเทียบกับตัวเลขต้องแปลงก่อน:
```js
const id = parseInt(req.params.id); // หรือ Number(req.params.id)
```
:::

---

### 2. `req.query` — Query String Parameters (ค่าหลัง `?`)

ใช้สำหรับ **กรองข้อมูล, เรียงลำดับ, หรือ Pagination** โดยไม่บังคับให้ส่ง

```
URL: /api/candidates?country=TH&role=judge&page=2&limit=10
                      └──────┘  └────────┘ └────┘ └──────┘
req.query = {
    country: "TH",
    role:    "judge",
    page:    "2",
    limit:   "10"
}
```

::: tip Query vs Params
| ใช้ `req.params` เมื่อ | ใช้ `req.query` เมื่อ |
|:---|:---|
| ระบุตัวตนทรัพยากร (Required) | กรองหรือ Sort ข้อมูล (Optional) |
| `/users/:id` | `/users?role=judge` |
| `/tasks/:taskId` | `/tasks?status=open&limit=20` |
:::

---

### 3. `req.body` — Request Body (ข้อมูล JSON ที่ส่งมา)

ใช้สำหรับข้อมูลที่ Client ส่งมาใน Body เช่น ฟอร์ม, JSON สำหรับ POST/PUT

::: danger ต้องเปิด Middleware ก่อน!
`req.body` จะเป็น `undefined` ถ้าไม่ได้เปิด `express.json()`:
```js
app.use(express.json()); // ← ต้องมีบรรทัดนี้!
```
:::

```
POST /api/submissions  HTTP/1.1
Content-Type: application/json

{
  "candidateId": 42,
  "taskId": 7,
  "submissionUrl": "https://github.com/candidate42/solution"
}

↓ Express อ่านให้แล้วใส่ใน ↓

req.body = {
    candidateId:    42,
    taskId:         7,
    submissionUrl:  "https://github.com/candidate42/solution"
}
```

---

### 4. `req.headers` — HTTP Headers

Headers คือ Metadata ของ Request เช่น ข้อมูล Authentication, Content-Type, Language

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type:  application/json
Accept-Language: th-TH,th;q=0.9
```

```js
// อ่าน Authorization Header
const authHeader = req.headers['authorization'];
// ผลลัพธ์: "Bearer eyJhbGciOiJIUzI1NiJ9..."

// แยกเอาแค่ Token (ตัดคำว่า "Bearer " ออก)
const token = authHeader?.split(' ')[1];
```

::: warning Header Key เป็น lowercase!
Express แปลง Header ชื่อเป็น lowercase ทั้งหมด:
- `Authorization` → `req.headers['authorization']`
- `Content-Type` → `req.headers['content-type']`
:::

---

### 5. `req.method`, `req.path`, `req.ip`

คุณสมบัติอื่นๆ ที่มีประโยชน์สำหรับ Logging และ Debugging:

```js
req.method  // "GET", "POST", "PUT", "DELETE"
req.path    // "/api/submissions/42" (ไม่มี Query String)
req.url     // "/api/submissions/42?page=1" (มี Query String)
req.ip      // "::1" (localhost) หรือ "203.145.22.1" (IP จริง)
req.hostname // "api.wsa2026.local"
```

---

### 6. Response Methods (`res`)

Express มีคำสั่งส่งตอบกลับหลายแบบ เลือกให้เหมาะกับสถานการณ์:

```
┌──────────────────┬──────────────────────────────────────────────────┐
│  คำสั่ง          │  ใช้เมื่อ                                        │
├──────────────────┼──────────────────────────────────────────────────┤
│  res.json()      │  ส่ง JSON object/array (Auto-stringify+Header)   │
│  res.send()      │  ส่ง Text, HTML, หรือ Buffer                    │
│  res.status()    │  กำหนด Status Code (ใช้ต่อกับ .json() หรือ .send()) │
│  res.redirect()  │  ส่ง Client ไปยัง URL อื่น (301/302)            │
│  res.sendFile()  │  ส่งไฟล์จาก Filesystem                          │
│  res.end()       │  ปิด Response โดยไม่ส่งข้อมูล (ใช้ใน Middleware) │
└──────────────────┴──────────────────────────────────────────────────┘
```

---

### 7. HTTP Status Codes — ภาษาของ API

Status Code คือรหัสที่ Server บอก Client ว่าผลลัพธ์เป็นอย่างไร

```
┌────────────────────────────────────────────────────────────────┐
│              HTTP STATUS CODES (รหัสสถานะ HTTP)               │
├───────────┬────────────────────────────────────────────────────┤
│  2xx ✅   │  สำเร็จ (Success)                                  │
│  200      │  OK — ทั่วไป (GET สำเร็จ)                         │
│  201      │  Created — สร้างข้อมูลใหม่สำเร็จ (POST)           │
│  204      │  No Content — ลบสำเร็จ ไม่มีข้อมูลตอบกลับ         │
├───────────┼────────────────────────────────────────────────────┤
│  3xx ↩️   │  เปลี่ยนเส้นทาง (Redirect)                        │
│  301      │  Moved Permanently — ย้ายถาวร                      │
│  302      │  Found — ย้ายชั่วคราว                              │
├───────────┼────────────────────────────────────────────────────┤
│  4xx ❌   │  Client ทำผิด (Client Errors)                      │
│  400      │  Bad Request — ข้อมูลที่ส่งมาไม่ถูกต้อง            │
│  401      │  Unauthorized — ต้อง Login ก่อน                    │
│  403      │  Forbidden — Login แล้วแต่ไม่มีสิทธิ์              │
│  404      │  Not Found — ไม่พบข้อมูลที่ขอ                      │
│  409      │  Conflict — ข้อมูลซ้ำ (เช่น Email ซ้ำ)            │
│  422      │  Unprocessable Entity — Validation ไม่ผ่าน         │
├───────────┼────────────────────────────────────────────────────┤
│  5xx 💥   │  Server ทำผิด (Server Errors)                      │
│  500      │  Internal Server Error — Bug หรือ Crash           │
│  503      │  Service Unavailable — Server ยุ่งหรือปิดอยู่       │
└───────────┴────────────────────────────────────────────────────┘
```

::: tip วิธีจำ Status Codes
- **2xx** = เสร็จเรียบร้อย (ดี!)
- **4xx** = คุณผิดเอง (Client ส่งข้อมูลมั่วหรือไม่มีสิทธิ์)
- **5xx** = เราผิดเอง (Bug ในโค้ด Server หรือ Service ล่ม)
:::


## 💻 ตัวอย่างโค้ด (Code Implementation)

ตัวอย่างนี้สร้าง API สำหรับระบบ WSA2026 โดยใช้ข้อมูลจาก `req` ทุกรูปแบบ

::: code-group
```js [server.js]
const express = require('express');
const app = express();

// ── Middleware ──────────────────────────────────────
app.use(express.json()); // เปิดให้อ่าน req.body ได้

// ── In-Memory Data (จำลอง Database) ─────────────────
const candidates = [
    { id: 1, name: 'Somsak T.', country: 'TH', role: 'candidate' },
    { id: 2, name: 'Malee P.',  country: 'TH', role: 'candidate' },
    { id: 3, name: 'Tanaka R.', country: 'JP', role: 'candidate' },
];

const submissions = [
    { id: 1, candidateId: 1, taskId: 1, submissionUrl: 'https://github.com/somsak/task1', score: null },
    { id: 2, candidateId: 2, taskId: 1, submissionUrl: 'https://github.com/malee/task1',  score: null },
];

let nextSubmissionId = 3;

// ── ROUTE 1: GET /api/candidates ─────────────────────
// ใช้ req.query สำหรับ Filter ข้อมูล
// ตัวอย่าง: GET /api/candidates?country=TH&role=candidate
app.get('/api/candidates', (req, res) => {
    const { country, role } = req.query;

    let result = [...candidates];

    // Filter ตาม country ถ้ามีการส่ง Query มา
    if (country) {
        result = result.filter(c => c.country === country.toUpperCase());
    }

    // Filter ตาม role ถ้ามีการส่ง Query มา
    if (role) {
        result = result.filter(c => c.role === role);
    }

    res.json({
        total: result.length,
        filters: { country: country || 'all', role: role || 'all' },
        data: result,
    });
});

// ── ROUTE 2: GET /api/submissions/:id ────────────────
// ใช้ req.params สำหรับระบุ Submission เฉพาะตัว
// ตัวอย่าง: GET /api/submissions/1
app.get('/api/submissions/:id', (req, res) => {
    const submissionId = parseInt(req.params.id);

    // ตรวจสอบว่า ID เป็นตัวเลขที่ Valid
    if (isNaN(submissionId)) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Submission ID must be a number',
        });
    }

    const submission = submissions.find(s => s.id === submissionId);

    if (!submission) {
        return res.status(404).json({
            error: 'Not Found',
            message: `Submission ID ${submissionId} not found`,
        });
    }

    res.json(submission);
});

// ── ROUTE 3: POST /api/submissions ───────────────────
// ใช้ req.body รับข้อมูลที่ Candidate ส่งงาน
// Body: { candidateId, taskId, submissionUrl }
app.post('/api/submissions', (req, res) => {
    const { candidateId, taskId, submissionUrl } = req.body;

    // ── Validation ──────────────────────────────────
    const errors = [];

    if (!candidateId || typeof candidateId !== 'number') {
        errors.push('candidateId is required and must be a number');
    }
    if (!taskId || typeof taskId !== 'number') {
        errors.push('taskId is required and must be a number');
    }
    if (!submissionUrl || typeof submissionUrl !== 'string') {
        errors.push('submissionUrl is required and must be a string');
    }
    if (submissionUrl && !submissionUrl.startsWith('http')) {
        errors.push('submissionUrl must be a valid URL starting with http');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Validation Failed',
            messages: errors,
        });
    }

    // ── ตรวจสอบว่า Candidate มีอยู่จริง ──────────────
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) {
        return res.status(404).json({
            error: 'Not Found',
            message: `Candidate ID ${candidateId} not found`,
        });
    }

    // ── สร้าง Submission ใหม่ ─────────────────────────
    const newSubmission = {
        id: nextSubmissionId++,
        candidateId,
        taskId,
        submissionUrl,
        score: null,
        submittedAt: new Date().toISOString(),
    };

    submissions.push(newSubmission);

    // 201 Created — ส่ง Object ที่สร้างกลับไปยืนยัน
    res.status(201).json(newSubmission);
});

// ── ROUTE 4: Logging Middleware (ตัวอย่าง req.method, req.path, req.ip)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} from ${req.ip}`);
    next();
});

// ── 404 Handler ─────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} does not exist`,
    });
});

// ── Start Server ─────────────────────────────────────
app.listen(3000, () => {
    console.log('WSA2026 API running on http://localhost:3000');
});
```

```js [test-requests.js]
// ไฟล์นี้ใช้ทดสอบ API ด้วย Node.js fetch (Node 18+)
// รัน: node test-requests.js

const BASE = 'http://localhost:3000';

async function runTests() {
    console.log('=== Testing WSA2026 API ===\n');

    // Test 1: GET all candidates (no filter)
    console.log('1. GET /api/candidates');
    const all = await fetch(`${BASE}/api/candidates`).then(r => r.json());
    console.log(`   Total: ${all.total}\n`);

    // Test 2: GET candidates filtered by country
    console.log('2. GET /api/candidates?country=TH');
    const th = await fetch(`${BASE}/api/candidates?country=TH`).then(r => r.json());
    console.log(`   Total TH: ${th.total}\n`);

    // Test 3: GET single submission
    console.log('3. GET /api/submissions/1');
    const sub = await fetch(`${BASE}/api/submissions/1`).then(r => r.json());
    console.log(`   Submission: candidateId=${sub.candidateId}, url=${sub.submissionUrl}\n`);

    // Test 4: POST new submission
    console.log('4. POST /api/submissions');
    const newSub = await fetch(`${BASE}/api/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            candidateId: 3,
            taskId: 1,
            submissionUrl: 'https://github.com/tanaka/task1',
        }),
    }).then(r => r.json());
    console.log(`   Created ID: ${newSub.id}, at: ${newSub.submittedAt}\n`);

    // Test 5: POST with missing fields (should return 400)
    console.log('5. POST /api/submissions (missing fields)');
    const bad = await fetch(`${BASE}/api/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId: 1 }),  // ขาด taskId และ submissionUrl
    });
    const badBody = await bad.json();
    console.log(`   Status: ${bad.status}`);
    console.log(`   Errors: ${badBody.messages.join(', ')}\n`);
}

runTests().catch(console.error);
```
:::

---

### ตัวอย่าง curl Commands สำหรับทดสอบ

```bash
# GET candidates ทั้งหมดจาก TH
curl "http://localhost:3000/api/candidates?country=TH"

# GET submission ที่ ID = 1
curl "http://localhost:3000/api/submissions/1"

# POST ส่งงาน (Submission)
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -d '{"candidateId": 2, "taskId": 2, "submissionUrl": "https://github.com/malee/task2"}'

# POST ส่งข้อมูลไม่ครบ (ดู Error Response)
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -d '{"candidateId": 1}'
```

---

### ตัวอย่าง Response จริง

```json
// POST /api/submissions (สำเร็จ) → Status 201
{
  "id": 3,
  "candidateId": 3,
  "taskId": 1,
  "submissionUrl": "https://github.com/tanaka/task1",
  "score": null,
  "submittedAt": "2026-05-06T08:30:00.000Z"
}

// POST /api/submissions (ข้อมูลไม่ครบ) → Status 400
{
  "error": "Validation Failed",
  "messages": [
    "taskId is required and must be a number",
    "submissionUrl is required and must be a string"
  ]
}

// GET /api/submissions/999 (ไม่เจอ) → Status 404
{
  "error": "Not Found",
  "message": "Submission ID 999 not found"
}
```


## 🎯 โจทย์ฝึกปฏิบัติเสริมความเข้าใจ (Mini Exercise)

- **โจทย์:** เพิ่ม Route `GET /api/submissions?candidateId=1` ที่รับ Query String `candidateId` แล้วกรองเฉพาะงานส่งของ Candidate นั้น ถ้าไม่ส่ง `candidateId` มาให้คืนทุก Submission ถ้า `candidateId` ที่ส่งมาไม่มีในระบบให้ตอบกลับ Status 404

::: details 💡 คำใบ้ (Hint)
- ใช้ `req.query.candidateId` อ่านค่าจาก Query String
- Query String เป็น String เสมอ ต้องแปลงเป็น Number ก่อน `parseInt(req.query.candidateId)`
- ใช้ `Array.filter()` กรอง submissions ที่ `submission.candidateId === candidateId`
- ถ้าไม่ได้ส่ง `candidateId` มา (`req.query.candidateId === undefined`) ให้ Return ทั้งหมด
- ตรวจว่า Candidate มีอยู่จริงใน `candidates` array ก่อน filter
:::


## 🔥 Challenge (โจทย์ท้าทาย!)

- **โจทย์:** สร้าง Route `PUT /api/submissions/:id/score` สำหรับ Judge ให้คะแนน Submission โดย:
  1. รับ `judgeId` และ `score` จาก `req.body`
  2. รับ Submission ID จาก `req.params.id`
  3. Validate ว่า `score` ต้องเป็นตัวเลข 0–100
  4. ถ้า Submission นั้น `score` มีค่าอยู่แล้ว (ไม่ใช่ `null`) ให้ตอบกลับ Status 409 Conflict พร้อม Message ว่า "This submission has already been scored"
  5. ถ้าสำเร็จ ให้อัพเดท `score` ใน Array และตอบกลับ Status 200 พร้อมข้อมูล Submission ที่อัพเดทแล้ว


## 🗣️ ทบทวน (Review)

::: details ❓ คำถามทบทวนความเข้าใจ

**คำถาม 1:** `req.params`, `req.query`, และ `req.body` ต่างกันอย่างไร? ให้ยกตัวอย่าง URL ที่ใช้แต่ละอัน

**แนวคำตอบ:**
- `req.params` อ่านค่าจาก URL Path เช่น `/submissions/:id` → `req.params.id` ใช้ระบุทรัพยากรเฉพาะ
- `req.query` อ่านค่า Query String หลัง `?` เช่น `?country=TH` → `req.query.country` ใช้กรองข้อมูล
- `req.body` อ่านข้อมูลจาก HTTP Body (ต้องมี `express.json()`) ใช้กับ POST/PUT

**คำถาม 2:** ทำไม `req.body` ถึงเป็น `undefined` แม้ว่า Client ส่ง JSON มาแล้ว?

**แนวคำตอบ:** เพราะยังไม่ได้เปิด Middleware `app.use(express.json())` ซึ่งทำหน้าที่ Parse JSON Body ก่อนส่งต่อให้ Route Handler ถ้าขาด Middleware นี้ Express จะไม่แปลงข้อมูลใน Body ให้

**คำถาม 3:** ควรใช้ Status Code อะไรในสถานการณ์ต่อไปนี้?
- Client ส่ง `candidateId` ที่ไม่มีในระบบ
- Judge ให้คะแนนซ้ำ (Score ถูก Set แล้ว)
- Candidate ส่งงานสำเร็จ

**แนวคำตอบ:**
- ไม่พบข้อมูล → **404 Not Found**
- ข้อมูลซ้ำหรือ Conflict → **409 Conflict**
- สร้างข้อมูลสำเร็จ → **201 Created**
:::

---

👉 **[ไปต่อ: 4.3 - Environment Variables](/node/04-03-environment-variables)**
