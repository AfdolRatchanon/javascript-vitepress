# 7.2 Node.js & MySQL

> *"Connecting the dots."*

หลังจากที่เราสร้าง Database และตารางใน MySQL Workbench หรือ Command Line ได้แล้ว
เป้าหมายต่อไปคือการให้ **Node.js Application** ของเราคุยกับ Database ได้ครับ
เช่น User กรอกฟอร์มสมัครสมาชิก -> Node.js รับข้อมูล -> บันทึกลง MySQL

ในบทนี้เราจะใช้ไลบรารีชื่อ **`mysql2`** ซึ่งเป็น Driver ยอดนิยมที่มีประสิทธิภาพสูงและรองรับ Promise (Async/Await) ครับ

---

## 🛠️ Setup Project

ก่อนอื่นเราต้องติดตั้ง package `mysql2` ครับ (ระวัง: มี package ชื่อ `mysql` เฉยๆ ด้วย แต่อันนั้นเก่าแล้ว ไม่แนะนำครับ)

```bash
npm install mysql2 dotenv
```
*(เราลง `dotenv` ด้วย เพื่อเก็บรหัสผ่าน Database ให้ปลอดภัยตามหลัก Security)*

### 1. Preparing Environment Variables
สร้างไฟล์ `.env` ใน Root Project (ห้าม Push ไฟล์นี้ขึ้น Git นะครับ!):

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=my_secret_password
DB_NAME=school_db
DB_PORT=3306
```

### 2. Creating Database Connection

เราสามารถเชื่อมต่อได้ 2 แบบคือ:
1.  **Single Connection**: เปิด-ใช้-ปิด เป็นครั้งๆ (ไม่แนะนำสำหรับ Web Server)
2.  **Connection Pool**: สร้าง "บ่อ" ของ Connection ไว้รอเรียกใช้ (แนะนำ! 🚀)

---

## 🐣 Analogy: Connection Pool (วินมอเตอร์ไซค์)

ลองจินตนาการว่า Database คือ **"ห้างสรรพสินค้า"** และ Node.js คือ **"หมู่บ้าน"**
เราต้องการส่งคน (Query) ไปซื้อของที่ห้าง

- **Single Connection**:
    - นาย A อยากไปซื้อของ -> **เดินไปซื้อรถ 1 คัน** -> ขับไปห้าง -> ซื้อของ -> กลับมา -> **ทิ้งรถ**
    - นาย B อยากไปบ้าง -> **เดินไปซื้อรถใหม่** -> ....
    - **ผลลัพธ์**: เปลืองเงิน เปลืองเวลาประกอบรถใหม่ทุกรอบ!

- **Connection Pool**:
    - หน้าหมู่บ้านมี **"วินมอเตอร์ไซค์"** (Pool) จอดรออยู่ 10 คัน
    - นาย A อยากไป -> **เรียกพี่วินคันที่ 1** -> ไปส่ง -> พี่วินกลับมารอที่วิน
    - นาย B อยากไป -> **เรียกพี่วินคันเดิม (หรือคันอื่นที่ว่าง)**
    - ถ้าคนเยอะกว่า 10 คน? -> คนที่ 11 ต้อง **"รอคิว"** จนกว่าจะมีพี่วินว่าง
    - **ผลลัพธ์**: เร็ว! ไม่ต้องสร้าง Connection ใหม่ทุกครั้ง บริหารจัดการทรัพยากรได้ดี

---

## 💻 Coding: Connection Pool Setup

สร้างไฟล์ `db.js` (หรือ `config/db.js`) เพื่อจัดการ Connection:

```javascript
// db.js
const mysql = require('mysql2');
require('dotenv').config();

// สร้าง Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10, // พี่วินมี 10 คัน
  queueLimit: 0        // คิวรอได้ไม่อั้น
});

// แปลงเป็น Promise-based (เพื่อให้ใช้ Async/Await ได้)
// ถ้าไม่ทำบรรทัดนี้ ต้องใช้ Callback hell แบบเก่า
const promisePool = pool.promise();

console.log('✅ MySQL Pool Created');

module.exports = promisePool;
```

---

## 🔄 CRUD using Async/Await

ทีนี้เรามาลองเขียน Code จัดการข้อมูลจริงๆ กันครับ

### 1. SELECT (Read)

```javascript
const db = require('./db');

async function getAllStudents() {
  try {
    // [rows, fields] = await ...
    // เราสนใจแค่ rows (ข้อมูลที่ได้) ส่วน fields คือ metadata
    const [rows, fields] = await db.query('SELECT * FROM students');
    
    console.log(rows); 
    // Output: [ { id: 1, name: 'Somchai', ... }, { ... } ]
    return rows;

  } catch (error) {
    console.error('❌ Error fetching students:', error.message);
  }
}
```

### 2. INSERT (Create) with Prepared Statements

สำคัญมาก! เวลาเราจะเอาข้อมูลจากตัวแปร (เช่น input จาก user) ไปใส่ใน Query
**ห้าม** เอา string มาต่อกันเองเด็ดขาด! (เสี่ยง SQL Injection)
ให้ใช้ **Placeholder (`?`)** แทนครับ

```javascript
/* ❌ แบบนี้อันตราย! ห้ามทำ!
   const sql = `INSERT INTO students (name) VALUES ('${userInput}')`; 
   // ถ้า user พิมพ์: x'); DROP TABLE students; --  .... จบเห่!
*/

