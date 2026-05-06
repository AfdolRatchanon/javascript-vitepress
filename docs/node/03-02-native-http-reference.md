# Module 3.2: Native HTTP Reference 🌐

> **"The HTTP protocol is the foundation of the World Wide Web."**
> — *MDN Web Docs*

ในบทนี้เราจะเปลี่ยน Node.js จากโปรแกรมธรรมดา ให้กลายเป็น **Web Server** ที่รับคำสั่งจาก Browser หรือ Client ที่ไหนก็ได้! เราจะเรียนรู้ตั้งแต่พื้นฐาน HTTP จนถึงสร้าง API สำหรับระบบ WSA2026 โดยใช้แค่ `http` module ติดตัว Node.js

---

## 1. Web Server คืออะไร? (The Big Picture) 🖼️

### The Client-Server Model

```
  WSA2026 System — HTTP Flow
  ==========================

  [Browser / Postman]           [Node.js Server]
        |                              |
        |-- GET /api/candidates -----> |
        |                              |-- อ่าน database/JSON
        |                              |-- ประมวลผล
        | <-- 200 OK {JSON data} ----- |
        |                              |
        |-- POST /api/submissions ---> |
        |   { candidate_id, task_id } |-- บันทึกข้อมูล
        | <-- 201 Created {id: 6} ---- |
```

> **💡 Analogy (เปรียบเทียบ): ร้านอาหาร** 🍽️
> 1. **Client (คุณ):** ดูเมนูแล้วสั่ง (ส่ง **Request**)
> 2. **Waiter (Network):** จดออเดอร์ เดินไปส่งที่ครัว
> 3. **Server (Node.js):** รับออเดอร์ ปรุงอาหาร (Process)
> 4. **Waiter (Network):** ยกจานมาเสิร์ฟ (ส่ง **Response**)

---

## 2. HTTP Protocol: ภาษากลางของการสื่อสาร 🗣️

### 2.1 Request (คำขอจาก Client) 📤

- **Method:** ท่าทางที่จะทำ (`GET`=ขอ, `POST`=ส่ง, `PUT`=แก้, `DELETE`=ลบ)
- **URL:** ที่อยู่ของข้อมูล (เช่น `/api/candidates`)
- **Headers:** ข้อมูลเสริม (เช่น `Authorization: Bearer <token>`)
- **Body:** เนื้อหาที่แนบมา (เช่น JSON ของ submission ใหม่)

### 2.2 Response (คำตอบจาก Server) 📥

- **Status Code:** ผลลัพธ์ (200=OK, 201=Created, 404=Not Found)
- **Headers:** ข้อมูลเสริม (เช่น `Content-Type: application/json`)
- **Body:** เนื้อหาจริงๆ (JSON data)

---

## 3. สร้าง Web Server แรกด้วย Node.js 🛠️

Node.js มี Module ติดตัวชื่อ **`http`** ใช้สร้าง Server ได้ทันที ไม่ต้องลงอะไรเพิ่ม

::: code-group
```js [server.js]
const http = require("http");

const server = http.createServer((req, res) => {
  console.log(`📨 ${req.method} ${req.url}`);

  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("ยินดีต้อนรับสู่ WSA2026 API! 🏆");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
```
:::

### ทดสอบรัน
1. รัน `node server.js`
2. เปิด Browser ไปที่ `http://localhost:3000`
3. จะเห็น "ยินดีต้อนรับสู่ WSA2026 API!"

---

## 4. เจาะลึก `req` และ `res` 🔍

`req` และ `res` เป็น Object พิเศษ (จริงๆ คือ **Streams**) ที่ Node.js สร้างให้เรา:

### `req` (IncomingMessage)
- `req.url` — URL ที่ลูกค้าเรียก (เช่น `/api/candidates`)
- `req.method` — HTTP Method (`GET`, `POST`, ...)
- `req.headers` — Headers ทั้งหมด (Object)

### `res` (ServerResponse)
- `res.writeHead(status, headers)` — เขียน response headers
- `res.write(data)` — เขียนเนื้อหา (หลายรอบได้)
- `res.end(data)` — ปิด response (ต้องเรียกเสมอ!)

::: code-group
```js [inspect-req.js]
const http = require("http");

const server = http.createServer((req, res) => {
  console.log("--- New Request ---");
  console.log("Method  :", req.method);
  console.log("URL     :", req.url);
  console.log("User-Agent:", req.headers["user-agent"]);

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({
    method: req.method,
    url:    req.url,
    time:   new Date().toISOString()
  }));
});

server.listen(3000, () => console.log("Server running on port 3000"));
```
:::

---

## 5. HTTP Status Codes: รหัสลับบอกสถานะ 🔢

