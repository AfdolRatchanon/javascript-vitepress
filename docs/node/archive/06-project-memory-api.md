# 🎯 Project: In-Memory Todo API (Memory DB) 🧠

> **"Data is strict, code is malleable."**

ในบทนี้เราจะนำทฤษฎี REST API ทั้งหมดมาสร้างเป็น **Real Project**!
แต่เพื่อโฟกัสที่ Logic API (โดยไม่ต้องพะวงเรื่อง Database), เราจะใช้ **Array ใน Memory** แทน Database (ข้อมูลหายเมื่อ Restart Server)

---

## 🎯 The Goals
สร้าง RESTful API สำหรับระบบ **Advanced Todo List** ที่รองรับ:
1.  **CRUD:** Create, Read, Update, Delete
2.  **Search:** ค้นหาด้วย Keyword
3.  **Filtering:** กรองตามสถานะ (Completed/Pending)
4.  **Pagination:** แบ่งหน้าข้อมูล
5.  **Validation:** ตรวจสอบ Input

---

## 🛠️ Step 1: Project Setup

```bash
mkdir memory-api
cd memory-api
npm init -y
npm install express cors morgan nodemon
```

แก้ไข `package.json` เพิ่ม `"dev": "nodemon index.js"`

---

## 🏗️ Step 2: The Data Store (Database จำลอง)

สร้างไฟล์ `db.js` เพื่อจำลอง Database:
```javascript
// db.js
// จำลองข้อมูล 20 รายการ
const todos = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    title: `Task number ${i + 1}`,
    completed: i % 2 === 0, // สลับ True/False
    createdAt: new Date()
}));

module.exports = todos;
```

---

## 🚀 Step 3: Implement API (index.js)

เขียนโค้ดหลักใน `index.js`. เราจะเขียนแบบ **Step-by-Step**

### 3.1 Setup Server & Middleware
```javascript
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
let db = require('./db'); // ใช้ let เพราะเราอาจจะ Re-assign ตอน Delete (หรือใช้ splice ก็ได้)

const app = express();

app.use(express.json()); // อ่าน JSON Body
app.use(cors());         // เปิด CORS
app.use(morgan('dev'));  // Log Request
```

### 3.2 GET /todos (Search + Filter + Pagination) 🌟
นี่คือส่วนที่ซับซ้อนที่สุดของ Logic!

```javascript
app.get('/todos', (req, res) => {
    // 1. Destructuring Query Params
    const { keyword, status, page = 1, limit = 10 } = req.query;

    let result = db;

    // 2. Filtering (Status)
    if (status) {
        const isCompleted = status === 'true';
        result = result.filter(todo => todo.completed === isCompleted);
    }

    // 3. Searching (Keyword)
    if (keyword) {
        const lowerKey = keyword.toLowerCase();
        result = result.filter(todo => 
            todo.title.toLowerCase().includes(lowerKey)
        );
    }

    // 4. Pagination Logic
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // Slice ข้อมูลตามหน้า
    const paginatedResult = result.slice(startIndex, endIndex);

    // 5. Build Response
    res.json({
        status: 'success',
        data: paginatedResult,
        meta: {
            total: result.length,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(result.length / limit)
        }
    });
});
```

### 3.3 GET /todos/:id (Get One)
```javascript
app.get('/todos/:id', (req, res) => {
    const id = Number(req.params.id);
    const todo = db.find(t => t.id === id);

    if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
    }

    res.json({ status: 'success', data: todo });
});
```

### 3.4 POST /todos (Create)
```javascript
app.post('/todos', (req, res) => {
    const { title } = req.body;

    // Validation
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    const newTodo = {
        id: db.length + 1, // Auto Increment ID (Simple version)
        title,
        completed: false,
        createdAt: new Date()
    };

    db.push(newTodo);
    
    // 201 Created
    res.status(201).json({ status: 'success', data: newTodo });
});
```

### 3.5 PUT /todos/:id (Update)
```javascript
app.put('/todos/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = db.findIndex(t => t.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Todo not found' });
    }

    // Update ข้อมูล (Merge ของเก่า + ของใหม่)
    db[index] = { ...db[index], ...req.body };

    res.json({ status: 'success', data: db[index] });
});
```

### 3.6 DELETE /todos/:id
```javascript
app.delete('/todos/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = db.findIndex(t => t.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Todo not found' });
    }

    // ลบออกจาก Array
    const deleted = db.splice(index, 1);

    res.json({ status: 'success', data: deleted[0] });
});

// Start Server
app.listen(3000, () => console.log('🚀 Server running on port 3000'));
```

---

## 🧪 Testing Time! (ทดลองยิง API)

ใช้ Postman หรือ Browser ทดสอบ:

1.  **Get All:** `GET http://localhost:3000/todos`
2.  **Filter Completed:** `GET http://localhost:3000/todos?status=true`
3.  **Search:** `GET http://localhost:3000/todos?keyword=Task`
4.  **Pagination:** `GET http://localhost:3000/todos?page=2&limit=5`
5.  **Pagination + Filter:** `GET http://localhost:3000/todos?page=1&limit=5&status=false`

---

## 🏆 Summary: สิ่งที่ได้เรียนรู้

| Feature | Implementation |
| :--- | :--- |
| **Search** | `String.includes()` |
| **Filter** | `Array.filter()` |
| **Pagination** | `Array.slice(start, end)` |
| **Response Format** | Standard Envelope (`status`, `data`, `meta`) |
| **Status Codes** | 200, 201, 400, 404 ครบถ้วน |

โปรเจกต์นี้คือรากฐานของ Backend Developer! ในบทต่อไปเมื่อเราใช้ **Database จริง (MySQL/Mongo)** Logic พวกนี้จะย้ายจาก JavaScript Array ไปเป็น **SQL Queries** (`WHERE`, `LIMIT`, `OFFSET`) แทน!

---

## 🧗 Challenges 🎯

### 🎯 Challenge 1: Data Persistence (File System)
(ยาก) ปัจจุบันข้อมูลหายเมื่อปิด Server. จงแก้ code ให้:
1. เมื่อเริ่ม Server: อ่านไฟล์ `db.json` มาใส่ตัวแปร `db`
2. เมื่อมีการ Create/Update/Delete: เขียน `db` ลงไฟล์ `db.json` ทันที

### 🎯 Challenge 2: Date Filtering
เพิ่ม Query param `since` เพื่อดึงเฉพาะ Todo ที่สร้างหลังจากวันที่กำหนด
* `GET /todos?since=2024-01-01`
* Hint: `new Date(item.createdAt) > new Date(req.query.since)`

### 🎯 Challenge 3: Soft Delete
เปลี่ยน `DELETE` ให้ไม่ใช่การลบจริง แต่เซ็ต `deleted: true`
และแก้ `GET` ให้ไม่ส่ง item ที่ `deleted: true` กลับมา (เว้นแต่ User จะส่ง `?include_deleted=true`)
