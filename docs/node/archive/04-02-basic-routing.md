# 04-2: Basic Routing (การจัดการเส้นทาง) 🛣️

> **"Routing refers to how an application’s endpoints (URIs) respond to client requests."**
> — *Express.js Guide*

ในบทที่แล้ว Server เราตอบ "Hello World" ให้ทุกคนเหมือนกันหมด ไม่ว่าจะเข้าลิงก์ไหน...
แต่ในความเป็นจริง เว็บไซต์ต้องมีหลายหน้า ใช่ไหมครับ?
*   `/` → หน้าแรก (Home)
*   `/about` → หน้าเกี่ยวกับเรา
*   `/api/products` → ข้อมูลสินค้า

กระบวนการที่ Server เลือกว่า **"URL นี้ ต้องทำงานอะไร"** เรียกว่า **Routing** ครับ

---

## 1. Routing คืออะไร? (The Logic) 🧠

โดยปกติถ้าเราใช้ Framework (เช่น Express.js) มันจะมีคำสั่งง่ายๆ ให้ใช้ แต่ในบทนี้เราจะ **เขียนสด (Raw Node.js)** เพื่อให้เข้าใจไส้ในของมัน!

Logic พื้นฐานคือการเช็ค **`if-else`** หรือ **`switch-case`** ที่ `req.url` และ `req.method`:

```javascript
if (req.url === '/' && req.method === 'GET') {
    // ส่งหน้า Home
} else if (req.url === '/login' && req.method === 'POST') {
    // ทำการ Login
} else {
    // ส่งหน้า 404 Not Found
}
```

> **💡 Analogy (เปรียบเทียบ): โอเปอเรเตอร์รับสาย** ☎️
>
> Server เหมือน Call Center:
> *   ลูกค้าโทรมา (Request)
> *   โอเปอเรเตอร์ถาม: "ติดต่อเรื่องอะไรคะ?" (เช็ค URL)
> *   "ติดต่อฝ่ายขาย" → โอนสายไปแผนกขาย (Route `/sales`)
> *   "แจ้งซ่อม" → โอนสายไปช่าง (Route `/repair`)
> *   ถ้าพูดไม่รู้เรื่อง → "ขออภัยค่ะ ไม่มีแผนกนี้" (Route `404`)

---

## 2. การทำ Routing อย่างง่าย (Manual Routing) 🛠️

มาลองเขียนโค้ดกัน สร้างไฟล์ `router.js`:

```javascript
// router.js
const http = require('http');

const server = http.createServer((req, res) => {
    // normalize URL: ตัด query string ออก (เช่น /search?q=cat → /search)
    // แต่วิธีนี้แบบบ้านๆ เดี๋ยวเราจะใช้วิธีที่ดีกว่าในหัวข้อถัดไป
    const path = req.url; 
    const method = req.method;

    console.log(`${method} request to ${path}`);

    // กำหนด Header กลาง (ว่าเป็น HTML)
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    // Routing Logic
    if (path === '/' || path === '/home') {
        res.statusCode = 200;
        res.end('<h1>🏠 Home Page</h1><p>ยินดีต้อนรับสู่บ้านของเรา</p>');
    } 
    else if (path === '/about') {
        res.statusCode = 200;
        res.end('<h1>ℹ️ About Us</h1><p>เราคือโปรแกรมเมอร์ Node.js รุ่นใหม่ไฟแรง</p>');
    } 
    else if (path === '/api/user') {
        // กรณีเป็น API ให้เปลี่ยน Type เป็น JSON
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        
        const user = { name: "Somchai", role: "Admin" };
        res.end(JSON.stringify(user));
    } 
    else {
        // กรณีไม่เจอหน้าไหนเลย (404)
        res.statusCode = 404;
        res.end('<h1 style="color:red">404 Not Found 🚫</h1><p>หาหน้านี้ไม่เจอจ้า</p>');
    }
});

server.listen(3000, () => console.log('Server routes ready at http://localhost:3000'));
```

### ทดลองเข้า URL ต่างๆ:
1.  `http://localhost:3000/` → เจอหน้า Home 🏠
2.  `http://localhost:3000/about` → เจอหน้า About ℹ️
3.  `http://localhost:3000/api/user` → เจอ JSON `{ "name": "Somchai" }` 📝
4.  `http://localhost:3000/mario` → เจอ 404 Not Found 🚫

---

## 3. จัดการ URL ขั้นเทพด้วย `new URL()` Object 🌐

ปัญหาของ `req.url` คือมันมาพร้อม **Query String** (ส่วนที่อยู่หลัง `?`)
เช่นถ้าเข้า `http://localhost:3000/search?q=cat`:
*   `req.url` จะเป็น `"/search?q=cat"`
*   ถ้าเราเช็ค `if (req.url === '/search')` → **จะหาไม่เจอ!** 😱

