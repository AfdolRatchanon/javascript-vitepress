# 🛡️ Project 10: Secure API

โปรเจกต์นี้เราจะไม่สร้าง App ใหม่ครับ
แต่เราจะนำ API เดิม (เช่น Auth Project หรือ Blog Project) มา **"ชุบเกราะ"** ให้แข็งแกร่งขึ้น! 💪

> **Goal**: นำ API ที่มีอยู่ มาเพิ่ม Security Middleware ให้ครบเครื่อง


## 🛠️ Step 1: Install Security Packages

```bash
npm install helmet cors express-rate-limit xss-clean hpp
```
(แถม `xss-clean` ไว้กัน XSS และ `hpp` ไว้กัน HTTP Parameter Pollution ให้ด้วย)


## 🛠️ Step 2: Implement Shield (`server.js`)

สมมติว่านี่คือไฟล์ Server หลักของเรา เราจะเพิ่มเกราะเข้าไปทีละชั้น

```javascript
/* server.js */
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');

const app = express();

// --- 🛡️ SECURITY MIDDLEWARES ---

// 1. Set Security Headers (หมวกกันน็อค)
app.use(helmet());

// 2. Enable CORS (อนุญาตเฉพาะโดเมนที่กำหนด)
const whitelist = ['http://localhost:3000', 'https://my-production-site.com'];
app.use(cors({
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// 3. Rate Limiting (กันยิงรัว)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 นาที
  max: 100, // 100 requests per IP
  message: "Too many requests from this IP, please try again in 10 minutes"
});
app.use('/api', limiter);

// 4. Data Sanitization
app.use(express.json({ limit: '10kb' })); // บอดี้ห้ามเกิน 10kb
app.use(mongoSanitize()); // กัน NoSQL Injection (ลบเครื่องหมาย $ ออก)
app.use(xss()); // กัน XSS (convert code HTML)
app.use(hpp()); // กัน HTTP Parameter Pollution

// --- 🛣️ ROUTES ---
app.get('/api/welcome', (req, res) => {
    res.send("Hello Secure World!");
});

app.listen(3000, () => console.log('Secure Server running...'));
```


## 🧪 Testing Security

### 1. Rate Limit
- ลองกด F5 หรือยิง Postman รัวๆ เกิน 100 ครั้ง
- ครั้งที่ 101 ต้องเจอ Error `429 Too Many Requests` ✅

### 2. XSS
- ยิง POST พร้อม Body ที่มี HTML Tag `<script>alert('hack')</script>`
- Response ที่ได้ต้องไม่มี Tag html ที่ทำงานได้ติดมา ✅

### 3. NoSQL Injection
- ยิง Login ด้วย Body `{"email": {"$gt": ""}, "password": "..."}`
- `express-mongo-sanitize` จะลบเครืองหมาย `$` ออกไป ทำให้ Hack ไม่ได้ ✅


## 🧩 Challenge: Brute Force Protection

สร้าง Rate Limit ที่เข้มข้นสำหรับ Login:

```javascript
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 ชั่วโมง
  max: 5, // ผิดได้ 5 ครั้ง
  message: "Too many login attempts"
});

app.post('/auth/login', loginLimiter, loginHandler);
```


> 👉 **บทต่อไป: [Module 15: Capstone Project](/node/15-01-capstone)**
