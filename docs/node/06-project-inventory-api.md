# Project 6: Inventory API (MySQL) 📦

> **"Data integrity is everything."**

ในโปรเจกต์นี้ เราจะสร้าง **RESTful API** สำหรับระบบจัดการสต็อกสินค้า (Inventory Management) โดยใช้ **Node.js** เชื่อมต่อกับ **MySQL Database** จริงๆ งานนี้ไม่ได้เล่นๆ แล้วนะ! เราจะเน้นเรื่องความถูกต้องของข้อมูล (ACID) และประสิทธิภาพการเชื่อมต่อ


## 🎯 Project Goals (เป้าหมาย)

1.  **CRUD Operations**: สามารถ สร้าง, อ่าน, แก้ไข, และลบ สินค้าได้ครบถ้วน
2.  **Connection Pooling**: ใช้ `mysql2` pool เพื่อรองรับคนเข้าใช้งานเยอะๆ
3.  **Transactions**: เขียนระบบตัดสต็อกที่ปลอดภัย (ถ้าตัดไม่ผ่าน ต้องไม่เสียเงิน)
4.  **Soft Delete**: ลบแบบ "ซ่อน" (ไม่หายจริง) เพื่อเก็บประวัติ
5.  **Validation**: ตรวจสอบข้อมูลก่อนลง DB


## 🏗️ 1. Database Setup

เราจะออกแบบตาราง `products` ให้รองรับการทำงานแบบมืออาชีพ

### 1.1 Schema Design
*   `id`: Primary Key (Auto Increment)
*   `name`: ชื่อสินค้า (ห้ามซ้ำ)
*   `sku`: รหัสสินค้า (Unique)
*   `price`: ราคา (Decimal เพื่อความแม่นยำ)
*   `stock`: จำนวนคงเหลือ
*   `deleted_at`: เวลาที่ลบ (ถ้าเป็น NULL แปลว่ายังอยู่)

### 1.2 SQL Command (Run in Workbench/Adminer)

```sql
CREATE DATABASE IF NOT EXISTS inventory_db;
USE inventory_db;

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sku VARCHAR(50) NOT NULL UNIQUE,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
);

-- Seed Data (ข้อมูลตัวอย่าง)
INSERT INTO products (name, sku, price, stock) VALUES 
('Gaming Mouse', 'GM-001', 1250.00, 50),
('Mechanical Keyboard', 'KB-002', 2900.00, 20),
('Monitor 24"', 'MN-003', 4500.00, 10);
```


## 📂 2. Project Structure

จัดโครงสร้างแบบ MVC ย่อมๆ (แยก Route/Controller/Model)

```
inventory-api/
├── config/
│   └── db.js           <-- DB Connection Pool
├── controllers/
│   └── productController.js
├── routes/
│   └── productRoutes.js
├── .env                <-- เก็บ DB Credentials
├── app.js              <-- Entry Point
└── package.json
```

### Installation
```bash
npm init -y
npm install express mysql2 dotenv cors
```


## 💻 3. Implementation Code

### 3.1 `config/db.js` (The Connection Pool)
ทำไมต้อง Pool? เพราะการ Connect Database แต่ละครั้งนั้น "แพง" (ช้า) การมี Pool คือเปิดรอไว้หลายๆ เส้น ใครมาก็หยิบไปใช้ เสร็จแล้วก็คืน

```javascript
const mysql = require('mysql2/promise'); // ใช้ Promise Wrapper (async/await)
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'inventory_db',
    waitForConnections: true,
    connectionLimit: 10, // รองรับ 10 connections พร้อมกัน
    queueLimit: 0
});

// Test Connection
pool.getConnection()
    .then(conn => {
        console.log('✅ MySQL Connected successfully!');
        conn.release();
    })
    .catch(err => {
        console.error('❌ MySQL Connection Failed:', err.message);
    });

module.exports = pool;
```

### 3.2 `controllers/productController.js` (Logic)

