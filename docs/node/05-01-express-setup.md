# 05-1: Express.js Basics (Framework ยอดนิยมอันดับ 1) 🚂

> **"Fast, unopinionated, minimalist web framework for Node.js"**
> — *Express.js Homepage*

ยินดีต้อนรับสู่โลกของ **Express.js**! 🎉
ที่ผ่านมาเราเขียน Server แบบ "ดิบๆ" (Native Node.js) ซึ่งก็ดีสำหรับการเรียนรู้ แต่ช้าและยุ่งยากสำหรับงานจริง
ตอนนี้เราจะมารู้จักกับ **Framework** ที่จะทำให้ชีวิตคุณง่ายขึ้น 10 เท่า!

---

## 1. ทำไมต้องใช้ Express? 🤔

ลองเปรียบเทียบงานง่ายๆ: **"รับ GET /hello แล้วตอบ JSON"**

### แบบ Native (http) : ❌
```javascript
const server = http.createServer((req, res) => {
    if (req.url === '/hello' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Hello" }));
    }
});
```
*   ต้องเช็ค URL เอง, Method เอง
*   ต้องเขียน Head เอง, Stringify เอง... เหนื่อย!

### แบบ Express : ✅
```javascript
app.get('/hello', (req, res) => {
    res.json({ message: "Hello" });
});
```
*   สั้น! กระชับ! อ่านรู้เรื่อง!

### 1.1 Comparison Table (ตารางเปรียบเทียบ)

| Feature | Native Node.js (`http`) | Express.js |
| :--- | :--- | :--- |
| **Routing** | Manual (`if/else` checks on URL) | Built-in (`app.get`, `app.post`) |
| **Middleware** | No built-in support | Core concept (Easy chaining) |
| **Request/Response** | Low-level (Streams) | High-level (Helper methods like `.json()`) |
| **Boilerplate** | High (Write everything yourself) | Low (Focus on business logic) |
| **Static Files** | Write manual file streaming logic | One line: `express.static()` |

> **Analogy:**
> *   **Node.js `http`** เหมือน "การสร้างบ้านเองจากอิฐทีละก้อน" 🧱 (ยืดหยุ่นแต่เหนื่อย)
> *   **Express.js** เหมือน "บ้านสำเร็จรูป" 🏠 (มีโครงสร้างมาให้แล้ว แค่ตกแต่งภายใน)

---

## 2. ติดตั้งและเริ่มโปรเจกต์ 🛠️

สร้างโฟลเดอร์ใหม่สำหรับบทนี้:
```bash
mkdir learn-express
cd learn-express
npm init -y
```

ติดตั้ง Express:
```bash
npm install express
```
*   (`npm i express` สั้นๆ ก็ได้)

---

## 3. Hello Express! (Server ตัวแรก) 🚀

สร้างไฟล์ `app.js`:

```javascript
// app.js
const express = require('express');
const app = express(); // สร้าง App Instance
const PORT = 3000;

// สร้าง Route แรก: GET /
app.get('/', (req, res) => {
    res.send('<h1>Express is Awesome! 🚂</h1>');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
```

รันด้วย `node app.js` แล้วเข้าเว็บดู... ง่ายไหมล่ะ?

---

## 4. Basic Routing (จัดการเส้นทาง) 🛣️

ใน Express เราแยก Route ตาม **Method** ได้เลย ไม่ต้องใช้ `if-else`:

### รูปแบบคำสั่ง
`app.METHOD(PATH, HANDLER)`

```javascript
// GET: ขอข้อมูล
app.get('/about', (req, res) => {
    res.send('About Page');
});

// POST: ส่งข้อมูล
app.post('/login', (req, res) => {
    res.send('Login Request Received');
});

// PUT: แก้ไขข้อมูล
app.put('/user', (req, res) => {
    res.send('Update User');
});

// DELETE: ลบข้อมูล
app.delete('/user', (req, res) => {
    res.send('Delete User');
});

// Catch All (404) - ต้องไว้ล่างสุด!
app.use((req, res) => {
    res.status(404).send('<h1>Page Not Found 😢</h1>');
});
```


### 4.2 Advanced Routing (เส้นทางขั้นสูง) 🧭

Express ไม่ได้ทำได้แค่ Route ธรรมดา แต่รองรับ **Pattern Matching** ด้วย!

