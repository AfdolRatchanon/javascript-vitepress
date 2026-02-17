# 🗃️ Project: Student Management DB

ได้เวลาลงสนามจริง! เราจะสร้าง **REST API** สำหรับจัดการข้อมูลนักเรียน (Student Management System) โดยเก็บข้อมูลลงใน **MySQL Database** จริงๆ ครับ

> **Pre-requisites**:
> - ต้องมี MySQL Server ติดตั้งในเครื่อง (หรือใช้ Docker/Cloud)
> - สร้าง Database ชื่อ `school_db` รอไว้

---

## 🎯 เป้าหมาย (Goal)

เราจะสร้าง API Endpoints ที่รองรับการทำงานแบบ **CRUD** ครบวงจร:

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/students` | ดึงรายชื่อนักเรียนทั้งหมด (รองรับ Search) |
| `GET` | `/students/:id` | ดึงข้อมูลนักเรียนคนเดียวตาม ID |
| `POST` | `/students` | เพิ่มนักเรียนคนใหม่ |
227: | `PUT` | `/students/:id` | แก้ไขข้อมูลนักเรียน |
228: | `DELETE` | `/students/:id` | ลบนักเรียน (Soft Delete) |

---

## 🛠️ Step 1: Database Setup

เปิด MySQL Workbench หรือ Command Line แล้วรัน SQL นี้เพื่อสร้างตาราง:
สังเกตว่าเราเพิ่ม column `is_deleted` เข้ามาเพื่อรองรับ Soft Delete ครับ

```sql
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    age INT,
    email VARCHAR(100) UNIQUE,
    is_deleted BOOLEAN DEFAULT FALSE, -- 0 = Active, 1 = Deleted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ลองใส่ข้อมูลตัวอย่าง
INSERT INTO students (first_name, last_name, age, email) 
VALUES ('Somchai', 'Jaidee', 20, 'somchai@email.com');
```

---

## 🛠️ Step 2: Project Structure

เพื่อความเป็นระเบียบ (และเป็นมาตรฐาน Gold Standard 🏅) เราจะเริ่มจัดไฟล์ให้เป็นระบบมากขึ้นครับ:

```
student-api/
├── .env                  # เก็บ Config (DB Credentials)
├── db.js                 # จัดการ Database Connection
├── index.js              # Entry Point (Express App)
└── package.json
```

1.  สร้างโฟลเดอร์และ initialize:
    ```bash
    mkdir student-api
    cd student-api
    npm init -y
    npm install express mysql2 dotenv
    ```

2.  สร้างไฟล์ `.env`:
    ```env
    DB_HOST=localhost
    DB_USER=root
    DB_PASS=myPassword123
    DB_NAME=school_db
    PORT=3000
    ```

---

## 🛠️ Step 3: Connect Database (`db.js`)

เราจะเขียน logic การเชื่อมต่อแยกออกมา เพื่อให้ไฟล์อื่น `require` ไปใช้ได้ง่ายๆ

```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

// Test Connection (Optional but Recommended)
pool.getConnection()
    .then(conn => {
        console.log("✅ Database connected successfully");
        conn.release(); // อย่าลืมคืน connection!
    })
    .catch(err => {
        console.error("❌ Database connection failed:", err.message);
    });

module.exports = pool;
```

---

## 🛠️ Step 4: Implement API (`index.js`)

เริ่มเขียน Server และ Endpoints กันเลย!

```javascript
const express = require('express');
const db = require('./db');
const app = express();

app.use(express.json()); // อ่าน JSON Body

// --- ROUTES ---

