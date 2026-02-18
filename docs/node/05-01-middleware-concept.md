# Module 5.1: Middleware Concepts 🛣️

> **"If Route is the destination, Middleware is the journey."**

ในโลกของ Express.js คำว่า **Middleware** คือหัวใจสำคัญที่ทำให้ Framework นี้ทรงพลังและยืดหยุ่นมากๆ
ถ้าเปรียบ Controller เป็น "ปลายทาง" ที่ทำงานหลัก... Middleware ก็คือ "ด่านตรวจ" ระหว่างทาง
ที่คอยกรอง, ตรวจสอบ, หรือแปลงสภาพ Request ก่อนจะไปถึงปลายทาง

บทนี้จะพาคุณเจาะลึกระบบ Middleware แบบถึงแก่น (Deep Dive) ให้เข้าใจว่ามันทำงานยังไง และจะเขียนให้ Pro ได้ยังไงครับ

---

## 🏗️ 1. What is Middleware? (The Pipeline)

### Definition
**Middleware** คือ function ที่มีสิทธิ์เข้าถึง:
1.  **Request Object** (`req`) - ข้อมูลขาเข้า
2.  **Response Object** (`res`) - ข้อมูลขาออก
3.  **Next Function** (`next`) - คำสั่งให้ "ไปต่อ"

### The Request-Response Cycle
ปกติ Request จะวิ่งตรงไปหา Controller แล้วจบที่ Response
แต่ใน Express เราสามารถวาง Middleware ขวางทางไว้กี่ตัวก็ได้ เป็นเหมือน **ท่อ (Pipeline)**

```text
Request  ---> [ Middleware 1 ] ---> [ Middleware 2 ] ---> [ Controller ] ---> Response
                (Logger)              (Auth)              (Logic)
```

**หน้าที่ของ Middleware:**
*   **Execute Code**: รันโค้ดอะไรก็ได้ (เช่น `console.log`)
*   **Modify Req/Res**: แก้ไขข้อมูลใน `req` หรือ `res` (เช่น `req.user = decodedToken`)
*   **End Cycle**: จบการทำงานและส่ง Response กลับเลย (เช่น "คุณไม่มีสิทธิ์เข้าถึง!")
*   **Call Next**: ส่งไม้ต่อให้คนถัดไปทำงาน (`next()`)

---

## 🚦 2. Middleware Internals: How `next()` works

สิ่งที่หลายคนงงคือ `next()` มันคืออะไร?
มันคือ "Callback Function" ที่ Express ส่งมาให้เราเรียก

```javascript
function myMiddleware(req, res, next) {
    console.log('Middleware A: Start');
    
    // ทำงานบางอย่าง...
    
    next(); // <--- จุดเปลี่ยนชีวิต!
    
    // ถ้ามีโค้ดต่อจากนี้ มันจะรัน "หลังจาก" Middleware ตัวถัดไปทำงานเสร็จแล้ว (ในบางกรณี)
    // แต่ใน Express ปกติเราจะไม่เขียนโค้ดหลัง next()
}
```

### The Stack structure
Express เก็บ Middleware ทั้งหมดไว้ใน Array (Stack)
เมื่อมี Request เข้ามา มันจะ Loop เรียกทีละตัว
ถ้าตัวไหนลืมเรียก `next()`... **Browser จะหมุนติ้วๆ (Hang)** เพราะ Request ไปไม่ถึงเส้นชัย!

---

## 🎨 3. Types of Middleware

Express แบ่ง Middleware เป็น 5 ประเภทใหญ่ๆ ตามการใช้งาน:

### 3.1 Application-level Middleware
ใช้กับทั้ง App (`app.use`) จะทำงานกับ **ทุก Request** (หรือตาม path ที่ระบุ)
เหมาะสำหรับ Logic กลาง เช่น Logging, Security Headers, Body Parsing

```javascript
/* app.js */
const express = require('express');
const app = express();

// 1. Logger: ทำงานทุกครั้งที่มี request
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// 2. Body Parser: แปลง JSON
app.use(express.json());
```

