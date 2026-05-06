# Module 4.1: Express.js Setup & Basics 🚂

> 💡 **เป้าหมาย:** เข้าใจว่า Express.js คืออะไรและทำไมถึงเป็น Framework ที่ใช้สร้าง REST API สำหรับ WSA2026 Test Submission Management System ได้อย่างมีประสิทธิภาพ รวมถึงสามารถสร้าง Route, จัดการ Middleware และ Error ได้อย่างถูกต้อง

---

## 📖 ทฤษฎีและแนวคิด (Theory & Concepts)

### Express.js คืออะไร?

**Express.js** คือ Web Application Framework ที่สร้างอยู่บน Node.js เป็น Layer ที่ห่อหุ้ม Built-in `http` Module ของ Node.js เอาไว้ เพิ่ม API ที่ใช้งานสะดวกสำหรับการสร้าง Web Server และ REST API

คำว่า **"unopinionated"** หมายความว่า Express ไม่บังคับว่าต้องจัดโครงสร้างโปรเจกต์แบบใดแบบหนึ่ง ทำให้ยืดหยุ่นสูง

### ทำไม Express ดีกว่า http Module?

เปรียบเทียบงานเดียวกัน: "รับ GET /api/tasks แล้วตอบ JSON"

**แบบ Native http Module:**
```js
const http = require('http');
const server = http.createServer((req, res) => {
  if (req.url === '/api/tasks' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ tasks: [] }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});
```

**แบบ Express:**
```js
app.get('/api/tasks', (req, res) => {
  res.json({ tasks: [] });
});
```

ต่างกันอย่างชัดเจน Express จัดการ Method, Header, Content-Type ให้อัตโนมัติ

### ตารางเปรียบเทียบ

| Feature | Native `http` | Express.js |
| :--- | :--- | :--- |
| **Routing** | `if/else` เช็คเอง | `app.get()`, `app.post()` |
| **Middleware** | ไม่มี Built-in | Core Concept, chain ง่าย |
| **Body Parsing** | ต้องเขียนเอง | `express.json()` บรรทัดเดียว |
| **Static Files** | เขียน Stream เอง | `express.static()` |
| **Error Handling** | จัดการเอง | Error Middleware |
| **Boilerplate** | สูงมาก | ต่ำ โฟกัสที่ Logic ได้เลย |

---

### Express Request Pipeline (ASCII Diagram)

```
HTTP Request เข้ามา
        |
        v
+------------------+
|   HTTP Method    |  GET / POST / PUT / DELETE
+------------------+
        |
        v
+------------------+
|   URL Path       |  /api/tasks  /api/tasks/:id
+------------------+
        |
        v
+------------------+
|   Middleware 1   |  express.json()  <-- parse body
+------------------+
        |
        v
+------------------+
|   Middleware 2   |  logger, auth, cors ...
+------------------+
        |
        v
+------------------+
|  Route Handler   |  (req, res) => { ... }
+------------------+
        |
        v
+------------------+
|  HTTP Response   |  res.json() / res.status(404).json()
+------------------+
        |
        v
   Client ได้รับ Response
```

---

### Method Routing

Express มี method สำหรับ HTTP Verb ทุกตัว:

```
app.get()     -->  ดึงข้อมูล (Read)
app.post()    -->  สร้างข้อมูลใหม่ (Create)
app.put()     -->  แก้ไขข้อมูลทั้งหมด (Replace)
app.patch()   -->  แก้ไขข้อมูลบางส่วน (Partial Update)
app.delete()  -->  ลบข้อมูล (Delete)
```

### Route Patterns

```
/api/tasks           -->  ดึงทุก task หรือสร้างใหม่
/api/tasks/:id       -->  ระบุ task ID เฉพาะเจาะจง
/api/tasks/:id/submissions  -->  Nested resource
```

`:id` คือ **Route Parameter** เข้าถึงได้ผ่าน `req.params.id`

---

### Middleware คืออะไร?

Middleware คือ Function ที่รัน "ระหว่างทาง" ก่อนถึง Route Handler ใช้ `next()` เพื่อส่งต่อ

```
Request --> [middleware A] --> [middleware B] --> [Route Handler] --> Response
                                                        ^
                  ถ้า middleware ไม่เรียก next()  -----+
                  Request จะหยุดอยู่ที่ middleware นั้น
```

Middleware สำคัญ 2 ตัวที่ใช้บ่อย:

- `express.json()` — parse Request Body ที่เป็น JSON ให้เป็น JavaScript Object
- `express.static('public')` — serve ไฟล์ Static เช่น HTML, CSS, รูปภาพ

---

### Error Handling ใน Express