วิธีแก้ที่ถูกต้องในปี 2024+ คือใช้ **`new URL()`** object (Standard API):

```javascript
// advanced-router.js
const http = require('http');

const server = http.createServer((req, res) => {
    // 1. สร้าง URL Object
    // req.headers.host = "localhost:3000"
    // req.url = "/search?q=cat&limit=10"
    const myUrl = new URL(req.url, `http://${req.headers.host}`);

    // 2. ดึงข้อมูลที่ต้องการ
    const pathname = myUrl.pathname; // "/search" (ตัด query string ออกแล้ว!)
    const query = myUrl.searchParams; // ตัวจัดการ query string

    console.log(`Path: ${pathname}`);
    console.log(`Query: ${query.get('q')}`);

    if (pathname === '/search') {
        const keyword = query.get('q') || 'nothing'; // ดึงค่า q
        res.end(`<h1>Search Results for: ${keyword}</h1>`);
    } else {
        res.end('Hello!');
    }
});

server.listen(3000);
```

### `searchParams` ทำอะไรได้บ้าง?
สมมติ URL คือ `/shop?category=shoes&sort=price`
*   `myUrl.searchParams.get('category')` → "shoes"
*   `myUrl.searchParams.has('sort')` → true
*   `myUrl.searchParams.getAll('color')` → (ถ้ามีหลายค่า)

---

## 4. Serving HTML Files (อ่านไฟล์ส่งไป) 📄

ในชีวิตจริงเราคงไม่เขียน HTML ใส่ใน `res.end('<h1>...</h1>')` เพราะมันรกและแก้ยาก
เราควร **อ่านไฟล์ .html** แล้วส่งไปแทน!

ใช้ module `fs` ที่เรียนมาในบทที่ 3 มาช่วย:

1. สร้างไฟล์ `index.html`:
```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<body>
    <h1>Welcome from File! 📂</h1>
    <p>This page is served by Node.js</p>
</body>
</html>
```

2. เขียน Server `file-server.js`:
```javascript
// file-server.js
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        // อ่านไฟล์
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
            if (err) {
                // กรณีอ่านไฟล์ไม่ได้ (เช่นไฟล์หาย)
                res.writeHead(500);
                res.end('Error loading file');
            } else {
                // ส่งไฟล์สำเร็จ
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content);
            }
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(3000);
```

> **💡 Note:** การทำแบบนี้คือพื้นฐานของ **Static Site Server** (เหมือนที่เราใช้ Live Server ใน VS Code)

---

## 5. Switch-Case vs Object Lookup (Best Practice?) 🏆

เมื่อ Route เยอะขึ้น `if-else` จะยาวเป็นหางว่าว...
โปรแกรมเมอร์เก่งๆ มักใช้ **Object Lookup** แทน เพื่อความสะอาดและเร็ว (O(1)):

### แบบ Object Router Structure

```javascript
// clean-router.js
const routes = {
    '/': (req, res) => {
        res.end('Home Page');
    },
    '/about': (req, res) => {
        res.end('About Page');
    },
    '/contact': (req, res) => {
        res.end('Contact Us');
    }
};

const server = http.createServer((req, res) => {
    // ค้นหาฟังก์ชันใน object routes
    const handler = routes[req.url];

    if (handler) {
        handler(req, res); // เจอ Route → เรียกใช้งานฟังก์ชัน
    } else {
        res.statusCode = 404;
        res.end('404 Not Found'); // ไม่เจอ
    }
});
```

---

---

## 6. Deep Dive: Anatomy of a URL 🧬

URL (Uniform Resource Locator) ไม่ได้มีแค่ Path! มาชำแหละโครงสร้างมันกัน:

`http://user:pass@sub.example.com:8080/p/a/t/h?query=string#hash`

| ส่วนประกอบ | ตัวอย่าง | คำอธิบาย |
|:---|:---|:---|
| **Protocol** | `http:` | กฎการคุย (หรือ `https:`, `ftp:`) |
| **Auth** | `user:pass` | ข้อมูลล็อกอิน (ไม่ค่อยใช้แล้ว ไม่ปลอดภัย) |
| **Host** | `sub.example.com` | ชื่อเครื่อง/โดเมน |
| **Port** | `:8080` | ประตูทางเข้า (ถ้าไม่ระบุ HTTP=80, HTTPS=443) |
| **Path** | `/p/a/t/h` | ที่อยู่ของทรัพยากร |
| **Query** | `?query=string` | ข้อมูลเสริมที่ส่งไป |
| **Hash** | `#hash` | จุดที่ Browser เลื่อนไปหา (Server **มองไม่เห็น** ส่วนนี้!) |