### 3.2 Router-level Middleware
ใช้กับเฉพาะกลุ่ม Route นั้นๆ (`router.use`)
เหมาะสำหรับ Logic ที่ใช้แค่บาง Feature เช่น Auth สำหรับ Admin Module

```javascript
/* routes/admin.js */
const router = express.Router();

// ทำงานเฉพาะ request ที่เข้ามาทาง /admin/*
router.use((req, res, next) => {
    if (!req.isAdmin) { // สมมติ
        return res.status(403).send('Admins only!');
    }
    next();
});
```

### 3.3 Error-handling Middleware
พระเอกขี่ม้าขาว! ตัวนี้มี **4 Arguments**: `(err, req, res, next)`
Express จะรู้ทันทีว่าเป็น Error Handler และจะข้าม Middleware ปกติมาหาตัวนี้เมื่อเกิด Error

```javascript
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
```

### 3.4 Built-in Middleware
Express เตรียมมาให้แล้ว (ตั้งแต่ v4.x):
*   `express.static`: เสิร์ฟไฟล์ Static (รูป, css, js)
*   `express.json`: Parse JSON payload
*   `express.urlencoded`: Parse Form data (`x-www-form-urlencoded`)

### 3.5 Third-party Middleware
ของดีจากชุมชน (Community) ที่เรา `npm install` มาใช้:
*   `morgan`: HTTP request logger (สวยกว่าเขียนเอง)
*   `helmet`: Security headers (กัน XSS, Clickjacking)
*   `cors`: Cross-Origin Resource Sharing
*   `compression`: Gzip response

---

## 🛠️ 4. Advanced Middleware Patterns

### 🔹 The "Configurable Middleware" (Factory Pattern)
บางทีเราอยากส่ง Parameter ให้ Middleware (เช่น Role ที่อนุญาต)
เราต้องใช้ Function ที่ Return Function (Higher-Order Function)

```javascript
// Function หลักรับ config
const checkRole = (allowedRole) => {
    // Return Middleware ตัวจริง
    return (req, res, next) => {
        if (req.user.role === allowedRole) {
            next(); // ผ่าน
        } else {
            res.status(403).send('Forbidden'); // ไม่ผ่าน
        }
    };
};

// เวลาใช้
app.get('/delete-db', checkRole('admin'), deleteHandler);
app.get('/view-profile', checkRole('user'), viewHandler);
```

### 🔹 Request Enrichment (Context)
Middleware ไม่ใช่แค่ตรวจ แต่ "ฝากของ" ได้ด้วย
เรานิยมเพิ่ม Custom Property ใส่ `req` object เพื่อส่งข้อมูลไปให้ Controller

```javascript
const addTimestamp = (req, res, next) => {
    req.requestTime = Date.now();
    req.requestId = generateUUID(); // สร้าง ID ให้ request นี้ไว้ trace log
    next();
};

const controller = (req, res) => {
    // Controller ใช้งานได้เลย
    res.send(`Served at ${req.requestTime}`);
};
```

### 🔹 Conditional Middleware (Skip)
บางทีเราอยากรัน Middleware เฉพาะบางเงื่อนไข

```javascript
const unless = (paths, middleware) => {
    return (req, res, next) => {
        if (paths.includes(req.path)) {
            return next(); // ข้าม middleware นี้ไปเลย
        } else {
            return middleware(req, res, next); // รัน middleware ปกติ
        }
    };
};
```

---

## ⚠️ 5. Common Pitfalls & Best Practices

1.  **Losing the `return`**:
    *   Error ยอดฮิต: ส่ง Response แล้วแต่โค้ดยังรันต่อ
    *   ❌ `if (error) res.send('Error'); next();` => พัง! มันจะรัน next() ต่อทั้งที่ส่ง response แล้ว
    *   ✅ `if (error) return res.send('Error');`

2.  **Order Matters!**:
    *   Middleware ทำงานตามลำดับบรรทัด
    *   ถ้าเอา `errorHandler` ไปไว้บนสุด -> มันจะไม่ดักจับอะไรเลย
    *   ถ้าเอา `authMiddleware` ไว้หลัง `route` -> route นั้นจะไม่ถูก protect

