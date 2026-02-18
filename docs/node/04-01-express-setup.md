# Module 4.1: Express.js Basics (Framework ยอดนิยมอันดับ 1) 🚂

> **"Fast, unopinionated, minimalist web framework for Node.js"**
> — *Express.js Homepage*

ยินดีต้อนรับสู่โลกของ **Express.js**! 🎉
ที่ผ่านมาเราเขียน Server แบบ "ดิบๆ" (Native Node.js) ซึ่งก็ดีสำหรับการเรียนรู้ แต่ช้าและยุ่งยากสำหรับงานจริง
ตอนนี้เราจะมารู้จักกับ **Framework** ที่จะทำให้ชีวิตคุณง่ายขึ้น 10 เท่า!


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


## 4. Challenges 🏆

### 🎯 Challenge 1: The Static Gallery
1. สร้างโฟลเดอร์ `public`
2. หารูปอะไรก็ได้ใส่เข้าไป `image.jpg`
3. เขียนโค้ด `express.static`
4. ลองเข้า `http://localhost:3000/image.jpg` ใน browser ว่าเห็นรูปไหม?


👉 **[ไปต่อ: 4.2 - Handling Requests](/node/04-02-handling-requests)**