#### String Patterns
```javascript
// ? = ตัวอักษรหน้ามีหรือไม่มีก็ได้
// แมตช์ทั้ง /acd และ /abcd
app.get('/ab?cd', (req, res) => res.send('ab?cd'));

// + = มีตัวซ้ำกี่ตัวก็ได้
// แมตช์ /efgh, /effgh, /effffgh
app.get('/ef+gh', (req, res) => res.send('ef+gh'));

// * = อะไรก็ได้ (Wildcard)
// แมตช์ /ab/random/cd
app.get('/ab*cd', (req, res) => res.send('ab*cd'));
```

#### Regular Expressions (Regex)
สำหรับคนที่ต้องการความแม่นยำขั้นสุด
```javascript
// แมตช์เฉพาะ URL ที่ลงท้ายด้วย .json
app.get(/.*\.json$/, (req, res) => {
    res.send('You requested a JSON file');
});

// แมตช์เฉพาะที่มีคำว่า "butterfly"
app.get(/butterfly/, (req, res) => {
    res.send('🦋 Butterfly Route');
});
```

### 4.3 Route Handlers (Multiple Callbacks)
หนึ่ง Route สามารถมีฟังก์ชันทำงานต่อกันได้หลายตัว (คล้าย Middleware)

```javascript
const cb0 = (req, res, next) => {
  console.log('CB0');
  next();
}

const cb1 = (req, res, next) => {
  console.log('CB1');
  next();
}

app.get('/example/b', [cb0, cb1], (req, res, next) => {
  console.log('response will be sent by the next function ...');
  next();
}, (req, res) => {
  res.send('Hello from D!');
});
```

---

## 5. `req` และ `res` ที่เก่งกว่าเดิม 💪

Express อัดฉีดพลังเพิ่มให้ `req` และ `res` ทำให้เราทำงานง่ายขึ้นเยอะ

### 5.1 Response Methods (`res`) 📤
| คำสั่ง | ทำหน้าที่ | ตัวอย่าง |
|:---|:---|:---|
| `res.send()` | ส่ง Text/HTML (ฉลาดรู้ว่าเป็นอะไร) | `res.send('<h1>Hi</h1>')` |
| `res.json()` | ส่ง JSON (Auto-stringify + Auto-header) | `res.json({ id: 1 })` |
| `res.status()` | กำหนด Status Code | `res.status(404).send('Not Found')` |
| `res.sendFile()` | ส่งไฟล์ (ต้องใช้ Absolute Path) | `res.sendFile(__dirname + '/index.html')` |
| `res.redirect()` | ย้ายหน้า | `res.redirect('/home')` |

### 5.2 Request Properties (`req`) 📥
| คำสั่ง | ทำหน้าที่ | ตัวอย่าง URL | ค่าที่ได้ |
|:---|:---|:---|:---|
| `req.query` | ดึง Query String | `/search?q=cat` | `{ q: 'cat' }` |
| `req.params` | ดึง Route Parameters | `/users/:id` | `{ id: '1' }` |
| `req.body` | ดึง Body (ต้องมี Middleware) | (POST info) | `{ name: 'Dolar' }` |
| `req.ip` | ดู IP ลูกค้า | - | `::1` |


### 5.3 Advanced Response Methods
นอกจาก `send` และ `json` ยังมีท่าไม้ตายอื่นอีก:

*   **`res.download(path)`:** ส่งไฟล์ให้ Browser ดาวน์โหลดทันที (Prompt Dialog)
    ```javascript
    app.get('/download', (req, res) => {
        res.download('/report-123.pdf', 'report.pdf'); 
    });
    ```
*   **`res.redirect(path)`:** สั่ง Browser ย้ายไปหน้าอื่น (HTTP 302/301)
    ```javascript
    app.get('/old-page', (req, res) => {
        res.redirect(301, '/new-page'); // 301 = Moved Permanently
    });
    ```
*   **`res.cookie(name, value, [options])`:** ฝังคุกกี้
    ```javascript
    res.cookie('token', '12345', { httpOnly: true, secure: true });
    ```

---

## 6. Route Parameters (Dynamic Routing) 🧬

การรับค่าจาก URL ทำได้ง่ายมากๆ แค่ใส่ `:` ไว้หน้าชื่อตัวแปร

```javascript
// URL: /products/123
app.get('/products/:id', (req, res) => {
    // Express ดึงค่า 123 มาใส่ req.params.id ให้เลย!
    const id = req.params.id;
    res.send(`Viewing Product ID: ${id}`);
});

// URL: /shop/shoes/nike (หลายตัวแปรก็ได้)
app.get('/shop/:category/:brand', (req, res) => {
    const { category, brand } = req.params;
    res.send(`Category: ${category} | Brand: ${brand}`);
});
```

