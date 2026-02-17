# 🛡️ Project: Secure API

โปรเจกต์นี้เราจะไม่สร้าง App ใหม่ครับ
แต่เราจะนำ API เดิม (เช่น Auth Project หรือ Blog Project) มา **"ชุบเกราะ"** ให้แข็งแกร่งขึ้น! 💪

> **Goal**: นำ API ที่มีอยู่ มาเพิ่ม Security Middleware ให้ครบเครื่อง

---

## 🛠️ Step 1: Install Security Packages

```bash
npm install helmet cors express-rate-limit xss-clean hpp
```
(แถม `xss-clean` ไว้กัน XSS และ `hpp` ไว้กัน HTTP Parameter Pollution ให้ด้วย)

---

## 🛠️ Step 2: Implement Shield (`server.js`)

สมมติว่านี่คือไฟล์ Server หลักของเรา เราจะเพิ่มเกราะเข้าไปทีละชั้น

```javascript
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();

// --- 🛡️ SECURITY MIDDLEWARES ---

// 1. Set Security Headers (หมวกกันน็อค)
app.use(helmet());

// 2. Prevent XSS Attacks (กรอง <script> ออกจาก input)
app.use(xss());

// 3. Prevent HTTP Param Pollution (เช่นส่ง ?sort=asc&sort=desc มาซ้อนกัน)
app.use(hpp());

// 4. Enable CORS (อนุญาตเฉพาะโดเมนที่กำหนด)
const whitelist = ['http://localhost:3000', 'https://my-production-site.com'];
const corsOptions = {
  origin: function (origin, callback) {
    // !origin คืออนุญาตให้ Server-to-Server หรือ Postman ยิงได้
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};
app.use(cors(corsOptions));

// 5. Rate Limiting (กันยิงรัว)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 นาที
  max: 100, // 100 requests per IP
  message: "Too many requests from this IP, please try again in 10 minutes"
});
app.use('/api', limiter); // ใช้กับทุก Route ที่ขึ้นต้นด้วย /api

// --- 🌐 NORMAL MIDDLEWARES ---
app.use(express.json({ limit: '10kb' })); // จำกัดขนาด Body ไม่เกิน 10kb (กันบอมบ์ข้อมูล)


// --- 🛣️ ROUTES ---
app.get('/api/welcome', (req, res) => {
    res.send("Hello Secure World!");
});

// ลองยิง XSS ใส่
app.post('/api/comment', (req, res) => {
    // ถ้าส่ง body: { "text": "<script>alert('hack')</script>Hello" }
    // xss-clean จะแปลงเป็น "&lt;script&gt;..." หรือลบออกให้
    res.json({ received: req.body }); 
});

app.listen(3000, () => console.log('Secure Server running...'));
```

---

## 🧪 Testing Security

1.  **Rate Limit**:
    - ลองกด F5 หรือยิง Postman รัวๆ เกิน 100 ครั้ง
    - ครั้งที่ 101 ต้องเจอ Error `429 Too Many Requests` ✅

2.  **XSS**:
    - ยิง POST พร้อม Body ที่มี HTML Tag
    - Response ที่ได้ต้องไม่มี Tag html ที่ทำงานได้ติดมา ✅

3.  **CORS** (เทสยากหน่อยถ้าไม่มี Frontend):
    - ลองเขียนไฟล์ HTML แยกอีกไฟล์ แล้วใช้ Fetch ยิงมาที่ API
    - ถ้าเปิดไฟล์ HTML แบบ `file://` หรือรันคนละ Port ที่ไม่อยู่ใน Whitelist ต้องเจอ Error CORS ❌

---

## 🧩 Challenge: Login Brute Force Protection

Rate Limit แบบ Global มันกันได้ระดับนึง
แต่ถ้า Hacker **ค่อยๆ เดา Password** ทีละนิดล่ะ? (ไม่เกิน 100 ครั้งต่อ 10 นาที)

ลองสร้าง Rate Limit อีกตัวที่ **เข้มข้น** กว่า สำหรับ Route Login โดยเฉพาะ
- `windowMs`: 1 ชั่วโมง
- `max`: 5 ครั้ง
- แปะ middleware นี้แค่ที่ `app.post('/auth/login', loginLimiter, ...)`

::: details ✨ เฉลย
```javascript
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 ชั่วโมง
  max: 5, // ผิดได้ 5 ครั้ง
  message: "Too many login attempts, please try again after an hour"
});

app.post('/auth/login', loginLimiter, (req, res) => {
    // ... logic login ...
});
```
:::

---

> 👉 **บทต่อไป: [Module 12 - Capstone Project](/node/12-01-capstone)**