3.  **Blocking the Loop**:
    *   อย่าเขียน Logic คำนวณหนักๆ (CPU Intensive) ใน Middleware
    *   เช่น `while(true)` หรือ loop 1 ล้านรอบ -> Node.js จะค้างทั้ง Server โดย Middleware ตัวเดียว

4.  **Async Middleware**:
    *   ถ้า Middleware เป็น `async` ต้องระวังเรื่อง Error Handling
    *   ✅ วิธีที่ถูก: `async (req, res, next) => { try { await ...; next(); } catch(err) { next(err); } }`
    *   (หรือใช้ `express-async-handler` มาช่วย)

---

## 🆚 Comparison: Express vs Koa (The Onion Model)

ถ้าคุณเคยได้ยิน Koa (Framework อีกตัวจากผู้สร้าง Express)
Core Concept เรื่อง Middleware จะต่างกันนิดหน่อย

*   **Express (Linear)**:
    *   ท่อตรงๆ: A -> B -> C -> Controller
    *   Response ส่งที่ Controller แล้วจบเลย

*   **Koa (Onion/Stack)**:
    *   หัวหอม: Request เจาะผ่าน A -> B -> C -> Controller
    *   **และ** C -> B -> A ตอนขาออกด้วย! (สามารถแก้ Response ขาออกได้ที่ Middleware A)
    *   Express ทำแบบนี้ได้ยากกว่า (ต้อง monkey patch `res.send`)

---

## ⚡ Challenge: Build Your Own "Morgan" 📝

จงเขียน Custom Middleware ชื่อ `myLogger` ที่ทำงานดังนี้:
1.  เก็บเวลาเริ่ม (Start Time)
2.  เรียก `next()`
3.  รอจนกว่า Request จะจบ (ใช้ Event `res.on('finish', ...)`)
4.  คำนวณเวลาที่ใช้ (Duration)
5.  Log ออกมา: `[GET] /api/users - 200 OK (25ms)`

::: details ✨ เฉลย
```javascript
const myLogger = (req, res, next) => {
    const start = Date.now(); // 1. จับเวลาเริ่ม

    // 3. ดักจับ Event ตอนส่ง Response เสร็จ
    res.on('finish', () => {
        const duration = Date.now() - start; // 4. คำนวณเวลา
        const status = res.statusCode;
        
        // 5. Log
        console.log(`[${req.method}] ${req.originalUrl} - ${status} (${duration}ms)`);
    });

    next(); // 2. ปล่อย request ไปทำงานต่อ
};

app.use(myLogger);
```
:::

---

## 📚 FAQ

**Q: ใช้ Middleware ซ้อนกันได้กี่ตัว?**
A: ไม่จำกัดครับ แต่ยิ่งเยอะยิ่งช้า (Overhead) ควรใช้เท่าที่จำเป็น

**Q: ถ้า Middleware ตัวแรกส่ง Response แล้ว ตัวที่ 2 จะทำงานไหม?**
A: ถ้าตัวแรกไม่เรียก `next()` ตัวที่ 2 ก็จะไม่ได้ทำงานครับ (ตัดจบ)

**Q: `app.use('/api', ...)` ต่างกับ `app.use(...)` ยังไง?**
A: แบบแรกจะทำงานเฉพาะ request ที่ขึ้นต้นด้วย `/api` (เช่น `/api/users`, `/api/products`)
ส่วนแบบหลังทำงานกับ **ทุก** request ใน Server (Global)

---

## 🔗 References
- [Express Middleware Guide](https://expressjs.com/en/guide/using-middleware.html) - คู่มือทางการ
- [Writing Middleware](https://expressjs.com/en/guide/writing-middleware.html) - วิธีเขียน Custom Middleware
- [Middleware Best Practices](https://strongloop.com/strongblog/best-practices-for-express-in-production-part-two-middleware/)

> 👉 **บทต่อไป: [Module 5.2 - Layered Architecture (MVC)](/node/05-02-layered-architecture)**
