# 12-01: WebSockets Introduction 🔌

> 💡 **เป้าหมาย:** เข้าใจความแตกต่างของ Polling, Long Polling และ WebSocket และรู้ว่าเมื่อไหรควรใช้อะไร
> เมื่อเรียนจบจะสามารถสร้าง WebSocket Server ด้วย `ws` package เพื่อ Broadcast การแจ้งเตือน Submission ใหม่ให้ Judge ทุกคนได้

---

## 📖 ทฤษฎีและแนวคิด (Theory & Concepts)

### ปัญหาของ HTTP ธรรมดา

HTTP ที่ใช้กันมาตลอดนี้มีข้อจำกัดสำคัญ: **Client ต้องเป็นฝ่ายเริ่มถามเสมอ** Server ตอบได้เฉพาะเมื่อถูกถาม

```
HTTP REQUEST-RESPONSE (Half-Duplex)
============================================================

  Client          Server
    │── GET /submissions ──►│
    │◄── 200 OK ────────────│  (connection closed)

    │── GET /submissions ──►│
    │◄── 200 OK ────────────│  (connection closed)

  ปัญหา: ถ้าต้องการ Real-time ต้องถามซ้ำตลอด!
```

---

### 3 แนวทางสู่ Real-time

#### Short Polling — วิธีโบราณ

Client ส่ง Request ซ้ำทุกๆ N วินาที

```
SHORT POLLING (ทุก 2 วินาที)
============================================================

  Client            Server
    │── Request ───►│  (t=0)  → "ไม่มีข้อมูลใหม่"
    │◄── 304 ───────│
    │
    │── Request ───►│  (t=2)  → "ไม่มีข้อมูลใหม่"
    │◄── 304 ───────│
    │
    │── Request ───►│  (t=4)  → "มีข้อมูลใหม่!"
    │◄── 200 ───────│

  ข้อเสีย: เปลือง bandwidth, ข้อมูลช้าสูงสุด N วินาที
```

#### Long Polling — วิธีเก่าที่ดีกว่า

Client ส่ง Request แล้วรอ Server ถือ Connection ไว้จนมีข้อมูลใหม่

```
LONG POLLING
============================================================

  Client            Server
    │── Request ───►│  (Server "hold" connection)
    │               │  ...รอ...
    │               │  ...รอ...
    │◄── 200 ────── │  (มีข้อมูลใหม่แล้วส่งทันที)

    │── Request ───►│  (เปิด connection ใหม่ทันที)
    │               │  ...รอ...

  ข้อเสีย: ต้องสร้าง connection ใหม่ทุกครั้ง, server ต้องถือ connection ไว้หลายตัว
```

#### WebSocket — วิธีใหม่ที่ดีที่สุด

เปิด connection ครั้งเดียว ทั้งสองฝ่ายส่งข้อมูลได้ตลอดเวลา

```
WEBSOCKET (Full-Duplex, Persistent Connection)
============================================================

  Client                Server
    │──── HTTP Upgrade Request ────►│
    │◄─── 101 Switching Protocols ──│
    │                               │
    │══════════ WS Connection ══════│  (เปิดค้างไว้)
    │                               │
    │──── send: "ส่งงาน task 3" ───►│
    │◄─── event: "มี submission ใหม่"│
    │◄─── event: "Judge ให้คะแนน"  │
    │──── send: "ขอคะแนน update" ──►│
    │                               │

  ข้อดี: Full-Duplex, Persistent, Header น้อย (~2 bytes per frame)
```

---

### เปรียบเทียบ 3 วิธี

```
COMPARISON TABLE
============================================================
  Feature          Short Polling   Long Polling    WebSocket
  ─────────────    ─────────────   ────────────    ─────────────
  การสื่อสาร       Client → Server Client → Server Full-Duplex
  Connection       เปิด-ปิดทุกครั้ง รอนาน ปิดใหม่  ค้างถาวร
  Latency          สูง (≥ interval) ต่ำ              ต่ำมาก
  Server load      สูง             ปานกลาง          ต่ำ
  Bandwidth waste  สูง             ปานกลาง          ต่ำมาก
  Browser support  ทุก browser     ทุก browser      Modern browsers
  ง่ายต่อการ impl  ง่ายมาก        ปานกลาง          ปานกลาง
  เหมาะกับ        Poll ห่างๆ      Notification     Chat/Game/Live
```

---

### WebSocket Handshake (HTTP Upgrade)

WebSocket เริ่มต้นจาก HTTP แล้วค่อย "upgrade" เป็น WS

```
WEBSOCKET HANDSHAKE
============================================================

  CLIENT REQUEST:
  GET /ws HTTP/1.1
  Host: localhost:3000
  Upgrade: websocket
  Connection: Upgrade
  Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
  Sec-WebSocket-Version: 13

  SERVER RESPONSE:
  HTTP/1.1 101 Switching Protocols
  Upgrade: websocket
  Connection: Upgrade
  Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=

  ─── หลังจากนี้ Connection เป็น WS แล้ว ─────────────────
  ทั้ง Client และ Server ส่ง WS Frame ได้โดยตรง
  Frame overhead เล็กมาก (2-14 bytes per frame)
```

