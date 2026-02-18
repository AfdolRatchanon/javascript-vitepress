# Module 10.3: Security Hardening 🛡️

> **"Security is not a feature, it's a state of mind."**

เราทำ API เสร็จแล้ว ใช้งานได้จริง... แต่เดี๋ยวก่อน! 🛑
ถ้าเรา Deploy ขึ้น Production ไปดื้อๆ ตอนนี้ API เราจะเหมือน **"บ้านที่ไม่ได้ล็อคประตู"** 🏠🔓
ใครจะยิง Request รัวๆ จน Server ล่ม (DDoS) หรือแอบอ่าน Header เพื่อหาช่องโหว่ก็ทำได้ง่ายๆ

ในบทนี้เราจะมา "เสริมเกราะ" ให้ Node.js API ของเรากันครับ


## 🔒 1. Helmet: ใส่หมวกกันน็อคให้ HTTP Headers

Express โดย Default จะส่ง Header `X-Powered-By: Express` กลับไป
ซึ่งบอก Hacker ว่า "เฮ้ย ฉันใช้ Express นะ ไปหาช่องโหว่ Express มาแฮ็กฉันสิ" 😱

**Helmet** เป็น Middleware ที่ช่วยจัดการ HTTP Headers ให้ปลอดภัยขึ้นโดยอัตโนมัติ

### Installation
```bash
npm install helmet
```

### Usage
```javascript
const helmet = require('helmet');
app.use(helmet());
```

### สิ่งที่ Helmet ทำให้เรา (ตัวอย่าง)
*   **Hide Powered-By**: ลบ `X-Powered-By` ทิ้ง
*   **HSTS**: บังคับใช้ HTTPS ตลอดเวลา
*   **XSS Filter**: ป้องกันการฝัง Script (Cross-Site Scripting) ใน Browser รุ่นเก่า
*   **No Sniff**: ป้องกัน Browser เดา Content Type เอง


## 🚦 2. Rate Limiting: ป้องกัน Spam/DDoS

ถ้ามีคนเขียน Script ยิง API เรา 1,000 ครั้ง/วินาที Server เราตายแน่นอน ☠️
เราต้องจำกัดการใช้งาน (Rate Limit) เช่น "IP นี้ยิงได้แค่ 100 ครั้งต่อ 15 นาทีนะ"

### Installation
```bash
npm install express-rate-limit
```

### Usage
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 นาที
    max: 100, // จำกัด 100 requests ต่อ IP
    message: 'Too many requests from this IP, please try again later.'
});

// บังคับใช้ทั้ง App
app.use(limiter);

// หรือบังคับใช้เฉพาะ Route ที่เสี่ยงๆ (เช่น Login)
app.use('/api/auth', limiter);
```


## 🌐 3. CORS (Cross-Origin Resource Sharing)

โดยปกติ Browser จะบล็อกไม่ให้เว็บ `domain-a.com` ยิง Ajax ไปหา `domain-b.com` เพื่อความปลอดภัย
ถ้า API เราอยู่คนละ Domain กับ Frontend เราต้องเปิด **CORS**

### Installation
```bash
npm install cors
```

### Usage (แบบเปิดหมด - ไม่แนะนำสำหรับ Prod)
```javascript
const cors = require('cors');
app.use(cors());
```

### Usage (แบบระบุ Domain - แนะนำ! ✅)
```javascript
const corsOptions = {
    origin: ['https://my-frontend.com', 'https://admin-panel.com'],
    methods: ['GET', 'POST'], // อนุญาตแค่ GET กับ POST
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```


## 🧹 4. Data Sanitization (ป้องกัน NoSQL Injection)

ถึงเราจะใช้ Mongoose แต่ถ้าเขียน Query ไม่ดีก็โดน Injection ได้
เช่น Hacker ส่ง `{"username": {"$gt": ""}}` (แปลว่า username อะไรก็ได้ที่มากกว่าค่าว่าง)
ผลคือ Login ผ่านเฉย! 😱

เราต้อง "ล้างข้อมูล" (Sanitize) ก่อนเอาไปใช้

### Installation
```bash
npm install express-mongo-sanitize xss-clean
```

### Usage
```javascript
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

// ป้องกัน NoSQL Injection (ลบ $ และ . ออกจาก input)
app.use(mongoSanitize());

// ป้องกัน XSS (ลบ HTML Tag <script> ออกจาก input)
app.use(xss());
```


## 📝 5. HPP (HTTP Parameter Pollution)

ถ้า Hacker ส่ง `?sort=price&sort=name` มา Express จะแปลงเป็น Array `['price', 'name']`
ซึ่งอาจทำให้ Logic เราพังได้ถ้าเราคาดหวัง String

### Installation
```bash
npm install hpp
```

### Usage
```javascript
const hpp = require('hpp');
app.use(hpp()); // จะเลือกเอาค่าสุดท้ายมาใช้แทน Array
```


## ⚡ 6. Challenge: The Fortress 🏰

**โจทย์**: ให้สร้างไฟล์ `middleware/security.js` ที่รวมทุกอย่างไว้ใน Function เดียว

```javascript
// middleware/security.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const setupSecurity = (app) => {
    // 1. Set Security Headers
    app.use(helmet());

    // 2. Rate Limiting
    const limiter = rateLimit({
        windowMs: 10 * 60 * 1000,
        max: 100
    });
    app.use('/api', limiter);

    // 3. Prevent NoSQL Injection & XSS
    app.use(mongoSanitize());
    app.use(xss());

    // 4. Prevent Parameter Pollution
    app.use(hpp());

    // 5. CORS
    app.use(cors({ origin: process.env.CLIENT_URL }));
};

module.exports = setupSecurity;
```


## 📚 FAQ

**Q: HTTPS จำเป็นไหม?**
A: **จำเป็นที่สุด!** ถ้าไม่มี HTTPS ข้อมูลทั้งหมด (Password, Token) จะถูกส่งเป็น Plain Text ใครดักฟัง (Sniff) ก็เห็นหมด ต่อให้ทำ Security Hardening ดีแค่ไหนก็ไร้ค่าถ้าไม่มี HTTPS

**Q: JWT เก็บที่ไหนปลอดภัยสุด?**
A:
*   **LocalStorage**: ง่าย แต่โดน XSS ขโมยได้
*   **HttpOnly Cookie**: ปลอดภัยจาก XSS แต่ต้องระวัง CSRF
*   แนะนำ **HttpOnly Cookie** ควบคู่กับ CSRF Protection ถ้าทำได้


👉 **[ไปต่อ: Module 11 - Performance & Caching](/node/11-01-performance-intro)**