// 1. GET All Students (with Search & Active check)
app.get('/students', async (req, res) => {
    try {
        // ดึงเฉพาะคนที่ไม่โดนลบ (Soft Delete Check)
        const sql = 'SELECT * FROM students WHERE is_deleted = FALSE';
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. GET Single Student
app.get('/students/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // เพิ่มเงื่อนไข AND is_deleted = FALSE
        const sql = 'SELECT * FROM students WHERE id = ? AND is_deleted = FALSE';
        const [rows] = await db.query(sql, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: "Student not found" });
        }
        
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. POST Create Student
app.post('/students', async (req, res) => {
    const { first_name, last_name, age, email } = req.body;
    
    // 🛡️ Validation
    if (!first_name || !last_name || !email) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    
    // ตรวจสอบ Email Pattern อย่างง่าย
    if (!email.includes('@')) {
        return res.status(400).json({ error: "Invalid email format" });
    }

    try {
        const sql = 'INSERT INTO students (first_name, last_name, age, email) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(sql, [first_name, last_name, age, email]);
        
        res.status(201).json({
            id: result.insertId,
            message: "Student created successfully",
            student: { first_name, last_name, email }
        });

    } catch (err) {
        // Handle Duplicate Email Error (Code: ER_DUP_ENTRY)
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: "Email already exists" });
        }
        res.status(500).json({ error: err.message });
    }
});

// 4. PUT Update Student
app.put('/students/:id', async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, age, email } = req.body;

    try {
        // เช็คก่อนว่ามี user นี้ไหม และยังไม่โดนลบ
        const checkSql = 'SELECT * FROM students WHERE id = ? AND is_deleted = FALSE';
        const [checkRows] = await db.query(checkSql, [id]);
        
        if (checkRows.length === 0) {
            return res.status(404).json({ error: "Student not found" });
        }

        const sql = `UPDATE students SET first_name=?, last_name=?, age=?, email=? WHERE id=?`;
        await db.query(sql, [first_name, last_name, age, email, id]);

        res.json({ message: "Student updated successfully" });

    } catch (err) {
         res.status(500).json({ error: err.message });
    }
});

// 5. DELETE Student (Soft Delete)
app.delete('/students/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // แทนที่จะ DELETE เราจะ UPDATE is_deleted = TRUE
        const sql = 'UPDATE students SET is_deleted = TRUE WHERE id = ?';
        const [result] = await db.query(sql, [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Student not found" });
        }
        
        res.json({ message: "Student deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
```

---

## 🧪 Testing with Postman

ลองยิง Request ทดสอบดูครับ:

1.  **POST Create**: สร้างนักเรียนใหม่
2.  **GET All**: ต้องเห็นนักเรียนที่เพิ่งสร้าง
3.  **DELETE**: ลบนักเรียนคนนั้น
4.  **GET All**: (อีกรอบ) นักเรียนคนนั้น **ต้องหายไป** (แม้ใน Database จริงจะยังอยู่แต่ `is_deleted=1`)
5.  **GET Single**: ลอง GET ด้วย ID ที่เพิ่งลบไป ต้องได้ `404 Not Found`

---

## 🧩 Challenge: Search & Sort

ลองเพิ่ม Query String เข้าไปใน GET `/students`:
1.  `?search=Tony` -> หาคนชื่อ Tony
2.  `?sort=age_desc` -> เรียงตามอายุมากไปน้อย

**Hint**: ต้องแก้ SQL เป็น Dynamic โดยดูจาก `req.query`

::: details ✨ แนวทาง Query แบบ Dynamic
```javascript
// ตัวอย่าง (ระวัง SQL Injection ดีๆ นะครับ ถ้าต่อ string เอง)
let sql = 'SELECT * FROM students WHERE is_deleted = FALSE';
const params = [];

if (req.query.search) {
    // ต้องมีวงเล็บรอบ OR เพื่อไม่ให้ตีกับ is_deleted
    sql += ' AND (first_name LIKE ? OR last_name LIKE ?)';
    params.push(`%${req.query.search}%`, `%${req.query.search}%`);
}

if (req.query.sort === 'age_desc') {
    sql += ' ORDER BY age DESC';
}

const [rows] = await db.query(sql, params);
```
:::

---

> 👉 **บทต่อไป: [Module 8 - MongoDB & NoSQL](/node/08-01-mongodb-basics)**