---

### เมื่อไหรควรใช้ WebSocket vs REST

```
USE WEBSOCKET WHEN:
  ✅ ต้องการ Real-time notification
  ✅ Chat / messaging
  ✅ Live score / dashboard
  ✅ Multiplayer game
  ✅ Collaborative editing
  ✅ Stock / price ticker

USE REST (HTTP) WHEN:
  ✅ CRUD operations ทั่วไป
  ✅ File upload
  ✅ ต้องการ Cache ด้วย HTTP Cache-Control
  ✅ Public API ที่ Client ไม่รู้จัก
  ✅ Stateless operations
```

---

### `ws` Package — WebSocket ระดับ Low-level

`ws` คือ WebSocket library ที่เบาและเร็ว เหมาะสำหรับเข้าใจ WebSocket พื้นฐาน

```bash
npm install ws
```

**Core API:**

```
ws.Server methods:
  new WebSocket.Server({ port })  สร้าง WS Server
  wss.on('connection', (socket) => {})  รับ connection ใหม่

socket methods:
  socket.on('message', (data) => {})  รับข้อมูล
  socket.send(data)                   ส่งข้อมูล
  socket.close()                      ปิด connection
  socket.readyState                   OPEN/CLOSING/CLOSED

  Broadcast to all:
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data)
    }
  })
```

---

## 💻 ตัวอย่างโค้ด (Code Implementation)

::: code-group

```js [ws-server.js]
/**
 * WebSocket Server — Broadcast Submission Notifications
 * WSA2026 Test Submission Management System
 *
 * เมื่อ Candidate ส่งงาน → แจ้งเตือน Judge ทุกคนแบบ Real-time
 */
const WebSocket = require('ws');
const http      = require('http');
const express   = require('express');

const app    = express();
const server = http.createServer(app);

// WS Server แนบกับ HTTP Server เดิม
const wss = new WebSocket.Server({ server });

app.use(express.json());

// เก็บ Judge connections แยกจาก connections ทั่วไป
const judgeConnections = new Map(); // judgeId → socket

/**
 * Helper: Broadcast ข้อความไปยัง Client ทุกคน
 */
function broadcastToAll(data) {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

/**
 * Helper: ส่งไปยัง Judge คนที่ระบุ
 */
function sendToJudge(judgeId, data) {
  const socket = judgeConnections.get(String(judgeId));
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
    return true;
  }
  return false;
}

// ─── WebSocket Connection Handler ──────────────────────────
wss.on('connection', (socket, req) => {
  console.log('[WS] New connection from', req.socket.remoteAddress);

  // ─── รับข้อมูลจาก Client ──────────────────────────────
  socket.on('message', (rawData) => {
    let msg;

    try {
      msg = JSON.parse(rawData.toString());
    } catch {
      socket.send(JSON.stringify({ error: 'Invalid JSON' }));
      return;
    }

    console.log('[WS] Received:', msg);

    switch (msg.type) {
      // Judge ลงทะเบียนตัวเอง
      case 'judge:register': {
        const { judgeId } = msg;
        if (!judgeId) {
          socket.send(JSON.stringify({ error: 'judgeId required' }));
          break;
        }
        judgeConnections.set(String(judgeId), socket);
        socket.judgeId = String(judgeId);
        socket.send(JSON.stringify({
          type    : 'judge:registered',
          judgeId,
          message : `Judge ${judgeId} ลงทะเบียนสำเร็จ`,
        }));
        console.log(`[WS] Judge ${judgeId} registered`);
        break;
      }

      // Candidate ส่งงาน (REST จะเรียก endpoint แล้ว broadcast)
      // แต่ Client ก็ emit ได้เช่นกัน
      case 'submission:new': {
        const { submissionId, candidateId, taskId } = msg;
        broadcastToAll({
          type         : 'submission:new',
          submissionId,
          candidateId,
          taskId,
          message      : `มี Submission ใหม่ (task ${taskId}) รอ Judge ตรวจ`,
          timestamp    : new Date().toISOString(),
        });
        break;
      }

      default:
        socket.send(JSON.stringify({ error: `Unknown type: ${msg.type}` }));
    }
  });

  // ─── Connection ถูกปิด ────────────────────────────────
  socket.on('close', () => {
    if (socket.judgeId) {
      judgeConnections.delete(socket.judgeId);
      console.log(`[WS] Judge ${socket.judgeId} disconnected`);
    } else {
      console.log('[WS] Client disconnected');
    }
  });

  socket.on('error', (err) => {
    console.error('[WS] Socket error:', err.message);
  });

  // ยินดีต้อนรับ
  socket.send(JSON.stringify({
    type    : 'connected',
    message : 'เชื่อมต่อ WSA2026 Real-time Server สำเร็จ',
  }));
});

// ─── REST Endpoint → Trigger WS Broadcast ──────────────────
// เมื่อ Candidate ส่งงานผ่าน REST API
app.post('/api/submissions', (req, res) => {
  const { candidate_id, task_id, submission_url } = req.body;

  if (!candidate_id || !task_id || !submission_url) {
    return res.status(400).json({ error: 'ข้อมูลไม่ครบ' });
  }

  // สมมติบันทึก DB แล้ว ได้ submissionId = 99
  const newSubmission = {
    id              : 99,
    candidate_id,
    task_id,
    submission_url,
    status          : 'submitted',
  };

  // Broadcast แจ้ง Judge ทุกคน
  broadcastToAll({
    type         : 'submission:new',
    submissionId : newSubmission.id,
    candidateId  : candidate_id,
    taskId       : task_id,
    message      : `Candidate ${candidate_id} ส่งงาน Task ${task_id} แล้ว`,
    timestamp    : new Date().toISOString(),
  });

  res.status(201).json({
    message    : 'ส่งงานสำเร็จ และแจ้ง Judge แล้ว',
    submission : newSubmission,
    notified   : `${judgeConnections.size} judges`,
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status         : 'ok',
    wsConnections  : wss.clients.size,
    judgeOnline    : judgeConnections.size,
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`[Server] HTTP + WS running on port ${PORT}`);
  console.log(`[Server] WS URL: ws://localhost:${PORT}`);
});