| กลุ่ม | ความหมาย | ตัวอย่าง |
|:---:|:---|:---|
| **2xx** | ✅ สำเร็จ | `200 OK`, `201 Created`, `204 No Content` |
| **3xx** | ↩️ Redirect | `301 Moved`, `304 Not Modified` |
| **4xx** | ❌ Client Error | `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found` |
| **5xx** | 💥 Server Error | `500 Internal Server Error`, `503 Unavailable` |

> 💡 **Trick:**
> - **2xx** = ยิ้มแฉ่ง 😁
> - **4xx** = เอ็งผิด 🫵
> - **5xx** = ข้าผิด 🤕

---

## 6. Content-Type (MIME Types) 📦

| Content-Type | คืออะไร | ใช้เมื่อ |
|:---|:---|:---|
| `text/plain` | ข้อความล้วน | Debug message |
| `text/html` | HTML | หน้าเว็บ |
| `application/json` | JSON | **API response** (ใช้มากที่สุด!) |
| `multipart/form-data` | Form + File upload | อัปโหลดรูปภาพ |

::: code-group
```js [api-server.js]
const http = require("http");

const server = http.createServer((req, res) => {
  // WSA2026: ส่งข้อมูล candidate กลับเป็น JSON
  const candidate = {
    id:       101,
    username: "somchai_th",
    name:     "สมชาย ใจดี",
    role:     "candidate",
    country:  "Thailand"
  };

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(candidate));
});

server.listen(3000);
```
:::

---

## 7. Anatomy of an HTTP Transaction: ผ่าตัดคำขอ 🏥

`req` และ `res` ไม่ใช่แค่ Object ธรรมดา แต่มันคือ **Stream** ที่สืบทอดมาจาก `net.Socket`

### 7.1 `req` คือ Readable Stream 📤
เมื่อข้อมูลจาก Client ไหลเข้ามา (เช่น JSON body) มาเป็น **Chunk** ไม่ใช่ทีเดียว:

::: code-group
```js [read-body.js]
const http = require("http");

const server = http.createServer((req, res) => {
  if (req.method !== "POST") {
    res.writeHead(405);
    res.end("Method Not Allowed");
    return;
  }

  // อ่าน body จาก Stream
  let rawData = "";

  req.on("data", (chunk) => {
    rawData += chunk.toString();
  });

  req.on("end", () => {
    try {
      const body = JSON.parse(rawData);
      console.log("Body received:", body);

      // WSA2026: บันทึก submission ใหม่
      const response = {
        id:           6,
        candidate_id: body.candidate_id,
        task_id:      body.task_id,
        status:       "pending",
        submitted_at: new Date().toISOString()
      };

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(response));
    } catch (e) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON body" }));
    }
  });
});

server.listen(3000);
```
:::

### 7.2 `res` คือ Writable Stream 📥
เราสามารถ `res.write()` หลายรอบได้ก่อน `res.end()` เพื่อ streaming response

---

## 8. Security: ป้องกันการโจมตี (DoS) 🛡️

### 8.1 Slowloris Attack (เต่าคลาน) 🐢
Hacker เชื่อมต่อมาแต่ส่งข้อมูลช้ามากๆ ทำให้ Connection เต็ม

```javascript
server.timeout = 5000; // ตัดสายถ้าเงียบเกิน 5 วินาที
```

### 8.2 Payload Too Large (ระเบิดถัง) 💣
ส่ง JSON ขนาด 10GB ทำให้ RAM เต็ม:

::: code-group
```js [security.js]
const http = require("http");
const MAX_BODY_SIZE = 1 * 1024 * 1024; // 1MB

const server = http.createServer((req, res) => {
  let body  = [];
  let size  = 0;

  req.on("data", (chunk) => {
    body.push(chunk);
    size += chunk.length;

    if (size > MAX_BODY_SIZE) {
      console.warn("⚠️  Payload too large — dropping connection");
      req.destroy(); // ตัดสายทันที
      res.writeHead(413, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Payload too large" }));
    }
  });

  req.on("end", () => {
    const rawData = Buffer.concat(body).toString();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ received: rawData.length + " bytes" }));
  });
});

server.timeout = 5000;
server.listen(3000);
```
:::

---

## 9. Performance Tuning: จูนให้แรง 🏎️

### 9.1 Keep-Alive (อย่าเพิ่งวางสาย)
HTTP/1.1 ใช้ **Keep-Alive** เปิดสายค้างไว้เพื่อส่ง Request ต่อไปได้เลย
Node.js เปิด Keep-Alive ให้โดย Default (5 วินาที)

### 9.2 Max Connections (จำกัดคนเข้า)
```javascript
server.maxConnections = 1000; // รับได้แค่ 1,000 connections พร้อมกัน
```

---

## 10. Handling Query Parameters (URL Search) 🔍

เวลาเข้า `/api/submissions?status=pending&task_id=1` ดึงค่า query string ด้วย `URL` API:

