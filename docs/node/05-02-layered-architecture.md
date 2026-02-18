# Module 5.2: Layered Architecture 🍰

> **"Separation of Concerns is the key to maintainable software."**

คุณเคยเขียน Code แล้วไฟล์ `app.js` ยาวเป็น 1,000 บรรทัดไหม?
แก้ตรงนี้นิดเดียว แต่พังไปทั้งระบบ? นั่นคือสัญญาณของ "Spaghetti Code" 🍝
ในบทนี้เราจะมาจัดระเบียบ Code ด้วย **Layered Architecture** (สถาปัตยกรรมแบบแบ่งชั้น)


## 🧐 The Problem: Monolithic Function

ดู Code แบบเดิมที่เราเขียนกัน (Controller ทำทุกอย่าง):

```javascript
// ❌ BAD: Mixed Responsibilities
app.post('/register', async (req, res) => {
    // 1. Validate Input
    if (!req.body.username) return res.status(400).send('Error');

    // 2. Business Logic (Check duplicate)
    const exists = await db.query('SELECT * FROM users WHERE...');
    if (exists) return res.status(400).send('Duplicate');

    // 3. Database Operation (Insert)
    await db.query('INSERT INTO users...');

    // 4. Third-party Service (Email)
    await emailService.sendWelcomeEmail(req.body.email);

    res.json({ msg: 'Success' });
});
```

ปัญหาคือ:
1.  **ทดสอบยาก (Hard to Test)**: จะ Test Logic ยังไงโดยไม่ต่อ Database?
2.  **ใช้ซ้ำไม่ได้ (Not Reusable)**: ถ้าอยากสมัครสมาชิกผ่าน CLI หรือ WebSocket ต้องก๊อป Code ไปแปะหรอ?
3.  **อ่านยาก (Hard to Read)**: ผสมปนเปกันไปหมด


## 🏗️ The Solution: 3-Layer Architecture

เราจะแบ่งหน้าที่กันให้ชัดเจน เหมือนร้านอาหาร 👨‍🍳

| Layer | Responsibility | Analogy (Restaurant) |
| :--- | :--- | :--- |
| **1. Controller** (Presentation) | รับ Request, ตรวจสอบ Input, ส่ง Response | พนักงานเสิร์ฟ (รับออเดอร์) |
| **2. Service** (Business Logic) | ตัดสินใจ, คำนวณ, ตรวจสอบเงื่อนไขทางธุรกิจ | เชฟ (ปรุงอาหาร) |
| **3. Data Access** (Repository) | คุยกับ Database (SQL/NoSQL) เท่านั้น | คนจ่ายตลาด (หาวัตถุดิบ) |


## 💻 Implementation Example

มา Refactor ระบบ Register กันใหม่

### 1. Data Access Layer (`repositories/userRepository.js`)
หน้าที่: ยุ่งกับ Database อย่างเดียว (SQL/Mongoose)

```javascript
const db = require('../config/db');

class UserRepository {
    async findByEmail(email) {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    async createUser(userData) {
        const { username, email, password } = userData;
        return db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password]);
    }
}

module.exports = new UserRepository();
```

### 2. Service Layer (`services/userService.js`)
หน้าที่: Logic ล้วนๆ (ห้ามมี SQL, ห้ามมี req/res)

```javascript
const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcrypt');

class UserService {
    async register(userData) {
        // Business Logic 1: Check Duplicate
        const existingUser = await userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new Error('Email already taken');
        }

        // Business Logic 2: Hash Password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Call Repository
        return await userRepository.createUser({
            ...userData,
            password: hashedPassword
        });
    }
}

module.exports = new UserService();
```

### 3. Controller Layer (`controllers/userController.js`)
หน้าที่: คุยกับ HTTP (req, res)

```javascript
const userService = require('../services/userService');

exports.register = async (req, res) => {
    try {
        // 1. รับ Input
        const { username, email, password } = req.body;

        // 2. เรียก Service (เสิร์ฟออเดอร์เข้าครัว)
        await userService.register({ username, email, password });

        // 3. ส่ง Response
        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        // จัดการ Error ตามประเภท
        if (err.message === 'Email already taken') {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
```


## ⚔️ Before vs After

### Before Refactoring (Spaghetti) 🍝
*   ไฟล์เดียว 500 บรรทัด
*   แก้ SQL ทีต้องแก้ทั้งไฟล์
*   Test ไม่ได้เลย

### After Refactoring (Lasagna) 🍰
*   แยก 3 ไฟล์ ไฟล์ละ 20-30 บรรทัด
*   **Controller**: เปลี่ยน Web Framework (Express -> Fastify) ก็แก้แค่ไฟล์นี้
*   **Service**: เปลี่ยน Business Logic (เปลี่ยนวิธี Hash Password) ก็แก้แค่ไฟล์นี้
*   **Repository**: เปลี่ยน Database (MySQL -> PostgreSQL) ก็แก้แค่ไฟล์นี้
*   **Testable**: เราสามารถ Mock Repository เพื่อ Test Service ได้ง่ายๆ!


## 📂 Project Structure V2.0

โปรเจกต์เราจะเริ่มหน้าตาแบบนี้:

```text
src/
├── controllers/    <-- HTTP Handlers
├── services/       <-- Business Logic
├── repositories/   <-- Database Queries (Optional, บางทีรวมไว้ใน Model)
├── models/         <-- DB Schema
├── routes/         <-- URL Definitions
├── middlewares/    <-- Interceptors
├── utils/          <-- Helper Functions
├── config/         <-- Environment Config
└── app.js          <-- Entry Point
```


## ⚡ Challenge: Refactor Calculator 🧮

โจทย์: ลอง Refactor โค้ดนี้ให้เป็น Layered Architecture

```javascript
// app.js (The Monolith)
app.post('/add', (req, res) => {
    const { a, b } = req.body;
    if (a < 0 || b < 0) return res.status(400).send('Negative numbers not allowed');
    const result = a + b;
    db.saveLog(`Added ${a} + ${b}`);
    res.json({ result });
});
```

::: details ✨ Click to see Solution Structure
*   `CalculatorController.add`: รับ req -> ส่งให้ Service -> return res
*   `CalculatorService.add`: เช็ค a, b < 0 -> คำนวณ -> เรียก Logger
*   `LoggerRepository.save`: บันทึกลง DB
:::


## 📚 FAQ

**Q: จำเป็นต้องมี Repository ไหม?**
A: ถ้าใช้ ORM (เช่น Mongoose, Sequelize) ตัว Model มันทำหน้าที่คล้าย Repository อยู่แล้ว (มี `find`, `create`) อาจจะข้าม Layer นี้ไปเรียก Model ใน Service เลยก็ได้ เพื่อความรวดเร็ว (แต่ถ้าโปรเจกต์ใหญ่มากๆ การมี Repository มาคั่นกลางจะช่วยให้เปลี่ยน ORM ได้ง่ายขึ้น)

**Q: Logic เยอะๆ ควรไว้ไหน?**
A: **Service** ครับ! Controller ควรจะ "โง่" (Thin Controller) คือแค่ส่งของต่อ ส่วน Service ควรจะ "ฉลาด" (Fat Service) คือคิดทุกอย่าง


👉 **[ไปต่อ: Module 5.3 - Dependency Injection](/node/05-03-dependency-injection)**
