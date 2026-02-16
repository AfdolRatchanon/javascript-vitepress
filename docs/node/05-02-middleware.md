# 05-2: Middleware (หัวใจของ Express) 💖

> **"Middleware functions are the lifeblood of an Express application."**
> — *Express.js Documentation*

ถ้าถามว่า "อะไรคือส่วนที่สำคัญที่สุดของ Express?" คำตอบคือ **Middleware** ครับ!
ถ้านึกภาพไม่ออก... ให้นึกถึง **"สายพานการผลิต" (Assembly Line)** ในโรงงาน 🏭

---

## 1. Middleware คืออะไร? (The Concept) 🧠

Middleware คือ **ฟังก์ชัน** ที่ทำงาน "คั่นกลาง" ระหว่าง Request และ Response
มันยืนเรียงกันเป็นแถว คอยตรวจเช็คหรือดัดแปลงข้อมูล ก่อนส่งไม้ต่อให้คนถัดไป

Request ➡️ **[Logger]** ➡️ **[CheckLogin]** ➡️ **[ProcessData]** ➡️ Response

### โครงสร้างของ Middleware
```javascript
const myMiddleware = (req, res, next) => {
    // 1. ทำงานบางอย่าง (เช่น เช็ค Login, Log ข้อมูล)
    console.log('Middleware working');

    // 2. ส่งไม้ต่อให้คนถัดไป (สำคัญมาก!)
    next(); 
};
```
*   `req`, `res`: เหมือนเดิม
*   `next`: เป็นฟังก์ชัน **"กดเพื่อไปต่อ"** ถ้าไม่เรียก `next()` Server จะค้าง! (Hang)

---

## 2. การใช้งาน Middleware (App-Level) 🛠️

ใช้คำสั่ง `app.use()` เพื่อติดตั้ง Middleware

### 2.1 Global Middleware (โดนทุก Route)
เช่น ฟังก์ชัน Log ว่ามีใครเข้ามาบ้าง

```javascript
// app.js
const express = require('express');
const app = express();

// 1. Logger Middleware (ทำงานก่อน Route เสมอ)
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next(); // อย่าลืมไปต่อ!
});

// 2. Route
app.get('/', (req, res) => {
    res.send('Home Page');
});

app.listen(3000);
```
เมื่อเข้าเว็บ Terminal จะขึ้น: `[10:30:00] GET /`

### 2.2 Route-Specific Middleware (โดนเฉพาะบาง Route)
เช่น ฟังก์ชันเช็คว่า "เป็น Admin หรือเปล่า?"

```javascript
const checkAdmin = (req, res, next) => {
    const isAdmin = req.query.admin === 'true'; // เช็คแบบง่ายๆ
    
    if (isAdmin) {
        next(); // ผ่าน! ไปต่อได้
    } else {
        res.status(403).send("🚫 Access Denied"); // ไม่ผ่าน ตัดจบตรงนี้!
    }
};

// ใส่เป็น Argument คั่นกลางได้เลย
app.get('/secret', checkAdmin, (req, res) => {
    res.send('💰 นี่คือความลับสุดยอด!');
});
```
*   เข้า `/secret` → 🚫 Access Denied
*   เข้า `/secret?admin=true` → 💰 นี่คือความลับสุดยอด!



### 2.3 Middleware Chaining (ร้อยเรียงกันเป็นสายโซ่) ⛓️
เราสามารถใส่ Middleware หลายตัวใน Route เดียวได้ โดยมันจะทำงาน **จากซ้ายไปขวา**

```javascript
const logRequest = (req, res, next) => {
    console.log('Request received');
    next();
};

const checkAuth = (req, res, next) => {
    if (req.query.token === '123') next();
    else res.status(401).send('Unauthorized');
};

// ทำ logRequest -> ทำ checkAuth -> ถ้าผ่านค่อยทำ function สุดท้าย
app.get('/dashboard', logRequest, checkAuth, (req, res) => {
    res.send('Dashboard Info');
});
```

---

## 3. Built-in Middleware ที่ต้องรู้ 📦

Express มี Middleware สามัญประจำบ้านที่ต้องใช้บ่อยๆ:

### 3.1 `express.json()`
สำคัญมาก! ถ้าไม่ใส่ตัวนี้ เราจะอ่าน `req.body` (จาก Form หรือ JSON) ไม่ได้เลย

```javascript
app.use(express.json()); // ช่วย Parse JSON body

app.post('/api/user', (req, res) => {
    // ถ้าไม่ใส่บรรทัดบน req.body จะเป็น undefined
    console.log(req.body); 
    res.send('Received');
});
```

