# 💻 Project 4: Basic CRUD API 🗂️

> 💡 **เป้าหมาย:** สร้าง RESTful API สำหรับ WSA2026 Test Submission Management System โดยใช้ In-Memory Array จำลอง Database เพื่อฝึก CRUD operations ครบ 5 routes พร้อม validation และ curl testing

---

## 📖 ภาพรวมของโปรเจกต์ (Project Overview)

ในโปรเจกต์นี้เราจะสร้าง **CRUD API สำหรับ Tasks** ของระบบ WSA2026 โดยยังไม่ใช้ Database จริง แต่เก็บข้อมูลในตัวแปร Array (In-Memory) เพื่อให้โฟกัสที่ REST API Design และ Express.js ก่อน

### สิ่งที่จะสร้าง

```
GET    /api/tasks          -->  ดึง tasks ทั้งหมด
GET    /api/tasks/:id      -->  ดึง task เดียวตาม ID
POST   /api/tasks          -->  สร้าง task ใหม่
PUT    /api/tasks/:id      -->  แก้ไข task
DELETE /api/tasks/:id      -->  ลบ task
```

### Architecture Diagram

```
                 HTTP Request
                      |
                      v
         +------------+------------+
         |       Express App       |
         |  app.use(express.json())| <-- Middleware: parse body
         |  app.use(cors())        | <-- Middleware: CORS
         +------------+------------+
                      |
           +----------+----------+
           |                     |
    +------v------+       +------v------+
    |   Router    |       |   Router    |
    | /api/tasks  |       |  (future)   |
    +------+------+       +-------------+
           |
  +--------+--------+
  |                 |
+-v---------+  +----v------+
| GET  ALL  |  | GET BY ID |  ...and POST, PUT, DELETE
+-----------+  +-----------+
           |
           v
  +--------+---------+
  |  In-Memory Store |
  |  let tasks = []  | <-- จำลอง Database
  +------------------+
           |
           v
      JSON Response
```

---

## 🗂️ โครงสร้างไฟล์ (File Structure)

```
wsa2026-tasks-api/
├── .env
├── .env.example
├── .gitignore
├── package.json
└── app.js
```

---

## ⏱️ เวลาที่ใช้: 45 นาที

---

## 📝 ขั้นตอนการทำงาน (Step-by-Step)

### ขั้นตอนที่ 1: Project Setup

- [ ] สร้างโฟลเดอร์และเริ่มต้น npm project
- [ ] ติดตั้ง packages ที่จำเป็น

```bash
mkdir wsa2026-tasks-api
cd wsa2026-tasks-api
npm init -y
npm install express cors dotenv
```

- [ ] สร้างไฟล์ `.env`

```env
PORT=3000
NODE_ENV=development
```

- [ ] สร้างไฟล์ `.gitignore`

```text
node_modules/
.env
```

---

### ขั้นตอนที่ 2: In-Memory Data Store

- [ ] สร้างไฟล์ `app.js`
- [ ] กำหนด seed data สำหรับ WSA2026 tasks

```js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ==============================================
// IN-MEMORY STORE — จำลอง Database
// ==============================================
let tasks = [
  {
    id: 1,
    title: 'Build REST API',
    description: 'Create a full RESTful API using Express.js and Node.js',
    time_limit_minutes: 240,
    max_score: 100
  },
  {
    id: 2,
    title: 'Design Database Schema',
    description: 'Design relational database schema for a submission system',
    time_limit_minutes: 180,
    max_score: 80
  },
  {
    id: 3,
    title: 'Build Frontend UI',
    description: 'Build a responsive web interface using HTML/CSS/JavaScript',
    time_limit_minutes: 300,
    max_score: 120
  }
];

// Helper: generate next ID (safe even after deletions)
function getNextId() {
  return tasks.length === 0 ? 1 : Math.max(...tasks.map(t => t.id)) + 1;
}
```

---

### ขั้นตอนที่ 3: Implement GET Routes (Read)

- [ ] สร้าง route ดึง tasks ทั้งหมด
- [ ] สร้าง route ดึง task ตาม ID

```js
// GET /api/tasks — ดึงทุก tasks
app.get('/api/tasks', (req, res) => {
  res.json({
    success: true,
    count: tasks.length,
    data: tasks
  });
});

// GET /api/tasks/:id — ดึง task เดียว
app.get('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format — must be a number'
    });
  }

  const task = tasks.find(t => t.id === id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: `Task with id ${id} not found`
    });
  }

  res.json({ success: true, data: task });
});
```

---

### ขั้นตอนที่ 4: Implement POST Route (Create)

- [ ] สร้าง route สำหรับเพิ่ม task ใหม่
- [ ] เพิ่ม input validation