::: code-group
```js [query-params.js]
const http = require("http");

// Mock submissions
const submissions = [
  { id: 1, candidate_id: 101, task_id: 1, score: 92,   status: "scored"  },
  { id: 2, candidate_id: 102, task_id: 1, score: 85,   status: "scored"  },
  { id: 3, candidate_id: 103, task_id: 2, score: null, status: "pending" },
  { id: 4, candidate_id: 104, task_id: 2, score: 78,   status: "scored"  }
];

const server = http.createServer((req, res) => {
  const url    = new URL(req.url, `http://${req.headers.host}`);
  const status = url.searchParams.get("status");  // "pending" | "scored"
  const taskId = url.searchParams.get("task_id"); // "1" | "2" | null

  let result = submissions;

  if (status)  result = result.filter(s => s.status  === status);
  if (taskId)  result = result.filter(s => s.task_id === parseInt(taskId));

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ data: result, total: result.length }));
});

server.listen(3000, () => {
  console.log("Server on :3000");
  console.log("Try: GET /api/submissions?status=scored&task_id=1");
});
```
:::

---

## 11. Environment Variables (ความลับสวรรค์) 🤫

ห้าม Hardcode Port, API Key, DB URL ในโค้ด! ใช้ `.env` แทน

::: code-group
```js [server-env.js]
require("dotenv").config(); // โหลดจาก .env

const PORT      = process.env.PORT      || 3000;
const NODE_ENV  = process.env.NODE_ENV  || "development";
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET is required in environment variables");
  process.exit(1);
}

const http = require("http");
const server = http.createServer((req, res) => {
  res.end(`WSA2026 API running in ${NODE_ENV} mode`);
});

server.listen(PORT, () => {
  console.log(`🚀 WSA2026 API on port ${PORT} [${NODE_ENV}]`);
});
```

```ini [.env]
PORT=3000
NODE_ENV=development
JWT_SECRET=wsa2026-super-secret-key-change-in-production
DB_HOST=localhost
DB_NAME=wsa2026
```
:::

---

## 12. CORS: ทำไม Frontend ยิง API ไม่ได้? 🚧

**CORS (Cross-Origin Resource Sharing)** คือระบบความปลอดภัยของ Browser ที่ห้าม `localhost:5173` (Vite) ยิง API ไปที่ `localhost:3000` โดยตรง

::: code-group
```js [cors-server.js]
const http = require("http");

const ALLOWED_ORIGINS = [
  "http://localhost:5173",  // Vite dev server
  "https://wsa2026.com"     // production frontend
];

const server = http.createServer((req, res) => {
  const origin = req.headers.origin;

  // ตั้งค่า CORS headers
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Pre-flight request
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Main handler
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "CORS OK for WSA2026 API" }));
});

server.listen(3000);
```
:::

---

## 13. HTTPS: ความปลอดภัยบนโลกไซเบอร์ 🔒

HTTP ธรรมดา ข้อมูลวิ่งเป็น Plain Text — ใครดักได้ก็อ่านรู้เรื่อง
HTTPS ใช้ **TLS/SSL** เข้ารหัสข้อมูล

```javascript
const https = require("https");
const fs    = require("fs");

const options = {
  key:  fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem")
};

https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end("WSA2026 Secure API 🔒");
}).listen(443);
```

> **Note:** ในระบบจริง เราให้ Cloud Provider (Nginx, Cloudflare) จัดการ SSL ให้แทน

---

## 🎯 โจทย์ฝึกปฏิบัติเสริมความเข้าใจ (Mini Exercise)

- **โจทย์:** สร้าง Server ที่รับ `GET /api/submissions/:id` แล้วส่งกลับ submission ที่มี id ตรงกัน (ใช้ URL pattern matching แบบ Manual)

::: details 💡 คำใบ้ (Hint)
```javascript
// ดึง id จาก URL เช่น /api/submissions/3 -> id = "3"
const parts = req.url.split("/"); // ["", "api", "submissions", "3"]
const id    = parseInt(parts[3]);