### 3.2 `express.static()`
เสิร์ฟไฟล์ Static (เรียนไปแล้วในบทที่แล้ว)
```javascript
app.use('/static', express.static('public'));
```

---

## 4. Deep Dive: Error Handling Middleware 🚨

นี่คือ Middleware พิเศษที่มี **4 Arguments** (`err`, `req`, `res`, `next`)
Express จะมองหา function ที่มี 4 ตัวแปรนี้เพื่อจัดการ Error โดยเฉพาะ

```javascript
// Route ที่จงใจโยน Error
app.get('/broken', (req, res, next) => {
    // ส่ง Error ไปหา Error Handler
    next(new Error("Something went wrong!")); 
});

// ... Routes อื่นๆ ...

// Error Handler (ต้องไว้ล่างสุดของไฟล์!)
app.use((err, req, res, next) => {
    console.error("🔥 Error จับได้แล้ว:", err.message);
    res.status(500).send("Server มีปัญหานิดหน่อย ใจเย็นๆ นะ");
});
```

---

## 4.5 Deep Dive: Catching Async Errors (สำคัญมาก!) ⚠️

ใน Node.js สมัยใหม่ เรามักใช้ `async/await` แต่ Express v4 (เวอร์ชันปัจจุบัน) **ไม่รองรับ Async Error Handling โดย Default!**

ถ้ารหัสใน `async` function พัง Server จะ **Crash** ทันที และ Error Handler จะไม่ทำงาน

### วิธีแก้ 1: Try/Catch ทุกที่ (เหนื่อย) ❌
```javascript
app.get('/db', async (req, res, next) => {
    try {
        const data = await fakeDbQuery();
        res.json(data);
    } catch (err) {
        next(err); // ต้องส่ง err ไปเอง
    }
});
```

### วิธีแก้ 2: ใช้ `express-async-errors` (แนะนำ!) ✅
แพ็กเกจนี้จะช่วย "ปะยาง" ให้ Express v4 รองรับ Async ได้

```bash
npm install express-async-errors
```

```javascript
require('express-async-errors'); // ใส่ไวบนสุดของ app.js

// ทีนี้เขียน async ได้เลย ไม่ต้อง try/catch
app.get('/db', async (req, res) => {
    const data = await fakeDbQuery(); // ถ้าพังตรงนี้ มันจะกระโดดไป Error Handler เองอัตโนมัติ!
    res.json(data);
});
```

---

## 5. Middleware Ecosystem (Third-Party) 🌍

เราไม่ต้องเขียนเองทุกอย่าง โลก NPM มีของดีเพียบ:


*   **`morgan`**: Logger ขั้นเทพ (สีสวย ข้อมูลครบ)
*   **`cors`**: จัดการ CORS Headers ให้อัตโนมัติ (สำคัญมากเมื่อต่อกับ Frontend แยกโดเมน)
*   **`helmet`**: เพิ่ม Security Headers (Must-have สำหรับ Production)
*   **`cookie-parser`**: อ่าน Cookies (เพราะ Express ตัวเปล่าๆ อ่าน `req.cookies` ไม่ได้)

### 5.1 ตัวอย่างการใช้ `cookie-parser` 🍪
```bash
npm install cookie-parser
```

```javascript
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.get('/cookies', (req, res) => {
    console.log(req.cookies); // อ่านค่า Cookies ที่ Client ส่งมา
    res.send('Check console');
});
```

```bash
npm install morgan cors
```

```javascript
const morgan = require('morgan');
const cors = require('cors');

app.use(cors());          // เปิด CORS ทุก Domain
app.use(morgan('dev'));   // Log แบบสั้น
```

---

---

## 6. Deep Dive: Must-Have Third Party Middleware 📦

นอกจาก `morgan` และ `cors` แล้ว ยังมี "ของมันต้องมี" อีกหลายตัว:

### 6.1 `helmet` (Security Headers) 🛡️
ช่วยใส่ HTTP Headers ความปลอดภัยต่างๆ (เช่น XSS Protection) ให้เราอัตโนมัติ

```bash
npm install helmet
```
```javascript
const helmet = require('helmet');
app.use(helmet()); 
```

### 6.2 `compression` (Performance) 🚀
บีบอัด Response (Gzip) ก่อนส่งกลับ ทำให้เว็บโหลดเร็วขึ้น

```bash
npm install compression
```
```javascript
const compression = require('compression');
app.use(compression());
```

