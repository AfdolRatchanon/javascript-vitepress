# 6.1 SQL Fundamentals (พื้นฐาน SQL) 🏛️

> *"Data is the new oil."* — **Clive Humby**

ยินดีต้อนรับสู่โลกของ **Relational Database** ครับ! 🗄️
ใน Module นี้เราจะมาเรียนรู้การใช้งาน **MySQL** ซึ่งเป็น Database ที่นิยมที่สุดในโลกตัวหนึ่ง


## 🐣 Analogy: Spreadsheet (Excel)

ถ้าคุณเคยใช้ Excel หรือ Google Sheets คุณก็เข้าใจ Database ไปครึ่งนึงแล้วครับ!

- **Database** = ไฟล์ Excel 1 ไฟล์ (Workbook)
- **Table** = แผ่นงาน (Sheet) เช่น Sheet "Students"
- **Column** = หัวตาราง (Field) เช่น Name, Age
- **Row** = ข้อมูลแต่ละบรรทัด (Record)
- **SQL** = ภาษาที่เราใช้สั่ง Excel ให้ทำงาน


## 🆚 SQL vs NoSQL

| Feature | SQL (Relational) | NoSQL (Non-Relational) |
|:---|:---|:---|
| **ตัวอย่าง** | MySQL, PostgreSQL | MongoDB, Redis |
| **โครงสร้าง** | Table (ตารางเป๊ะๆ) | Document (ยืดหยุ่น) |
| **ความสัมพันธ์** | JOIN (เชื่อมโยงเก่ง) | Embedded (ซ้อนทับ) |
| **เหมาะกับ** | ระบบการเงิน, บัญชี, สต็อก | Social Media, Chat, Logs |


## 📚 Introduction to SQL

**SQL (Structured Query Language)** คือภาษามาตรฐานสำหรับจัดการข้อมูล

### 1. DDL (Data Definition Language) - สร้างบ้าน 🏗️
คำสั่งกำหนดโครงสร้าง (Create, Drop, Alter)

#### สร้างตาราง (CREATE TABLE)
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY, -- ไอดี รันเลขเอง
    username VARCHAR(50) NOT NULL UNIQUE, -- ห้ามว่าง ห้ามซ้ำ
    email VARCHAR(100) NOT NULL UNIQUE,
    age INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. DML (Data Manipulation Language) - จัดของ 📦
คำสั่งจัดการข้อมูล (Insert, Select, Update, Delete)

#### เพิ่มข้อมูล (INSERT)
```sql
INSERT INTO users (username, email, age) 
VALUES ('somchai', 'som@chai.com', 25);
```

#### ดูข้อมูล (SELECT)
```sql
SELECT * FROM users; -- ดูทั้งหมด
SELECT username, email FROM users WHERE age > 20; -- กรองข้อมูล
```

#### แก้ไขข้อมูล (UPDATE)
```sql
UPDATE users SET age = 26 WHERE id = 1;
```
> ⚠️ **Warning:** อย่าลืม `WHERE` เด็ดขาด! ไม่งั้นแก้ทั้งตาราง

#### ลบข้อมูล (DELETE)
```sql
DELETE FROM users WHERE id = 1;
```


## 🌍 Real-World Use Case: Products Table

**โจทย์**: เก็บข้อมูลสินค้า (Products)

```sql
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock_qty INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```


## 🥊 Challenges 🏆

### 🎯 Challenge 1: Create Employees Table
จงเขียน SQL สร้างตาราง `employees`:
- `id` (PK)
- `name` (Text)
- `department` (Text)
- `salary` (Number)

::: details ✨ ดูเฉลย
```sql
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(50),
    salary DECIMAL(10, 2)
);
```
:::


👉 **[ไปต่อ: 6.2 - Node.js & MySQL Integration](/node/06-02-node-mysql)**