> **💡 Trick:** `new URL()` จัดการเรื่องพวกนี้ให้เราหมดแล้ว ไม่ต้อง Split string เองให้ปวดหัว!

---

## 7. Deep Dive: HTTP Methods (Safe vs Idempotent) 🛡️

Method ไม่ใช่แค่ชื่อเรียกเท่ๆ แต่มันมี "คุณสมบัติ" ที่ Browser และ Server ต้องรู้:

### 7.1 Safe Methods (ปลอดภัย) 🟢
คือ Method ที่ **Read-only** ทำแล้วข้อมูลบน Server **ไม่เปลี่ยน**
*   `GET`, `HEAD`, `OPTIONS`
*   Browser กล้า Cache ได้เต็มที่ เพราะรู้ว่าไม่มีอะไรพัง

### 7.2 Idempotent Methods (ทำซ้ำได้) 🔄
คือ Method ที่ **ทำครั้งเดียว หรือทำ 100 ครั้ง ผลลัพธ์ต้องเหมือนเดิม**
*   `PUT` (แทนที่ข้อมูล): ส่งข้อมูลเดิมไปทับกี่รอบ ก็ได้ค่าเดิม
*   `DELETE` (ลบ): สั่งลบ ID 1 ไปแล้ว สั่งอีกรอบก็แค่ "ไม่มีอะไรเกิดขึ้น" (เพราะลบไปแล้ว)
*   *`GET`, `HEAD`, `OPTIONS` ก็ถือเป็น Idempotent*

### 7.3 Unsafe & Non-Idempotent (ตัวอันตราย) 🔴
*   `POST` (สร้างใหม่): ส่ง 2 ครั้ง = สร้างของ 2 ชิ้น!
*   **Browser จะเตือน** "Confirm Form Resubmission" เวลาเรากด Refresh หน้าที่เพิ่ง Submit Form ไป เพราะกลัวเงินตัดเบิ้ล!

---

## 8. Advanced: Regex Routing (เหมือน Express ทำ) 🧩

ใน Framework จริงๆ เขาไม่ได้เช็ค Strings ตรงๆ (`===`) หรอกครับ เขาใช้ **Regular Expression** เพื่อจับ Pattern:

เช่น `/users/:id` อยากให้แมตช์ `/users/123` หรือ `/users/admin`

```javascript
// regex-router.js
const http = require('http');

const server = http.createServer((req, res) => {
    // 1. ลองจับ Pattern: /users/ตามด้วยตัวเลข
    const userRoute = /^\/users\/(\d+)$/;
    const match = req.url.match(userRoute);

    if (match) {
        // match[1] คือค่าที่อยู่ในวงเล็บ (\d+)
        const userId = match[1]; 
        res.end(`<h1>Viewing User ID: ${userId}</h1>`);
    } else {
        res.end('Not Found');
    }
});
// Test: /users/555 -> OK
// Test: /users/abc -> Not Found (เพราะ \d+ เอาแค่ตัวเลข)
```

> **✨ Magic:** นี่คือเบื้องหลังของ `app.get('/users/:id')` ใน Express.js!

---

> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **Route/Endpoint:** จุดปลายทางของ URL ที่ Server เปิดรับ (เช่น `/api/login`)
> *   **Query String:** ส่วนขยาย URL หลัง `?` เพื่อส่งค่า (เช่น `?page=1&sort=desc`)
> *   **Pathname:** ส่วนของ URL ไม่รวม Domain และ Query (เช่น `/products/shoes`)
> *   **Switch-Case:** โครงสร้างการควบคุมแบบเลือกทำ (ทางเลือกในการเขียน Route)
> *   **Redirect:** การสั่งให้ Browser ย้ายไปหน้าอื่นอัตโนมัติ (Status 301/302 + Location Header)
> *   **Static File:** ไฟล์ที่เนื้อหาไม่เปลี่ยน (HTML, CSS, รูป) ที่ส่งให้ Client ได้เลย
> *   **API Endpoint:** Route ที่ออกแบบมาให้ Programs คุยกัน (มักตอบ JSON)
> *   **Parsing:** การแปรข้อมูลดิบ (String) ให้เป็นโครงสร้างที่ใช้งานได้ (Object)
> *   **Idempotent:** คุณสมบัติที่ทำคำสั่งเดิมซ้ำๆ แล้วผลลัพธ์ที่ Server ยังคงเหมือนเดิม (GET, PUT, DELETE)

## 9. Challenges 🏆

### 🎯 Challenge 1: The Calculator API 🧮
สร้าง API คำนวณเลข โดยรับค่าผ่าน Query String:
*   URL: `/add?a=10&b=20`
*   Response: `30` (เป็น Text ธรรมดา)
*   คำใบ้: ใช้ `new URL()` และ `searchParams.get()` อย่าลืมแปลงเป็น `Number()`