### 6.3 `express-rate-limit` (Anti-Spam) 🛑
จำกัดจำนวน Request ป้องกันคนยิงถล่ม Server (DDoS)

```bash
npm install express-rate-limit
```
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 100 // จำกัดแค่ 100 requests ต่อ IP
});

app.use(limiter);
```

---

## 7. Deep Dive: Writing Configurable Middleware 🎛️

บางทีเราอยากเขียน Middleware ที่ "ปรับค่าได้" (เหมือน `rateLimit({ max: 100 })`)
เทคนิคคือใช้ **Function ที่ Return Function** (Higher-Order Function)

```javascript
// สร้าง Middleware Factory
const loggerWithTag = (tag) => {
    return (req, res, next) => {
        console.log(`[${tag}] ${req.method} ${req.url}`);
        next();
    };
};

// เวลาใช้
app.use(loggerWithTag('API'));  // [API] GET /users
app.use(loggerWithTag('AUTH')); // [AUTH] POST /login
```

---

## 8. Advanced: Router-level Middleware 🚦

ถ้าไม่อยาก `app.use` (โดนทั้งแอป) เรา `use` ใส่ Router เฉพาะกลุ่มได้

```javascript
const router = express.Router();

// Middleware นี้จะทำงานเฉพาะ Routes ใน router นี้เท่านั้น
router.use((req, res, next) => {
    console.log('Router-specific Time:', Date.now());
    next();
});

router.get('/profile', (req, res) => { /* ... */ });
```

---

## 8.5 Best Practices for Middleware Order 📐

ลำดับการใส่ `app.use` มีผลต่อชีวิตมาก นี่คือลำดับมาตรฐานที่โลกยอมรับ:

1.  **Security & Tuning:** (`helmet`, `cors`, `compression`) — ใส่เกราะก่อน
2.  **Request Parsers:** (`express.json`, `cookie-parser`) — แปลงข้อมูลให้อ่านง่าย
3.  **Logger:** (`morgan`) — บันทึกว่าใครเข้ามา
4.  **Static Files:** (`express.static`) — ถ้าเป็นไฟล์รูป ให้ส่งเลยไม่ต้องผ่าน Middleware อื่น
5.  **Custom Middleware:** (Logic ของเรา)
6.  **Routes:** (`app.use('/api', routes)`)
7.  **404 Handler:** (ดักจับ Route ที่ไม่มีจริง)
8.  **Global Error Handler:** (ดักจับ Error จากทุกที่) — **ต้องอยู่ล่างสุดเสมอ!**

---

> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **Middleware:** ฟังก์ชันที่ทำงานคั่นกลางระหว่าง Request และ Response (หัวใจของ Express)
> *   **`next()`:** ฟังก์ชันที่ต้องเรียกเพื่อให้ Express ไปทำงาน Middleware ตัวถัดไป
> *   **`app.use()`:** คำสั่งติดตั้ง Middleware ลงใน Express App
> *   **Global Middleware:** Middleware ที่ทำงานในทุก Route (เช่น Logging, Body Parser)
> *   **Route-Specific Middleware:** Middleware ที่ทำงานเฉพาะ Route ที่ระบุ (เช่น Check Admin)
> *   **Third-party Middleware:** Middleware ที่คนอื่นเขียนไว้ให้แล้ว (เช่น `morgan`, `cors`, `helmet`)
> *   **Error Handling Middleware:** Middleware พิเศษรับ 4 arguments (`err`, `req`, `res`, `next`) ไว้จับ Error
> *   **`res.headersSent`:** Property ที่บอกว่า Response ถูกส่งไปหรือยัง (กัน Error "Headers already sent")

> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **Middleware:** ฟังก์ชันที่ทำงานคั่นกลางระหว่าง Request และ Response (หัวใจของ Express)
> *   **`next()`:** ฟังก์ชันที่ต้องเรียกเพื่อให้ Express ไปทำงาน Middleware ตัวถัดไป
> *   **`app.use()`:** คำสั่งติดตั้ง Middleware ลงใน Express App
> *   **Global Middleware:** Middleware ที่ทำงานในทุก Route (เช่น Logging, Body Parser)
> *   **Route-Specific Middleware:** Middleware ที่ทำงานเฉพาะ Route ที่ระบุ (เช่น Check Admin)
> *   **Third-party Middleware:** Middleware ที่คนอื่นเขียนไว้ให้แล้ว (เช่น `morgan`, `cors`, `helmet`)
> *   **Error Handling Middleware:** Middleware พิเศษรับ 4 arguments (`err`, `req`, `res`, `next`) ไว้จับ Error
> *   **Async Error Handling:** การจัดการ Error ใน `async/await` ซึ่ง Express v4 ต้องการตัวช่วย (เช่น `express-async-errors`)
> *   **Middleware Chaining:** การต่อ Middleware หลายตัวใน Route เดียว

## 10. Challenges 🏆

### 🎯 Challenge 1: The Gatekeeper 🚪
สร้าง Middleware `blockChrome`:
*   เช็ค `req.get('User-Agent')`
*   ถ้าเจอคำว่า "Chrome" ให้ส่ง 403 "Sorry, no Chrome allowed!"
*   ถ้าไม่ใช่ ให้ `next()` ไปหน้าปกติ
*   ลองเทสด้วย Chrome และ Edge (หรือ Postman)

::: details ✨ ดูเฉลย
```javascript
const blockChrome = (req, res, next) => {
    const ua = req.get('User-Agent');
    if (ua && ua.includes('Chrome')) {
        return res.status(403).send("Sorry, no Chrome allowed!");
    }
    next();
};
app.use(blockChrome);
```
:::

### 🎯 Challenge 2: Maintenance Mode 🚧
สร้างตัวแปร `isMaintenance = true`
สร้าง Global Middleware:
*   ถ้า `isMaintenance` เป็น true ให้ส่ง "Site under maintenance" (ทุก Route ต้องเจอหน้านี้)
*   ถ้าเป็น false ให้ใช้งานได้ปกติ

::: details ✨ ดูเฉลย
```javascript
let isMaintenance = true;