```javascript
const db = require('../config/db');

// GET /products (ดูสินค้าที่ยังไม่ถูกลบ)
exports.getAllProducts = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM products WHERE deleted_at IS NULL');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /products/:id
exports.getProductById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM products WHERE id = ? AND deleted_at IS NULL', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /products (เพิ่มสินค้า)
exports.createProduct = async (req, res) => {
    const { name, sku, price, stock } = req.body;
    
    // Basic Validation
    if (!name || !sku || !price) {
        return res.status(400).json({ error: 'Please provide name, sku, and price' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO products (name, sku, price, stock) VALUES (?, ?, ?, ?)',
            [name, sku, price, stock || 0]
        );
        res.status(201).json({ id: result.insertId, msg: 'Product Created' });
    } catch (err) {
        // Handle Duplicate SKU
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'SKU already exists' });
        }
        res.status(500).json({ error: err.message });
    }
};

// PUT /products/:id (แก้ไข)
exports.updateProduct = async (req, res) => {
    const { name, price, stock } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE products SET name = ?, price = ?, stock = ? WHERE id = ? AND deleted_at IS NULL',
            [name, price, stock, req.params.id]
        );
        
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
        res.json({ msg: 'Product Updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE /products/:id (Soft Delete) 🗑️
exports.deleteProduct = async (req, res) => {
    try {
        // ไม่ใช่ DELETE FROM... แต่เป็น UPDATE เพื่อแปะเวลาลบ
        const [result] = await db.query(
            'UPDATE products SET deleted_at = NOW() WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
        res.json({ msg: 'Product Deleted (Soft)' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
```

### 3.3 `routes/productRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const controller = require('../controllers/productController');

router.get('/', controller.getAllProducts);
router.get('/:id', controller.getProductById);
router.post('/', controller.createProduct);
router.put('/:id', controller.updateProduct);
router.delete('/:id', controller.deleteProduct);

module.exports = router;
```

### 3.4 `app.js` (Main)

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const productRoutes = require('./routes/productRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);

// 404 Handler
app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Inventory API running on port ${PORT}`));
```


## 🧪 4. Testing Guide (Postman)

ทดสอบ API ของเราให้ครบทุก Flow:

1.  **Get All**: `GET http://localhost:3000/api/products`
    *   *Expect*: JSON Array ของสินค้า
2.  **Create**: `POST http://localhost:3000/api/products`
    *   *Body*: `{"name": "Headset", "sku": "HS-009", "price": 990, "stock": 100}`
    *   *Expect*: 201 Created
    *   *Try*: ยิงซ้ำด้วย SKU เดิม -> ต้องเจอ 409 Conflict
3.  **Update**: `PUT http://localhost:3000/api/products/1`
    *   *Body*: `{"name": "Gaming Mouse Pro", "price": 1500, "stock": 45}`
    *   *Expect*: 200 OK
4.  **Soft Delete**: `DELETE http://localhost:3000/api/products/1`
    *   *Expect*: 200 OK
    *   *Verify*: ลอง `GET /api/products/1` ต้องไม่เจอแล้ว (หรือ Get All ต้องไม่ติดมา)


## ⚡ 5. Challenge: Stock Deduction (Transaction) 🏆

โจทย์: สร้าง API `/api/products/checkout` เพื่อตัดสต็อกหลายชิ้นพร้อมกัน
ถ้าชิ้นไหน **ของไม่พอ** ให้ **Cancel ทั้งหมด**! (Rollback)

**Hint**:
```javascript
const connection = await pool.getConnection();
try {
    await connection.beginTransaction();

    // Loop check stock & Update stock
    // ถ้าเจอชิ้นไหน stock < request -> throw Error

    await connection.commit();
} catch(err) {
    await connection.rollback(); // ⏪ ย้อนเวลา!
} finally {
    connection.release();
}
```

::: details ✨ แนวทางคำตอบ
ศึกษาเรื่อง `connection.beginTransaction()` ให้ดี นี่คือท่าไม้ตายของระบบการเงินและ Inventory!
:::


## 📚 FAQ

**Q: ทำไมไม่ใช้ ORM (เช่น Sequelize/TypeORM)?**
A: การเขียน SQL ดิบ (Raw SQL) ทำให้เราเข้าใจการทำงานจริงๆ ของ Database, JOINs, และ Indexing ซึ่งเป็นพื้นฐานสำคัญก่อนไปใช้ ORM ที่ซ่อนความซับซ้อนพวกนี้ไว้ครับ

**Q: Soft Delete ดีกว่า Hard Delete ยังไง?**
A: ข้อมูลในโลกธุรกิจมีค่ามาก การลบทิ้ง (`DELETE FROM`) คือการทำลายหลักฐาน ถ้า User เผลอลบ หรือระบบมี Bug เราจะกู้คืนไม่ได้เลยถ้าไม่มี Backup. Soft Delete ช่วยให้เรา "Undelete" ได้ง่ายๆ แค่ set `deleted_at = NULL`


👉 **[ไปต่อ: Module 7 - MongoDB & NoSQL Basics](/node/07-01-mongodb-basics)**