::: details ✨ ดูเฉลย
```javascript
const http = require('http');

const server = http.createServer((req, res) => {
    const myUrl = new URL(req.url, `http://${req.headers.host}`);
    
    if (myUrl.pathname === '/add') {
        const a = Number(myUrl.searchParams.get('a'));
        const b = Number(myUrl.searchParams.get('b'));
        
        if (isNaN(a) || isNaN(b)) {
            res.writeHead(400); // Bad Request
            res.end('Please provide numbers a and b');
        } else {
            res.writeHead(200);
            res.end(String(a + b)); // ส่งผลลัพธ์
        }
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(3000);
```
:::

### 🎯 Challenge 2: Multi-Method API 🚦
สร้าง Route `/data` ที่ทำงานต่างกันตาม Method:
*   **GET:** ตอบว่า "Received GET request"
*   **POST:** ตอบว่า "Received POST request"
*   **PUT/DELETE:** ตอบว่า "Method not allowed" (Status 405)

::: details ✨ ดูเฉลย
```javascript
const http = require('http');

const server = http.createServer((req, res) => {
    if (req.url === '/data') {
        if (req.method === 'GET') {
            res.end('Received GET request');
        } else if (req.method === 'POST') {
            res.end('Received POST request');
        } else {
            res.writeHead(405); // Method Not Allowed
            res.end('Method not allowed');
        }
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(3000);
```
:::

### 🎯 Challenge 3: Redirector ↪️
สร้าง Route `/go-google`:
1. ตอบ Status Code **301 (Moved Permanently)** หรือ **302 (Found)**
2. ส่ง Header `Location: https://google.com`
3. ผลลัพธ์: เมื่อเข้า Browser ปุ๊บ มันต้องเด้งไป Google.com ทันที!

::: details ✨ ดูเฉลย
```javascript
const http = require('http');

const server = http.createServer((req, res) => {
    if (req.url === '/go-google') {
        res.writeHead(302, {
            'Location': 'https://google.com'
        });
        res.end(); // ส่งแค่ Header ก็พอสำหรับการ Redirect
    } else {
        res.end('Stay here');
    }
});

server.listen(3000);
```
:::

### 🎯 Challenge 4: Regex Router (หัวข้อ 8)
จงเขียน Router ที่จับ URL pattern สินค้า `/products/<code>` โดย code ต้องเป็นตัวอักษรภาษาอังกฤษ 3 ตัวเท่านั้น (เช่น `/products/ABC`, `/products/xyz`)
*   ถ้าตรง: แสดง "Product Code: [code]"
*   ถ้าไม่ตรง (เช่น `/products/123`): แสดง "Invalid Code"

::: details ✨ ดูเฉลย
```javascript
const http = require('http');

const server = http.createServer((req, res) => {
    const pattern = /^\/products\/([a-zA-Z]{3})$/;
    const match = req.url.match(pattern);

    if (match) {
        res.end(`Product Code: ${match[1]}`);
    } else {
        res.end('Invalid Code');
    }
});
server.listen(3000);
```
:::

### 🎯 Challenge 5: Idempotency Check (หัวข้อ 7)
Method ใดบ้างที่เป็น **Idempotent**? (ทำซ้ำแล้วผลไม่เปลี่ยน)
1. POST
2. DELETE
3. PUT
4. GET

::: details ✨ ดูเฉลย
**ตอบ:** 2, 3, 4
(POST เป็นตัวเดียวในนี้ที่ไม่ Idempotent เพราะทำซ้ำ = สร้างเบิ้ล)
:::

### 🎯 Challenge 6: URL Anatomy (หัวข้อ 6)
จาก URL `https://api.github.com:443/users/defunkt?tab=repositories#top`
จงระบุส่วนประกอบ:
*   Host: ?
*   Path: ?
*   Query: ?
*   Hash: ?

::: details ✨ ดูเฉลย
*   **Host:** api.github.com
*   **Path:** /users/defunkt
*   **Query:** ?tab=repositories
*   **Hash:** #top
:::

### 🎯 Challenge 7: Safe Methods (หัวข้อ 7)
ทำไม Browser ถึงกล้า Cache ผลลัพธ์ของ `GET` request แต่ไม่กล้า Cache `POST`?

::: details ✨ ดูเฉลย
เพราะ `GET` เป็น **Safe Method** (แค่อ่าน ไม่เปลี่ยนแปลงข้อมูลบน Server) ส่วน `POST` อาจมีการเปลี่ยนแปลงข้อมูล (เช่น ตัดเงิน, สร้าง Order) ถ้า Cache ไว้อาจทำให้ข้อมูลไม่อัปเดตหรือทำรายการซ้ำ
:::

---