---

## 7. Deep Dive: Serving Static Files 🖼️

ถ้าเราอยากเสิร์ฟไฟล์รูป, CSS, หรือ HTML โดยไม่ต้องเขียน Route แยกทีละไฟล์... Express มีท่าไม้ตาย:

```javascript
// บอกให้ Express รู้ว่า Folder 'public' เอาไว้เก็บไฟล์ Static
app.use(express.static('public'));
```

สมมติมีไฟล์ `public/style.css`
User สามารถเข้าถึงได้ทันทีที่: `http://localhost:3000/style.css`

> **Note:** "Static" หมายถึงไฟล์ที่ server ส่งไปให้ client "ตรงๆ" โดยไม่มีการแก้ไข code ข้างใน

---

## 8. Deep Dive: Express Behind the Scenes ⚙️

Express จริงๆ แล้วสร้างอยู่บน `http` module เดิมที่เราเรียนนั่นแหละ!
มันแค่นำมา "ห่อหุ้ม" (Wrapper) ให้ใช้งานง่ายขึ้น

```javascript
// สิ่งที่ Express ทำเบื้องหลัง (Pseudo-code)
http.createServer((req, res) => {
   // Express Magic:
   // 1. Parse URL & Method
   // 2. Loop หา Route ที่ตรง
   // 3. ถ้าเจอ -> เรียก Function เรา
   // 4. ถ้าไม่เจอ -> ส่ง 404
});
```

---

---

## 8. Deep Dive: Advanced Request & Response 📦

`req` และ `res` มีของเล่นให้เล่นมากกว่าที่คุณคิด!

### 8.1 Advanced `req` Properties
*   `req.ip`: ดู IP Address ของลูกค้า (มีประโยชน์มากเวลาทำ Rate Limit)
*   `req.secure`: เป็น `true` ถ้าลูกค้าเข้าผ่าน HTTPS
*   `req.xhr`: เป็น `true` ถ้าเป็นการเรียกผ่าน AJAX (เช่น `fetch` หรือ `axios`)
*   `req.protocol`: บอกว่าเป็น `http` หรือ `https`

```javascript
app.get('/whoami', (req, res) => {
    res.json({
        ip: req.ip,
        secure: req.secure,
        protocol: req.protocol
    });
});
```

### 8.2 Advanced `res` Methods
*   `res.cookie(name, value)`: ฝังคุกกี้ลง Browser
*   `res.clearCookie(name)`: ลบคุกกี้
*   `res.format()`: ตอบกลับตาม Content-Type ที่ลูกค้าขอ (Content Negotiation)

```javascript
app.get('/negotiate', (req, res) => {
    res.format({
        'text/plain': () => res.send('Just text'),
        'text/html': () => res.send('<p>HTML paragraph</p>'),
        'application/json': () => res.json({ msg: 'JSON object' }),
    });
});
```

---

## 9. Deep Dive: Environment Variables (`dotenv`) 🤫

เรา **ห้าม** Hardcode ค่าสำคัญๆ (เช่น Port, Database Password, API Keys) ลงในไฟล์ `app.js` เด็ดขาด!
มาตรฐานโลกคือเก็บไว้ในไฟล์ `.env` ที่ **ไม่ถูก Commit ขึ้น Git**

### 9.1 ติดตั้ง
```bash
npm install dotenv
```

### 9.2 สร้างไฟล์ `.env`
```env
PORT=5000
DB_HOST=localhost
API_KEY=123456secret
```

