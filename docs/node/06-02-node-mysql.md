# 6.2 Node.js & MySQL (Deep Dive) 🤝

> *"Data is the new oil."* — **Clive Humby**

ยินดีต้อนรับสู่โลกของ **Database** ครับ! 🗄️
ใน Module นี้เราจะมาเรียนรู้การใช้งาน **Relational Database (SQL)** ที่นิยมที่สุดในโลกตัวหนึ่ง นั่นคือ **MySQL** โดยเราจะเขียน Node.js ไปสั่งงานมันครับ



## 🐣 Analogy: Spreadsheet (Excel)

ถ้าคุณเคยใช้ Excel หรือ Google Sheets คุณก็เข้าใจ Database ไปครึ่งนึงแล้วครับ!

- **Database** = ไฟล์ Excel 1 ไฟล์ (Workbook)
- **Table** = แผ่นงาน (Sheet) 1 แผ่น (เช่น Sheet "Users", Sheet "Orders")
- **Column** = หัวตาราง (Field) เช่น Name, Age, Email (ต้องกำหนดประเภทข้อมูลล่วงหน้า)
- **Row** = ข้อมูลแต่ละบรรทัด (Record)

แต่ Database ทรงพลังกว่าตรงที่:
1.  **Scalability**: เก็บข้อมูลได้ **มหาศาล**
2.  **Relations**: **เชื่อมโยง** ข้อมูลข้ามตารางได้เก่งมาก
3.  **Strictness**: **เข้มงวด** เรื่องข้อมูล



## 🛠️ Setup: เชื่อมต่อ MySQL กับ Node.js

เราจะใช้ไลบรารีชื่อ `mysql2` ครับ

### 1. ติดตั้ง

```bash
npm install mysql2 dotenv
```

### 2. สร้าง Connection Pool (Deep Dive 🏗️)

ทำไมต้อง **Pool**? 🤔
การเปิด Connection (`connect()`) ไปยัง Database เป็นกระบวนการที่ "แพง" ครับ
**Connection Pool** เปรียบเสมือนเราจ้างพนักงานไว้ 10 คน (Connections) นั่งรอรับสายตลอดเวลา

```javascript
// db.js
const mysql = require('mysql2/promise'); // ใช้ Promise version
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true, // ถ้า connection เต็ม ให้รอคิว (ไม่ error)
  connectionLimit: 10,      // จำนวน Connection สูงสุดใน Pool
  queueLimit: 0             // จำนวนคิวที่รอได้ (0 = ไม่จำกัด)
});

module.exports = pool;
```



## 💻 การเขียน Query (Async/Await)

### 1. Read (SELECT)

```javascript
const db = require('./db');

async function getUsers() {
  try {
    // query() คืนค่า return เป็น array: [rows, fields]
    const [rows, fields] = await db.query('SELECT * FROM users');
    
    console.log(rows); 
    return rows;
  } catch (err) {
    console.error("Error fetching users:", err);
  }
}
```

### 2. Create (INSERT)

เวลารับข้อมูลจาก User **ห้าม** เอา string มาต่อกันเองเด็ดขาด!

```javascript
// ✅ CORRECT (Safe)
async function createUser(name, age) {
  const sql = 'INSERT INTO users (name, age) VALUES (?, ?)';
  
  // db.query(sql, [params]) -> mysql2 จะทำหน้าที่ sanitize ข้อมูลให้ (Prepared Statement)
  const [result] = await db.query(sql, [name, age]);
  
  console.log(`Created user with ID: ${result.insertId}`);
  return result.insertId;
}
```

### 3. Update (UPDATE)

```javascript
async function updateUser(id, newName) {
  const sql = 'UPDATE users SET name = ? WHERE id = ?';
  const [result] = await db.query(sql, [newName, id]);
  
  // result.affectedRows บอกจำนวนแถวที่ถูกแก้ไข
  console.log(`Updated ${result.affectedRows} rows`);
}
```

### 4. Delete (DELETE)

```javascript
async function deleteUser(id) {
  const sql = 'DELETE FROM users WHERE id = ?';
  const [result] = await db.query(sql, [id]);
  
  console.log(`Deleted ${result.affectedRows} rows`);
}
```



## 🔄 Transactions (ACID)

นี่คือจุดแข็งที่สุดของ SQL Database ครับ!
สมมติระบบโอนเงิน:
1.  หักเงินนาย A 100 บาท
2.  (Error!) 💥
3.  เพิ่มเงินนาย B 100 บาท

**Transaction** ช่วยให้เรามองข้อ 1, 2, 3 เป็น **"ก้อนเดียวกัน"**:
- ถ้าทำสำเร็จหมด -> **COMMIT** (บันทึกจริง)
- ถ้ามีอันไหนพัง -> **ROLLBACK** (ย้อนกลับเหมือนไม่เคยเกิดขึ้น)

```javascript
async function transferMoney(fromId, toId, amount) {
  const connection = await db.getConnection(); // ขอ Connection มาถือไว้เอง
  
  try {
    await connection.beginTransaction(); // เริ่ม Transaction

    // 1. หักเงิน A
    await connection.query('UPDATE accounts SET balance = balance - ? WHERE id = ?', [amount, fromId]);
    
    // 2. เพิ่มเงิน B
    await connection.query('UPDATE accounts SET balance = balance + ? WHERE id = ?', [amount, toId]);

    await connection.commit(); // ✅ สำเร็จ: บันทึกทั้งคู่
    console.log("Transfer successful!");

  } catch (err) {
    await connection.rollback(); // ❌ พัง: ยกเลิกทั้งหมด
    console.error("Transfer failed, rolled back:", err);
    throw err;
  } finally {
    connection.release(); // คืน Connection เข้า Pool
  }
}
```



## 🔍 WHERE Clause & Indexing

```sql
-- หาคนที่อายุ 20-30 และชื่อขึ้นต้นด้วย A
SELECT * FROM users WHERE age BETWEEN 20 AND 30 AND name LIKE 'A%';
```

::: tip 💡 Performance Tip: Indexing
ถ้าเราต้องค้นหาด้วย `email` บ่อยๆ (`WHERE email = ?`) เราควรสร้าง **Index** ให้ column email ครับ
Index เหมือน "สารบัญ" ท้ายเล่มหนังสือ ช่วยให้ Database ไม่ต้องเปิดหาทีละหน้า (Full Table Scan)
:::



## 📚 Glossary

| คำศัพท์ | ความหมาย |
|:--------|:---------|
| **RDBMS** | Relational Database Management System (เช่น MySQL) |
| **Primary Key** | คอลัมน์ที่ห้ามซ้ำ ใช้ระบุตัวตนของแถวนั้นๆ (มักจะเป็น `id`) |
| **Transaction** | การมัดรวมชุดคำสั่ง SQL ให้เป็นก้อนเดียว (ACID) |
| **SQL Injection** | เทคนิคการโจมตีเว็บโดยการแทรกคำสั่ง SQL ร้ายลงไปใน input |
| **Prepared Statement** | การเขียน SQL แบบแยกโครงสร้างกับข้อมูล (ใช้ `?`) เพื่อความปลอดภัย |



> 👉 **ไปต่อ: [Project: Inventory API](/node/06-project-inventory-api)**