Express มี Error Handler พิเศษที่รับ **4 arguments**: `(err, req, res, next)`

```
ปกติ Middleware: (req, res, next)
Error Middleware: (err, req, res, next)  <-- ต้องมี err เป็นตัวแรก!
```

ต้องวางไว้ **ท้ายสุด** หลัง routes ทั้งหมด

```
app.get('/api/tasks', handler)
app.post('/api/tasks', handler)
               ...
app.use((err, req, res, next) => {   // <-- Error Handler อยู่ท้ายสุด
  res.status(500).json({ error: err.message })
})
```

---

## 💻 ตัวอย่างโค้ด (Code Implementation)

สร้าง Express App สำหรับ WSA2026 Test Submission Management System

::: code-group
```js [app.js]
// app.js — WSA2026 Test Submission Management System
require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// ===========================================
// MIDDLEWARE
// ===========================================

// parse JSON body (ต้องวางก่อน routes ทุกตัว!)
app.use(express.json());

// serve static files จาก folder 'public'
app.use(express.static('public'));

// Simple logger middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next(); // ส่งต่อให้ route ต่อไป
});

// ===========================================
// IN-MEMORY DATA (จำลอง DB สำหรับตัวอย่าง)
// ===========================================

let tasks = [
  {
    id: 1,
    title: 'Build REST API',
    description: 'Create a full RESTful API using Express.js',
    time_limit_minutes: 240,
    max_score: 100
  },
  {
    id: 2,
    title: 'Design Database Schema',
    description: 'Design relational schema for submission system',
    time_limit_minutes: 180,
    max_score: 80
  }
];

let submissions = [
  {
    id: 1,
    candidate_id: 10,
    task_id: 1,
    submission_url: 'https://github.com/candidate10/task1',
    submitted_at: '2026-08-10T09:00:00Z',
    score: 92,
    status: 'scored'
  }
];

// ===========================================
// ROUTES: TASKS
// ===========================================

// GET /api/tasks — ดึง tasks ทั้งหมด
app.get('/api/tasks', (req, res) => {
  res.json({
    success: true,
    count: tasks.length,
    data: tasks
  });
});

// GET /api/tasks/:id — ดึง task ตาม ID
app.get('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: `Task with id ${id} not found`
    });
  }

  res.json({ success: true, data: task });
});

// POST /api/tasks — สร้าง task ใหม่ (manager เท่านั้น ในงานจริงต้องมี auth)
app.post('/api/tasks', (req, res) => {
  const { title, description, time_limit_minutes, max_score } = req.body;

  // Validation
  if (!title || !time_limit_minutes || !max_score) {
    return res.status(400).json({
      success: false,
      message: 'title, time_limit_minutes, and max_score are required'
    });
  }

  const newTask = {
    id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
    title,
    description: description || '',
    time_limit_minutes: parseInt(time_limit_minutes),
    max_score: parseInt(max_score)
  };

  tasks.push(newTask);
  res.status(201).json({ success: true, data: newTask });
});

// ===========================================
// ROUTES: SUBMISSIONS
// ===========================================

// POST /api/submissions — candidate ส่งงาน
app.post('/api/submissions', (req, res) => {
  const { candidate_id, task_id, submission_url } = req.body;

  if (!candidate_id || !task_id || !submission_url) {
    return res.status(400).json({
      success: false,
      message: 'candidate_id, task_id, and submission_url are required'
    });
  }

  // ตรวจว่า task นั้นมีอยู่จริง
  const task = tasks.find(t => t.id === parseInt(task_id));
  if (!task) {
    return res.status(404).json({
      success: false,
      message: `Task id ${task_id} does not exist`
    });
  }

  const newSubmission = {
    id: submissions.length > 0 ? Math.max(...submissions.map(s => s.id)) + 1 : 1,
    candidate_id: parseInt(candidate_id),
    task_id: parseInt(task_id),
    submission_url,
    submitted_at: new Date().toISOString(),
    score: null,
    status: 'pending'
  };

  submissions.push(newSubmission);
  res.status(201).json({ success: true, data: newSubmission });
});

// ===========================================
// ROUTES: LEADERBOARD
// ===========================================

// GET /api/leaderboard — คะแนนรวมแต่ละ candidate
app.get('/api/leaderboard', (req, res) => {
  // รวมคะแนนแต่ละ candidate จาก submissions ที่ scored แล้ว
  const scoredSubmissions = submissions.filter(s => s.status === 'scored');

  const scoreMap = {};
  for (const sub of scoredSubmissions) {
    if (!scoreMap[sub.candidate_id]) {
      scoreMap[sub.candidate_id] = 0;
    }
    scoreMap[sub.candidate_id] += sub.score;
  }

  // แปลงเป็น Array และเรียงจากมากไปน้อย
  const leaderboard = Object.entries(scoreMap)
    .map(([candidate_id, total_score]) => ({
      candidate_id: parseInt(candidate_id),
      total_score
    }))
    .sort((a, b) => b.total_score - a.total_score)
    .map((entry, index) => ({ rank: index + 1, ...entry }));

  res.json({
    success: true,
    count: leaderboard.length,
    data: leaderboard
  });
});

// ===========================================
// CATCH-ALL: 404 Route
// ===========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
});

// ===========================================
// ERROR HANDLING MIDDLEWARE (ต้อง 4 args!)
// ===========================================
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ===========================================
// START SERVER
// ===========================================
app.listen(PORT, () => {
  console.log(`WSA2026 API running at http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