// ✅ แบบที่ถูก: ใช้ ?
async function addStudent(name, age, grade) {
  try {
    const sql = 'INSERT INTO students (name, age, grade) VALUES (?, ?, ?)';
    const values = [name, age, grade]; // ใส่ค่าตามลำดับ ?

    const [result] = await db.query(sql, values);
    
    console.log('✅ Student added with ID:', result.insertId);
    return result.insertId;

  } catch (error) {
    console.error('❌ Error adding student:', error.message);
  }
}
```

### 3. UPDATE

```javascript
async function updateStudentGrade(id, newGrade) {
  try {
    const sql = 'UPDATE students SET grade = ? WHERE id = ?';
    const [result] = await db.query(sql, [newGrade, id]);

    // เช็คว่ามีแถวถูกกระทบจริงไหม (affectedRows)
    if (result.affectedRows === 0) {
      console.log('⚠️ Student not found');
      return false;
    }

    console.log('✅ Updated successfully');
    return true;

  } catch (error) {
    console.error('❌ Update failed:', error.message);
  }
}
```

### 4. DELETE

```javascript
async function deleteStudent(id) {
  try {
    const sql = 'DELETE FROM students WHERE id = ?';
    const [result] = await db.query(sql, [id]);

    if (result.affectedRows === 0) {
      console.log('⚠️ Student not found to delete');
    } else {
      console.log('✅ Deleted successfully');
    }

  } catch (error) {
    console.error('❌ Delete failed:', error.message);
  }
}
```

---

## 🌍 Real-World Pattern: Express + MySQL

การใช้งานจริงเรามักจะเขียนคู่กับ Express.js ครับ
นี่คือ Pattern ยอดนิยม (Controller Pattern):

```javascript
// app.js
const express = require('express');
const db = require('./db');
const app = express();

app.use(express.json()); // อย่าลืมบรรทัดนี้ เพื่ออ่าน JSON Body

// GET /students/123
app.get('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // เลือกมาแค่คนเดียว
    const [rows] = await db.query('SELECT * FROM students WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(rows[0]); // ส่งคืน Object คนแรก (เพราะ rows เป็น array)

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

---

## 🥊 Challenges

### Level 1: Find by Name (Search)
จงเขียนฟังก์ชัน `searchStudents(keyword)` ที่รับคำค้นหา
แล้วไปหาใน Database ว่ามีชื่อ (`name`) ที่ **"มีคำนี้ผสมอยู่"** ไหม
(ใบ้: ใช้ `LIKE` และ `%`)

::: details ✨ เฉลย
```javascript
async function searchStudents(keyword) {
  // ใส่ % หน้าหลัง เพื่อค้นหาแบบ "Contains"
  const searchTerm = `%${keyword}%`; 
  
  const sql = 'SELECT * FROM students WHERE name LIKE ?';
  // mysql2 จะแทนที่ ? ด้วย '%keyword%' อย่างปลอดภัย
  const [rows] = await db.query(sql, [searchTerm]);
  
  return rows;
}
```
:::

### Level 2: Soft Delete Implementation
จงเขียน Web API `DELETE /products/:id` ที่ไม่ใช่การลบจริง
แต่ให้ไป Update วันที่ใน column `deleted_at` ให้เป็นเวลาปัจจุบัน (`NOW()`) แทน

::: details ✨ เฉลย
```javascript
app.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // ใช้ NOW() ของ SQL ได้เลย
    const sql = 'UPDATE products SET deleted_at = NOW() WHERE id = ?';
    
    const [result] = await db.query(sql, [id]);
    
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    
    res.json({ message: 'Product soft deleted' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```
:::

---

## 📚 Glossary

| คำศัพท์ | ความหมาย |
|:--------|:---------|
| **Driver** | ไลบรารีที่ทำหน้าที่เป็นล่ามแปลภาษาโปรแกรม (JS) ให้คุยกับ Database ได้ (เช่น `mysql2`) |
| **Connection Pool** | เทคนิคการสร้าง Connection เตรียมไว้หลายๆ อันเพื่อลดเวลาในการเชื่อมต่อใหม่ |
| **Prepared Statement** | รูปแบบการเขียน SQL โดยใช้ Placeholder (`?`) แล้วส่งค่าแยกต่างหาก เพื่อป้องกัน SQL Injection |
| **SQL Injection** | การโจมตีโดยการแทรกคำสั่ง SQL ร้ายลงไปในช่องกรอกข้อมูล |
| **Environment Variable** | ตัวแปรระบบ (`process.env`) ใช้เก็บค่าความลับ (.env) เพื่อความปลอดภัย |
| **Result Set** | ผลลัพธ์ที่ได้จากการ Query (ใน mysql2 มักมาในรูปแบบ `[rows, fields]`) |

---

## 🔗 References

- [mysql2 Documentation](https://sidorares.github.io/node-mysql2/docs/documentation) - Official Docs ของ mysql2
- [Express Database Integration](https://expressjs.com/en/guide/database-integration.html) - คำแนะนำจาก Express
- [OWASP SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) - คู่มือป้องกัน SQL Injection

---

> 👉 **ไปต่อ: [Advanced SQL & Transactions](/node/07-03-advanced-sql)**