```js
// POST /api/tasks — สร้าง task ใหม่
app.post('/api/tasks', (req, res) => {
  const { title, description, time_limit_minutes, max_score } = req.body;

  // Validation — ตรวจว่า required fields ครบ
  if (!title || !time_limit_minutes || !max_score) {
    return res.status(400).json({
      success: false,
      message: 'title, time_limit_minutes, and max_score are required'
    });
  }

  // Validation — ตรวจว่าตัวเลขถูกต้อง
  if (typeof time_limit_minutes !== 'number' || time_limit_minutes <= 0) {
    return res.status(400).json({
      success: false,
      message: 'time_limit_minutes must be a positive number'
    });
  }

  if (typeof max_score !== 'number' || max_score <= 0) {
    return res.status(400).json({
      success: false,
      message: 'max_score must be a positive number'
    });
  }

  const newTask = {
    id: getNextId(),
    title: title.trim(),
    description: description ? description.trim() : '',
    time_limit_minutes,
    max_score
  };

  tasks.push(newTask);

  // 201 Created — ส่ง task ที่เพิ่งสร้างกลับไปยืนยัน
  res.status(201).json({ success: true, data: newTask });
});
```

---

### ขั้นตอนที่ 5: Implement PUT Route (Update)

- [ ] สร้าง route สำหรับแก้ไข task
- [ ] ตรวจสอบว่า task นั้นมีอยู่ก่อน

```js
// PUT /api/tasks/:id — แก้ไข task ทั้งก้อน
app.put('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `Task with id ${id} not found`
    });
  }

  const { title, description, time_limit_minutes, max_score } = req.body;

  // Validation — ตรวจ required fields
  if (!title || !time_limit_minutes || !max_score) {
    return res.status(400).json({
      success: false,
      message: 'title, time_limit_minutes, and max_score are required'
    });
  }

  // แทนที่ข้อมูลทั้งหมด (คง id เดิมไว้)
  tasks[index] = {
    id,
    title: title.trim(),
    description: description ? description.trim() : '',
    time_limit_minutes,
    max_score
  };

  res.json({ success: true, data: tasks[index] });
});
```

---

### ขั้นตอนที่ 6: Implement DELETE Route

- [ ] สร้าง route สำหรับลบ task
- [ ] ตรวจสอบว่า task มีอยู่ก่อนลบ

```js
// DELETE /api/tasks/:id — ลบ task
app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `Task with id ${id} not found`
    });
  }

  // ลบออกจาก Array และเก็บตัวที่ลบไว้เพื่อตอบกลับ
  const [deletedTask] = tasks.splice(index, 1);

  res.json({
    success: true,
    message: `Task '${deletedTask.title}' deleted successfully`,
    data: deletedTask
  });
});
```

---

### ขั้นตอนที่ 7: Error Handler และ Start Server

- [ ] เพิ่ม 404 handler สำหรับ routes ที่ไม่มี
- [ ] เพิ่ม Error Middleware
- [ ] เรียก `app.listen()`

```js
// 404 — Route ไม่มีในระบบ
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Error Middleware — ต้องมี 4 args เสมอ
app.use((err, req, res, next) => {
  console.error('Unexpected Error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`WSA2026 Tasks API running at http://localhost:${PORT}`);
  console.log('Available routes:');
  console.log(`  GET    http://localhost:${PORT}/api/tasks`);
  console.log(`  GET    http://localhost:${PORT}/api/tasks/:id`);
  console.log(`  POST   http://localhost:${PORT}/api/tasks`);
  console.log(`  PUT    http://localhost:${PORT}/api/tasks/:id`);
  console.log(`  DELETE http://localhost:${PORT}/api/tasks/:id`);
});
```

---

## ✅ Expected Output

### เริ่มต้น Server

```
WSA2026 Tasks API running at http://localhost:3000
Available routes:
  GET    http://localhost:3000/api/tasks
  GET    http://localhost:3000/api/tasks/:id
  POST   http://localhost:3000/api/tasks
  PUT    http://localhost:3000/api/tasks/:id
  DELETE http://localhost:3000/api/tasks/:id