```
:::

---

### สรุป Routes ที่สร้างไว้

```
GET    /api/tasks          -->  ดึง tasks ทั้งหมด
GET    /api/tasks/:id      -->  ดึง task ตาม ID
POST   /api/tasks          -->  สร้าง task ใหม่
POST   /api/submissions    -->  candidate ส่งงาน
GET    /api/leaderboard    -->  ดูอันดับคะแนน
```

---

## 🎯 โจทย์ฝึกปฏิบัติเสริมความเข้าใจ (Mini Exercise)

- **โจทย์:** เพิ่ม route `PUT /api/tasks/:id` สำหรับให้ manager แก้ไขข้อมูล task (เช่น เปลี่ยน `time_limit_minutes` หรือ `max_score`) โดยต้องตรวจสอบว่า task นั้นมีอยู่จริงก่อน ถ้าไม่พบให้ตอบ 404 ถ้าสำเร็จให้ตอบ task ที่อัปเดตแล้ว

::: details 💡 คำใบ้ (Hint)
- ใช้ `app.put('/api/tasks/:id', (req, res) => { ... })` เป็นโครง
- แปลง `req.params.id` เป็น number ด้วย `parseInt()`
- หา index ด้วย `tasks.findIndex(t => t.id === id)`
- ถ้า index === -1 แปลว่าหาไม่เจอ ให้ตอบ 404
- อัปเดตด้วย `tasks[index] = { ...tasks[index], ...req.body }`
:::

---

## 🔥 Challenge (โจทย์ท้าทาย!)

- **โจทย์:** สร้าง route `PATCH /api/submissions/:id/score` สำหรับ judge ให้คะแนน submission โดย body คือ `{ "score": 85 }` ต้องตรวจสอบว่าคะแนนต้องเป็นตัวเลข 0 ถึง `max_score` ของ task นั้นๆ ถ้าเกินให้ตอบ 400 พร้อม error message ที่ชัดเจน และเปลี่ยน `status` ของ submission เป็น `'scored'` ด้วย

---

## 🗣️ ทบทวน (Review)

::: details ❓ คำถามทบทวนความเข้าใจ

**คำถาม 1:** ทำไม `express.json()` ต้องวางก่อน routes ทุกตัว?

**แนวคำตอบ:** เพราะ Middleware ใน Express ทำงานตามลำดับจากบนลงล่าง ถ้า `express.json()` ถูกลงทะเบียนหลัง route `req.body` จะยังเป็น `undefined` ตอนที่ route handler ทำงาน ทำให้อ่านค่าจาก body ไม่ได้

**คำถาม 2:** Route Parameter `:id` กับ Query String `?id=1` ต่างกันอย่างไร และเข้าถึงอย่างไร?

**แนวคำตอบ:** Route Parameter `:id` อยู่ใน URL path เช่น `/api/tasks/5` เข้าถึงผ่าน `req.params.id` ส่วน Query String อยู่หลัง `?` เช่น `/api/tasks?id=5` เข้าถึงผ่าน `req.query.id` โดยทั่วไป Route Parameter ใช้สำหรับระบุ Resource เฉพาะ ส่วน Query String ใช้สำหรับ filter หรือ sort

**คำถาม 3:** Error Handling Middleware ต้องมีกี่ Parameters และทำไม?

**แนวคำตอบ:** ต้องมี 4 parameters เสมอคือ `(err, req, res, next)` เพราะ Express ใช้จำนวน arguments ในการแยกแยะว่า middleware นี้เป็น Error Handler หรือ Middleware ธรรมดา ถ้ามีแค่ 3 args Express จะมองว่าเป็น middleware ปกติและไม่นำมาใช้เป็น error handler

:::

---

👉 **[ไปต่อ: Module 4.2 - Handling Requests](/node/04-02-handling-requests)**