### 9.3 ใช้งานใน Project
```javascript
require('dotenv').config(); // บรรทัดแรกสุดของไฟล์!

console.log(process.env.PORT); // 5000
const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server on ${port}`));
```

> **Warning:** อย่าลืมใส่ `.env` ลงใน `.gitignore` เสมอ!

---

## 10. Deep Dive: Security Basics 🛡️

Express โดย Default ไม่ได้ป้องกันอะไรมากนัก มาดูพื้นฐานความปลอดภัยกัน:

### 10.1 Disable `x-powered-by`
โดยปกติ Express จะส่ง Header `X-Powered-By: Express` ไปบอกคนทั้งโลกว่า "ฉันใช้ Express นะ"
Hacker อาจใช้ข้อมูลนี้หาช่องโหว่เฉพาะเวอร์ชันได้ **ควรปิดซะ!**

```javascript
app.disable('x-powered-by');
```

---

## 11. Deep Dive: Server-Side Rendering (SSR) 🖥️

แม้ปัจจุบันเราจะนิยมใช้ React/Vue (Client-Side Rendering) แต่ Express ก็เก่งเรื่อง SSR มาก (โดยเฉพาะโปรเจกต์ SEO หรือ Internal Dashboard)

### Template Engines Loop
Express รองรับ Template Engine หลายตัว เช่น `EJS`, `Pug` (Jade), `Handlebars`

#### ติดตั้ง EJS
```bash
npm install ejs
```

#### การตั้งค่าใน App
```javascript
app.set('view engine', 'ejs');
// โดย Default จะมองหาไฟล์ .ejs ในโฟลเดอร์ views/
```

#### การใช้งาน
สร้างไฟล์ `views/index.ejs`:
```html
<h1>Hello, <%= name %></h1>
<ul>
  <% products.forEach(function(product){ %>
    <li><%= product.name %></li>
  <% }); %>
</ul>
```

Render จาก Route:
```javascript
app.get('/shop', (req, res) => {
    const products = [{ name: 'MacBook' }, { name: 'iPhone' }];
    res.render('index', { name: 'User', products: products });
});
```

---

## 12. Deep Dive: Debugging Express 🐞

เมื่อโปรเจกต์ใหญ่ขึ้น `console.log` อย่างเดียวอาจไม่พอ! Express ใช้ package ชื่อ `debug` ภายใน

### การเปิด Debug Mode
รันคำสั่งนี้ใน Terminal ก่อน start server:

**Windows (PowerShell):**
```powershell
$env:DEBUG='express:*'; node app.js
```

**Linux/Mac:**
```bash
DEBUG=express:* node app.js
```

สิ่งที่จะเห็นคือ **Log มหาศาล** ที่บอกทุกอย่างที่ Express ทำเบื้องหลัง (Matching Route, Path Resolution, Static File Serving) ช่วยแก้ปัญหา "ทำไม Route นี้ไม่ทำงาน" ได้ดีมาก!

---

> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **Express.js:** Web Framework สำหรับ Node.js ที่ช่วยจัดการ Routing และ Server ได้ง่าย
> *   **Routing:** การกำหนดเส้นทาง (URL) และ Method (GET, POST) ว่าจะให้ Server ทำอะไร
> *   **Middleware:** ฟังก์ชันที่ทำงานคั่นกลางระหว่าง Request และ Response
> *   **Static Files:** ไฟล์ที่ไม่เปลี่ยนแปลง (เช่น HTML, CSS, Images) ที่ Server ส่งให้ Client ได้เลย
> *   **Route Parameters:** ตัวแปรใน URL (เช่น `/users/:id`) ที่ช่วยให้ Route ยืดหยุ่น
> *   **Query String:** ค่าที่ส่งต่อท้าย URL (เช่น `?page=2`) เพื่อส่งข้อมูลเพิ่มเติม
> *   **Content Negotiation:** การที่ Server เลือกส่งรูปแบบข้อมูล (JSON/HTML) ตามที่ Client ขอ
> *   **`req.body`:** ข้อมูลที่ Client ส่งมาใน Body (ตัองใช้ Middleware ในการอ่าน)

> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **Express.js:** Web Framework สำหรับ Node.js ที่ช่วยจัดการ Routing และ Server ได้ง่าย
> *   **Routing:** การกำหนดเส้นทาง (URL) และ Method (GET, POST) ว่าจะให้ Server ทำอะไร
> *   **Middleware:** ฟังก์ชันที่ทำงานคั่นกลางระหว่าง Request และ Response
> *   **Static Files:** ไฟล์ที่ไม่เปลี่ยนแปลง (เช่น HTML, CSS, Images) ที่ Server ส่งให้ Client ได้เลย
> *   **Route Parameters:** ตัวแปรใน URL (เช่น `/users/:id`) ที่ช่วยให้ Route ยืดหยุ่น
> *   **Query String:** ค่าที่ส่งต่อท้าย URL (เช่น `?page=2`) เพื่อส่งข้อมูลเพิ่มเติม
> *   **Content Negotiation:** การที่ Server เลือกส่งรูปแบบข้อมูล (JSON/HTML) ตามที่ Client ขอ
> *   **Template Engine (SSR):** เครื่องมือที่ช่วยผสม Data เข้ากับ HTML ฝั่ง Server ก่อนส่งไป Client (เช่น EJS, Pug)
> *   **Regular Expression (Regex):** รูปแบบสัญลักษณ์พิเศษที่ใช้ค้นหาหรือกำหนด Pattern ของข้อความ (ใช้ใน Advanced Routing)

## 13. Challenges 🏆

### 🎯 Challenge 1: Basic Math API
สร้าง Route `/math/:op/:a/:b` โดยรับ params 3 ตัว:
*   `op`: ชื่อการคำนวณ (`add`, `sub`, `mul`)
*   `a`, `b`: ตัวเลข
*   ตอบกลับเป็น JSON `{ result: ... }`

ตัวอย่าง: `/math/add/10/5` → `{ result: 15 }`

::: details ✨ ดูเฉลย
```javascript
app.get('/math/:op/:a/:b', (req, res) => {
    const { op, a, b } = req.params;
    const numA = Number(a);
    const numB = Number(b);
    let result = 0;

    if (op === 'add') result = numA + numB;
    else if (op === 'sub') result = numA - numB;
    else if (op === 'mul') result = numA * numB;
    else return res.status(400).send('Invalid Operation');

    res.json({ result });
});
```
:::

### 🎯 Challenge 2: Search Query
สร้าง Route `/search` ที่รับ Query Param `?q=...`
*   ถ้ามี `q` ให้ส่ง: `"Searching for: [q]"`
*   ถ้าไม่มี `q` ให้ส่ง: `"Search term is missing"` (Status 400)

::: details ✨ ดูเฉลย
```javascript
app.get('/search', (req, res) => {
    const q = req.query.q;
    if (!q) {
        return res.status(400).send("Search term is missing");
    }
    res.send(`Searching for: ${q}`);
});
```
:::

### 🎯 Challenge 3: The Static Gallery
1. สร้างโฟลเดอร์ `public`
2. หารูปอะไรก็ได้ใส่เข้าไป `image.jpg`
3. เขียนโค้ด `express.static`
4. ลองเข้า `http://localhost:3000/image.jpg` ใน browser ว่าเห็นรูปไหม?