const submission = submissions.find(s => s.id === id);
if (!submission) {
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Submission not found" }));
  return;
}
```
:::

---

## 🔥 Challenge (โจทย์ท้าทาย!)

### Challenge: WSA2026 Raw HTTP Server (Full API)

สร้าง HTTP Server **โดยไม่ใช้ Express** ที่รองรับ **ทุก endpoint** ของระบบ WSA2026:

| Method | Path | รายละเอียด |
|:---|:---|:---|
| `GET` | `/api/candidates` | รายชื่อผู้สมัครทั้งหมด |
| `GET` | `/api/tasks` | รายการ tasks |
| `GET` | `/api/submissions` | submissions ทั้งหมด (รองรับ `?status=pending`) |
| `POST` | `/api/submissions` | สร้าง submission ใหม่ |
| `PUT` | `/api/submissions/:id/score` | ตั้งคะแนน |
| `GET` | `/api/leaderboard` | คะแนนรวม top 5 |
| `GET` | `/*` | 404 Not Found |

**Requirements:**
1. ใช้ `switch` หรือ Router table (Object ที่ map `"METHOD /path"` → handler function)
2. อ่าน/เขียน JSON body จาก `req` stream อย่างถูกต้อง
3. ส่ง proper status code ทุก endpoint
4. เพิ่ม request log: `[TIME] METHOD /path STATUS ms`

::: details 💡 คำใบ้ (Hint)
```javascript
// Router table pattern
const routes = {
  "GET /api/candidates":   handleGetCandidates,
  "GET /api/tasks":        handleGetTasks,
  "GET /api/submissions":  handleGetSubmissions,
  "POST /api/submissions": handlePostSubmission,
  "GET /api/leaderboard":  handleGetLeaderboard
};

// ใน createServer callback:
const url      = new URL(req.url, `http://${req.headers.host}`);
const pathname = url.pathname;

// จัดการ dynamic route เช่น /api/submissions/3/score
let handler = routes[`${req.method} ${pathname}`];
if (!handler) {
  // ลอง match dynamic pattern
  const match = pathname.match(/^\/api\/submissions\/(\d+)\/score$/);
  if (match && req.method === "PUT") {
    handler = (req, res) => handlePutScore(req, res, match[1]);
  }
}

if (!handler) {
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Route not found" }));
  return;
}

handler(req, res, url);
```
:::

---

## 🗣️ ทบทวน (Review)

::: details ❓ คำถามทบทวน

**คำถาม 1:** `req.url` และ `req.method` เก็บข้อมูลอะไร? ยกตัวอย่าง
**แนวคำตอบ:** `req.url` เก็บ path และ query string เช่น `/api/submissions?status=pending` ส่วน `req.method` เก็บ HTTP method เช่น `"GET"`, `"POST"`, `"PUT"`, `"DELETE"` เราใช้ทั้งสองค่าร่วมกันเพื่อ route request ไปยัง handler ที่ถูกต้อง

**คำถาม 2:** ทำไมต้องเรียก `res.end()` เสมอ? จะเกิดอะไรขึ้นถ้าไม่เรียก?
**แนวคำตอบ:** `res.end()` ส่งสัญญาณให้ Browser รู้ว่า response สิ้นสุดแล้ว ถ้าไม่เรียก Browser จะหมุน loading ไปเรื่อยๆ รอข้อมูลที่ไม่มาวันมา และในที่สุด request จะ timeout

**คำถาม 3:** CORS error เกิดจากอะไร และแก้ที่ฝั่งไหน?
**แนวคำตอบ:** CORS error เกิดจาก Browser บล็อก JavaScript ของ Frontend (origin A) ไม่ให้เรียก API ที่ origin B ต่างกัน แก้ที่ฝั่ง Server โดยส่ง Header `Access-Control-Allow-Origin` กลับไป ไม่ใช่แก้ที่ Frontend

**คำถาม 4:** ทำไมต้องอ่าน request body ด้วย event `data` และ `end` ไม่ใช่แค่ `req.body`?
**แนวคำตอบ:** เพราะ `req` เป็น Readable Stream ข้อมูลมาเป็น chunk ไม่ใช่ทีเดียว `req.body` ไม่มีใน Native HTTP Module — มีแค่ใน Express (ซึ่งก็ทำงานโดยเก็บ chunk สะสมไว้ให้นั่นเอง) เราต้องฟัง event `data` สะสม chunks แล้วรอ event `end` จึงค่อย parse JSON

:::

---

> **📖 คำศัพท์เทคนิค (Glossary):**
> - **Client:** ผู้ขอใช้บริการ (Browser, App, Postman)
> - **Server:** ผู้ให้บริการ (Computer ที่รัน Node.js)
> - **Request:** คำขอที่ส่งจาก Client ไปหา Server
> - **Response:** สิ่งที่ Server ตอบกลับหา Client
> - **HTTP Method:** ประเภทของ action (GET/POST/PUT/DELETE)
> - **Status Code:** ตัวเลข 3 หลักบอกสถานะ (200, 404, 500)
> - **MIME Type / Content-Type:** ชนิดของข้อมูลที่ส่งไป (เช่น `application/json`)
> - **CORS:** Cross-Origin Resource Sharing — ระบบควบคุมการเข้าถึง API ข้าม origin
> - **Keep-Alive:** เปิด TCP connection ค้างไว้เพื่อส่ง request ต่อเนื่อง
> - **DoS (Denial of Service):** การโจมตีเพื่อทำให้ Server ให้บริการไม่ได้