```

### Testing ด้วย curl

**1. GET /api/tasks — ดึงทั้งหมด**

```bash
curl http://localhost:3000/api/tasks
```

```json
{
  "success": true,
  "count": 3,
  "data": [
    { "id": 1, "title": "Build REST API", "description": "...", "time_limit_minutes": 240, "max_score": 100 },
    { "id": 2, "title": "Design Database Schema", "description": "...", "time_limit_minutes": 180, "max_score": 80 },
    { "id": 3, "title": "Build Frontend UI", "description": "...", "time_limit_minutes": 300, "max_score": 120 }
  ]
}
```

**2. GET /api/tasks/1 — ดึงตาม ID**

```bash
curl http://localhost:3000/api/tasks/1
```

```json
{
  "success": true,
  "data": { "id": 1, "title": "Build REST API", "time_limit_minutes": 240, "max_score": 100 }
}
```

**3. GET /api/tasks/999 — ID ไม่มี → 404**

```bash
curl http://localhost:3000/api/tasks/999
```

```json
{
  "success": false,
  "message": "Task with id 999 not found"
}
```

**4. POST /api/tasks — สร้าง task ใหม่**

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\": \"Network Configuration\", \"description\": \"Configure LAN and secure routing\", \"time_limit_minutes\": 120, \"max_score\": 60}"
```

```json
{
  "success": true,
  "data": {
    "id": 4,
    "title": "Network Configuration",
    "description": "Configure LAN and secure routing",
    "time_limit_minutes": 120,
    "max_score": 60
  }
}
```

**5. POST ข้อมูลไม่ครบ → 400**

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\": \"Incomplete Task\"}"
```

```json
{
  "success": false,
  "message": "title, time_limit_minutes, and max_score are required"
}
```

**6. PUT /api/tasks/2 — แก้ไข**

```bash
curl -X PUT http://localhost:3000/api/tasks/2 \
  -H "Content-Type: application/json" \
  -d "{\"title\": \"Advanced DB Design\", \"description\": \"Design schema with normalization\", \"time_limit_minutes\": 200, \"max_score\": 90}"
```

```json
{
  "success": true,
  "data": {
    "id": 2,
    "title": "Advanced DB Design",
    "description": "Design schema with normalization",
    "time_limit_minutes": 200,
    "max_score": 90
  }
}
```

**7. DELETE /api/tasks/3 — ลบ**

```bash
curl -X DELETE http://localhost:3000/api/tasks/3
```

```json
{
  "success": true,
  "message": "Task 'Build Frontend UI' deleted successfully",
  "data": { "id": 3, "title": "Build Frontend UI", ... }
}
```

**8. GET หลังลบ — ตรวจสอบ**

```bash
curl http://localhost:3000/api/tasks
```

```json
{
  "success": true,
  "count": 2,
  "data": [
    { "id": 1, "title": "Build REST API", ... },
    { "id": 2, "title": "Advanced DB Design", ... }
  ]
}
```

---

## HTTP Status Code Summary

```
+--------+--------------------+----------------------------------------+
| Code   | Meaning            | เมื่อไหร่ใช้                           |
+--------+--------------------+----------------------------------------+
|  200   | OK                 | GET, PUT, DELETE สำเร็จ                |
|  201   | Created            | POST สร้างข้อมูลใหม่สำเร็จ             |
|  400   | Bad Request        | ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบ     |
|  404   | Not Found          | ไม่พบ Resource ที่ขอ                  |
|  500   | Internal Error     | Error ที่ไม่คาดคิดฝั่ง Server          |
+--------+--------------------+----------------------------------------+
```

---

## 🔥 Challenge (โจทย์ท้าทาย!)

- **โจทย์:** เพิ่ม Query Parameter Filtering ให้กับ `GET /api/tasks` รองรับ filter ดังนี้:
  - `GET /api/tasks?max_score=100` — แสดงเฉพาะ tasks ที่มี `max_score` เท่ากับค่าที่ระบุ
  - `GET /api/tasks?min_time=180` — แสดงเฉพาะ tasks ที่มี `time_limit_minutes` มากกว่าหรือเท่ากับค่าที่ระบุ
  - `GET /api/tasks?max_score=100&min_time=180` — ใช้ทั้งสอง filter พร้อมกัน
  - ถ้าไม่ระบุ filter ให้แสดงทั้งหมดตามเดิม

::: details 💡 คำใบ้ (Hint)
```js
app.get('/api/tasks', (req, res) => {
  let result = [...tasks]; // copy ก่อนเพื่อไม่แก้ array จริง

  // ดึง query params
  const { max_score, min_time } = req.query;

  if (max_score) {
    const score = parseInt(max_score);
    result = result.filter(t => t.max_score === score);
  }

  if (min_time) {
    const time = parseInt(min_time);
    result = result.filter(t => t.time_limit_minutes >= time);
  }

  res.json({ success: true, count: result.length, data: result });
});
```

ทดสอบด้วย curl:
```bash
curl "http://localhost:3000/api/tasks?max_score=100"
curl "http://localhost:3000/api/tasks?min_time=200"
curl "http://localhost:3000/api/tasks?max_score=80&min_time=120"
```
:::

---

👉 **[ไปต่อ: Module 5 - Middleware & Clean Architecture](/node/05-01-middleware-concept)**