---

### 🎯 Challenge 4: Content Negotiator (หัวข้อ 8)
สร้าง Route `/welcome`:
*   ถ้า Client ขอ `application/json` → ตอบ `{"msg": "Welcome"}`
*   ถ้า Client ขอ `text/html` → ตอบ `<h1>Welcome</h1>`
*   ถ้าขอมั่วๆ → ตอบ "Welcome Human"

::: details ✨ ดูเฉลย
```javascript
app.get('/welcome', (req, res) => {
    res.format({
        json: () => res.json({ msg: "Welcome" }),
        html: () => res.send("<h1>Welcome</h1>"),
        default: () => res.send("Welcome Human")
    });
});
```
:::

### 🎯 Challenge 5: Secret Config (หัวข้อ 9)
1. สร้างไฟล์ `.env` เก็บค่า `SECRET_CODE=SuperSecret123`
2. สร้าง Route `/secret` ที่:
   *   อ่านค่าจาก `process.env.SECRET_CODE`
   *   ส่งกลับไปให้ User ดู (เฉพาะ Challenge นี้นะ ของจริงห้ามทำ!)

::: details ✨ ดูเฉลย
```javascript
// .env
// SECRET_CODE=SuperSecret123

// app.js
require('dotenv').config();

app.get('/secret', (req, res) => {
    res.send(`The secret is: ${process.env.SECRET_CODE}`);
});
```
:::

### 🎯 Challenge 6: IP Checker (หัวข้อ 8)
สร้าง Route `/my-ip` ที่ตอบกลับเป็น JSON:
`{ "yourIP": "..." }`
(ลองรัน Localhost อาจจะได้ `::1` คือ IPv6 ของ localhost)

::: details ✨ ดูเฉลย
```javascript
app.get('/my-ip', (req, res) => {
    res.json({ yourIP: req.ip });
});
```
:::

### 🎯 Challenge 7: Hacker Proof (หัวข้อ 10)
จงเขียนโค้ดเพื่อปิด Header `X-Powered-By` เพื่อไม่ให้ Hacker รู้ว่าเราใช้ Express

::: details ✨ ดูเฉลย
```javascript
app.disable('x-powered-by');
```
:::

---



---

👉 **[ไปต่อ: 5.2 - Middleware (หัวใจของ Express)](/node/05-02-middleware)**
