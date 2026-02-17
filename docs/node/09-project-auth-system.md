# 🔐 Project: Secure Auth System

ในที่สุดเราก็จะสร้าง API ที่ "ปลอดภัย" กันสักที!
โปรเจกต์นี้เราจะสร้างระบบ **Register / Login** ที่เก็บ Password แบบปลอดภัย (Hash) และใช้ **JWT** ในการยืนยันตัวตนเพื่อเข้าถึงข้อมูลลับ

> **Tech Stack**:
> - Express.js
> - Mongoose (MongoDB)
> - bcryptjs (Hashing)
> - jsonwebtoken (JWT)

---

## 🎯 เป้าหมาย (Goal)

| Method | Endpoint | Access | Description |
|:-------|:---------|:-------|:------------|
| `POST` | `/auth/register` | Public | สมัครสมาชิก (Hash password) |
| `POST` | `/auth/login` | Public | เข้าสู่ระบบ (รับ JWT Token) |
| `GET` | `/profile` | **Private** | ดูข้อมูลส่วนตัว (ต้องมี Token) |

---

## 🛠️ Step 1: User Model (`models/User.js`)

เราต้องสร้าง Model User เพื่อเก็บ username และ password

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // เดี๋ยว Hash ก่อนเก็บ
    role: { type: String, default: 'user' }
});

module.exports = mongoose.model('User', userSchema);
```

---

## 🛠️ Step 2: Main Server Setup (`index.js`)

```javascript
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');

const app = express();
app.use(express.json());

// Connect DB... (เหมือนเดิม)
mongoose.connect(process.env.MONGO_URI);

const SECRET_KEY = process.env.JWT_SECRET || 'secret123';

// --- Routes ---

// 1. REGISTER
app.post('/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // เช็คก่อนว่ามี user นี้หรือยัง
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" });
        }

        // 🔐 Hashing Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // สร้าง User ใหม่
        const newUser = await User.create({
            username,
            password: hashedPassword
        });

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. LOGIN
app.post('/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. หา User
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        // 2. เช็ค Password (เทียบ Plain vs Hash)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid password" });
        }

        // 3. สร้าง JWT Token
        const token = jwt.sign(
            { id: user._id, role: user.role }, // Payload
            SECRET_KEY,                        // Secret Key
            { expiresIn: '1h' }                // Options
        );

        res.json({ token, message: "Login successful" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Middleware ---
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']; // format: "Bearer <token>"
    
    if (!token) return res.status(403).json({ error: "Access denied" });

    try {
        // ตัดคำว่า "Bearer " ออก (ถ้ามี)
        const bearer = token.startsWith('Bearer ') ? token.slice(7) : token;
        
        const verified = jwt.verify(bearer, SECRET_KEY);
        req.user = verified; // แปะข้อมูลลง req
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};

// 3. PROTECTED ROUTE
app.get('/profile', verifyToken, async (req, res) => {
    // req.user มาจาก Middleware
    // เราสามารถใช้ ID ไปค้นข้อมูลเพิ่มเติมจาก DB ได้
    const user = await User.findById(req.user.id).select('-password'); // ไม่เอา field password
    
    res.json({ 
        message: "This is a private profile", 
        user: user 
    });
});

app.listen(3000, () => console.log('Server running'));
```

---

## 🧪 Testing with Postman

ต้องเทสเป็นลำดับนะครับ:

1.  **Register (`POST /auth/register`)**:
    - Body: `{ "username": "admin", "password": "123" }`
    - ไปดูใน MongoDB Compass จะเห็น Password เป็น `$2a$10$...` (อ่านไม่ออก) ✅

2.  **Login (`POST /auth/login`)**:
    - Body: `{ "username": "admin", "password": "123" }`
    - Response: จะได้ `{ "token": "eyJhbGciOi..." }`
    - **Copy Token นี้ไว้!** 📋

3.  **Access Profile (`GET /profile`)**:
    - ถ้ากด Send เลย -> ❌ `403 Access denied`
    - ให้ไปที่ Tab **Headers**
    - Key: `Authorization`
    - Value: `Bearer <วาง Token ที่ก๊อปมา>`
    - กด Send -> ✅ เห็นข้อมูล User!

---

## 🧩 Challenge: Refresh Token

JWT ปกติเราตั้งอายุไว้สั้น (เช่น 15 นาที - 1 ชม.) เพื่อความปลอดภัย
แต่ถ้า User ต้องล็อกอินใหม่ทุก 15 นาที คงน่ารำคาญแย่

**โจทย์ระดับสูง:**
ลองศึกษาเรื่อง **Refresh Token** ดูครับ
- ตอน Login ให้สร้าง 2 tokens: `accessToken` (สั้น) และ `refreshToken` (ยาว)
- เก็บ `refreshToken` ไว้ใน DB หรือ HTTP-Only Cookie
- สร้าง Endpoint `/auth/refresh` เพื่อขอ `accessToken` ใหม่โดยใช้ `refreshToken`

(หัวข้อนี้ยากหน่อย แต่เป็นท่ามาตรฐานใน Production ครับ)

---

> 👉 **บทต่อไป: [Module 10 - File Upload](/node/10-01-file-upload)**