app.use((req, res, next) => {
    if (isMaintenance) {
        res.status(503).send("🚧 Site under maintenance");
    } else {
        next();
    }
});
```
:::

### 🎯 Challenge 3: Request Timer ⏱️
สร้าง Middleware ที่จับเวลาว่า Server ใช้เวลาประมวลผลนานแค่ไหน:
*   เก็บ `Date.now()` ตอนเริ่ม
*   ใช้ event `res.on('finish', ...)` เพื่อจับเวลาตอนจบ
*   Console log: `Process time: X ms`

::: details ✨ ดูเฉลย
```javascript
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`Request to ${req.url} took ${duration}ms`);
    });
    next();
});
```
:::

---

### 🎯 Challenge 4: The Spammer Blocker (หัวข้อ 6.3)
จงติดตั้ง `express-rate-limit` และตั้งค่าให้:
*   จำกัด 5 requests / 1 นาที
*   ถ้าเกิน ให้ส่งข้อความ "Too many requests, please try again later."

::: details ✨ ดูเฉลย
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 60 * 1000, 
    max: 5,
    message: "Too many requests, please try again later."
});
app.use(limiter);
```
:::

### 🎯 Challenge 5: Configurable Delay (หัวข้อ 7)
สร้าง Middleware ชื่อ `slowDown(ms)` ที่จะหน่วงเวลา Server (setTimeout) ตามจำนวนวินาทีที่กำหนด
*   `app.get('/fast', slowDown(0), ...)`
*   `app.get('/slow', slowDown(2000), ...)`

::: details ✨ ดูเฉลย
```javascript
const slowDown = (ms) => {
    return (req, res, next) => {
        setTimeout(() => {
            next();
        }, ms);
    };
};
```
:::

### 🎯 Challenge 6: Error Simulator (หัวข้อ 4)
สร้าง Route `/danger` ที่จะสุ่มเลข 1-10
*   ถ้าได้เลข < 5: ส่ง "Safe!"
*   ถ้าได้เลข >= 5: ให้โยน Error `new Error("Boom!")`
*   ต้องมี Error Handler Middleware คอยรับลูกระเบิด แล้วตอบ 500

::: details ✨ ดูเฉลย
```javascript
app.get('/danger', (req, res, next) => {
    if (Math.random() > 0.5) next(new Error("Boom!"));
    else res.send("Safe!");
});

app.use((err, req, res, next) => {
    res.status(500).send(`Caught error: ${err.message}`);
});
```
:::

### 🎯 Challenge 7: Helmet On! (หัวข้อ 6)
จงติดตั้งและใช้งาน `helmet` เพื่อเพิ่มความปลอดภัย

::: details ✨ ดูเฉลย
```javascript
const helmet = require('helmet');
app.use(helmet());
```
:::

---



---

👉 **[ไปต่อ: 5.3 - Project: RESTful API (Masterclass)](/node/05-project-rest-api)**