module.exports = { app, server, wss, broadcastToAll, sendToJudge };
```

```js [ws-client-test.js]
/**
 * WS Client Test — จำลอง Judge ต่อ WebSocket
 * WSA2026 Test Submission Management System
 */
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3000');

ws.on('open', () => {
  console.log('[Client] Connected to WSA2026 server');

  // ลงทะเบียนเป็น Judge
  ws.send(JSON.stringify({
    type    : 'judge:register',
    judgeId : 2,
  }));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  console.log('[Client] Received:', msg);

  // ตัวอย่าง: เมื่อได้รับแจ้ง submission ใหม่
  if (msg.type === 'submission:new') {
    console.log(`[Judge] มีงานใหม่: Candidate ${msg.candidateId} ส่ง Task ${msg.taskId}`);
  }
});

ws.on('close',  () => console.log('[Client] Disconnected'));
ws.on('error', (err) => console.error('[Client] Error:', err.message));
```

:::

---

## 🎯 โจทย์ฝึกปฏิบัติเสริมความเข้าใจ (Mini Exercise)

**โจทย์:** เพิ่ม feature `ping/pong` ใน WS Server เพื่อตรวจว่า Client ยังออนไลน์อยู่
- Client ส่ง `{ "type": "ping" }`
- Server ตอบกลับ `{ "type": "pong", "timestamp": "..." }`

::: details 💡 คำใบ้ (Hint)

```js
case 'ping': {
  socket.send(JSON.stringify({
    type      : 'pong',
    timestamp : new Date().toISOString(),
  }));
  break;
}
```

:::

---

## 🔥 Challenge (โจทย์ท้าทาย!)

เพิ่มระบบ **Heartbeat** เพื่อ Detect Dead Connections:

1. ทุกๆ 30 วินาที Server ส่ง `ping` ไปยังทุก Client
2. ถ้า Client ไม่ตอบ `pong` ภายใน 5 วินาที → ปิด connection นั้น
3. ใช้ `socket.isAlive` flag + `socket.ping()` + `socket.on('pong')`

```js
// Heartbeat hint
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30_000);

wss.on('connection', (socket) => {
  socket.isAlive = true;
  socket.on('pong', () => { socket.isAlive = true; });
});
```

---

## 🗣️ ทบทวน (Review)

::: details ❓ คำถามทบทวน

**คำถาม 1:** Short Polling, Long Polling และ WebSocket ต่างกันอย่างไร?
**แนวคำตอบ:** Short Polling — Client ถามซ้ำทุก N วินาที เปลือง bandwidth; Long Polling — Client ส่ง request แล้วรอ Server ถือไว้จนมีข้อมูล; WebSocket — เปิด connection ค้างไว้ ทั้งสองฝ่ายส่งข้อมูลได้ตลอดเวลา เร็วและประหยัดที่สุด

**คำถาม 2:** WebSocket Handshake คืออะไร?
**แนวคำตอบ:** กระบวนการ "upgrade" connection จาก HTTP ไปเป็น WebSocket โดย Client ส่ง `Upgrade: websocket` header และ Server ตอบ `101 Switching Protocols` หลังจากนั้น connection เป็น WS แล้ว

**คำถาม 3:** `wss.clients` ใช้ทำอะไร?
**แนวคำตอบ:** เป็น Set ที่เก็บ socket ของทุก Client ที่เชื่อมต่ออยู่ ใช้ `forEach` เพื่อ broadcast ข้อมูลไปยังทุกคน

**คำถาม 4:** เมื่อไหรควรใช้ WebSocket แทน REST?
**แนวคำตอบ:** เมื่อต้องการ Real-time (Server Push) เช่น Chat, Live Score, Notification; REST เหมาะกับ CRUD ทั่วไปที่ Client เป็นฝ่ายขอข้อมูล

:::

---

> 👉 **ไปต่อ: [12-02: Socket.IO](/node/12-02-socket-io)**
