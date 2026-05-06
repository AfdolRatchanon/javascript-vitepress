# 12-02: Real-time with Socket.IO 🟢

> 💡 **เป้าหมาย:** เรียนรู้ Socket.IO ตั้งแต่พื้นฐานจนถึง Rooms และ Broadcast
> เมื่อเรียนจบจะสามารถสร้าง Real-time Scoreboard ที่ Judge emit คะแนน → Candidate รับ update ในห้องของตัวเองได้

---

## 📖 ทฤษฎีและแนวคิด (Theory & Concepts)

### ทำไม Socket.IO แทน ws โดยตรง?

`ws` package คือ WebSocket ระดับ Low-level แต่ Socket.IO เพิ่มฟีเจอร์ที่สำคัญ:

```
WS vs SOCKET.IO
============================================================
  Feature              ws (bare)       Socket.IO
  ──────────────────   ─────────────   ──────────────────
  Auto Reconnect       ❌ ต้องเขียนเอง  ✅ Built-in
  Fallback (Polling)   ❌              ✅ Long Polling fallback
  Rooms               ❌              ✅ Built-in
  Namespaces          ❌              ✅ Built-in
  Broadcast API       Manual          ✅ io.to(room).emit()
  Acknowledgements    ❌              ✅ callback confirm
  Event naming        Binary frames    Named events (string)
  Browser compat.     Modern only     ✅ ทุก browser
```

---

### Socket.IO Architecture

```
SOCKET.IO ARCHITECTURE
============================================================

  [Browser A - Candidate 7]          [Browser B - Judge 2]
         │                                    │
         │  socket.emit('score-request')       │
         │                                    │
  ───────┴───────────────────────────────────┴───────
                    SOCKET.IO SERVER
         ┌─────────────────────────────────────┐
         │  Namespace: /  (default)             │
         │  ┌─────────────────────────────────┐│
         │  │  Room: candidate-7              ││
         │  │    socket: [Browser A]          ││
         │  └─────────────────────────────────┘│
         │  ┌─────────────────────────────────┐│
         │  │  Room: judges                   ││
         │  │    socket: [Browser B, C, D]    ││
         │  └─────────────────────────────────┘│
         └─────────────────────────────────────┘

  Judge emit 'score-updated' to room 'candidate-7'
  → Browser A receives update immediately ✅
```

---

### Event Flow Diagram

```
SCORE-UPDATED EVENT FLOW
============================================================

  Judge Browser              Server              Candidate Browser
      │                        │                        │
      │── emit('score-updated',│                        │
      │   { candidateId:7,     │                        │
      │     score: 95 })  ────►│                        │
      │                        │  io.to('candidate-7')  │
      │                        │──── emit('your-score') ►│
      │                        │         { score: 95 }  │
      │                        │                        │
      │                (Server side logic)               │
      │                  - Update DB                     │
      │                  - Invalidate Cache              │
      │                  - Emit to room                  │
```

---

### Emit Methods (สรุป)

```
EMIT METHODS CHEATSHEET
============================================================

  socket.emit('event', data)
    → ส่งเฉพาะ socket นั้น (ตัวเอง)

  socket.to('room').emit('event', data)
    → ส่งทุกคนในห้อง ยกเว้นตัวเอง

  io.to('room').emit('event', data)
    → ส่งทุกคนในห้อง รวมตัวเอง

  socket.broadcast.emit('event', data)
    → ส่งทุกคน ยกเว้นตัวเอง (ทุก namespace)

  io.emit('event', data)
    → ส่งทุกคน ทุก room

  io.to('r1').to('r2').emit('event', data)
    → ส่งหลายห้องพร้อมกัน
```

---

## 🛠️ ติดตั้ง Socket.IO

```bash
npm install socket.io
```

---

## 💻 ตัวอย่างโค้ด (Code Implementation)

::: code-group

```js [server.js]
/**
 * Socket.IO Server Setup
 * WSA2026 Test Submission Management System
 */
const express = require('express');
const http    = require('http');
const { Server } = require('socket.io');

const app    = express();
const server = http.createServer(app); // ⚠️ ต้องใช้ http.createServer

// สร้าง Socket.IO Instance แนบกับ http server
const io = new Server(server, {
  cors: {
    origin  : '*', // Dev mode — Production ระบุ domain จริง
    methods : ['GET', 'POST'],
  },
  // Reconnection settings (default ดีอยู่แล้ว แต่ปรับได้)
  pingTimeout  : 10000, // รอ pong 10 วินาที
  pingInterval : 25000, // ping ทุก 25 วินาที
});

app.use(express.json());

// Export ให้ routes ใช้ได้
module.exports = { app, server, io };
```

```js [handlers/scoreHandler.js]
/**
 * Real-time Score Handlers
 * WSA2026 Test Submission Management System
 *
 * Rooms:
 *   candidate-{id}  → ห้องของ Candidate แต่ละคน
 *   judges          → ห้องรวม Judge ทุกคน
 *   managers        → ห้อง Manager
 */
const { io } = require('../server');

/**
 * ลงทะเบียน Socket.IO event handlers
 * เรียกครั้งเดียวเมื่อ io พร้อม
 */
function registerSocketHandlers() {
  io.on('connection', (socket) => {
    console.log(`[WS] Connected: ${socket.id}`);

    // ────────────────────────────────────────────────────
    // REGISTER — ระบุตัวตนและเข้า Room ที่เหมาะสม
    // ────────────────────────────────────────────────────
    socket.on('register', ({ userId, role }) => {
      if (!userId || !role) {
        socket.emit('error', { message: 'userId และ role จำเป็น' });
        return;
      }

      // เก็บ metadata ใน socket object
      socket.userId = userId;
      socket.role   = role;

      if (role === 'candidate') {
        // Candidate เข้าห้องตัวเอง เพื่อรับคะแนนส่วนตัว
        socket.join(`candidate-${userId}`);
        socket.emit('registered', {
          message : `เชื่อมต่อสำเร็จ ห้อง candidate-${userId}`,
          rooms   : [`candidate-${userId}`],
        });
      } else if (role === 'judge') {
        // Judge เข้าห้อง judges รวม
        socket.join('judges');
        socket.emit('registered', {
          message : 'เชื่อมต่อสำเร็จ ห้อง judges',
          rooms   : ['judges'],
        });
      } else if (role === 'manager') {
        socket.join('managers');
        socket.join('judges'); // Manager ดูทุกอย่าง
        socket.emit('registered', {
          message : 'เชื่อมต่อสำเร็จ ห้อง managers',
          rooms   : ['managers', 'judges'],
        });
      }

      console.log(`[WS] ${role} ${userId} joined their room`);
    });

    // ────────────────────────────────────────────────────
    // JUDGE: ให้คะแนน → แจ้ง Candidate ทันที
    // ────────────────────────────────────────────────────
    socket.on('score-updated', async ({ submissionId, candidateId, taskId, score }) => {
      if (socket.role !== 'judge' && socket.role !== 'manager') {
        socket.emit('error', { message: 'ไม่มีสิทธิ์ให้คะแนน' });
        return;
      }

      console.log(`[WS] Judge ${socket.userId} scored submission ${submissionId}: ${score}`);

      // ส่งคะแนนไปยังห้องของ Candidate นั้นโดยตรง
      io.to(`candidate-${candidateId}`).emit('your-score', {
        submissionId,
        taskId,
        score,
        judgeId   : socket.userId,
        message   : `Task ${taskId}: คุณได้ ${score} คะแนน`,
        timestamp : new Date().toISOString(),
      });

      // แจ้ง Manager ด้วย
      io.to('managers').emit('score-recorded', {
        submissionId,
        candidateId,
        taskId,
        score,
        judgeId   : socket.userId,
        timestamp : new Date().toISOString(),
      });

      // Acknowledge กลับหา Judge ว่าส่งสำเร็จ
      socket.emit('score-sent', { submissionId, candidateId, score });
    });

    // ────────────────────────────────────────────────────
    // SUBMISSION NOTIFICATION — แจ้ง Judge ว่ามีงานใหม่
    // ────────────────────────────────────────────────────
    socket.on('submission-new', ({ submissionId, candidateId, taskId }) => {
      io.to('judges').emit('new-submission', {
        submissionId,
        candidateId,
        taskId,
        message   : `Candidate ${candidateId} ส่งงาน Task ${taskId} — รอตรวจ`,
        timestamp : new Date().toISOString(),
      });
    });

    // ────────────────────────────────────────────────────
    // DISCONNECT
    // ────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      console.log(`[WS] ${socket.role || 'unknown'} ${socket.userId || socket.id} disconnected (${reason})`);
    });
  });

  console.log('[WS] Socket handlers registered ✅');
}

module.exports = { registerSocketHandlers };
```

```js [app.js]
/**
 * Main Entry Point
 * WSA2026 Test Submission Management System
 */
require('dotenv').config();

const { app, server }          = require('./server');
const { registerSocketHandlers } = require('./handlers/scoreHandler');

// Register WS handlers
registerSocketHandlers();

// REST Routes
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/leaderboard', require('./routes/leaderboard'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {  // ⚠️ ใช้ server.listen ไม่ใช่ app.listen
  console.log(`WSA2026 API running on port ${PORT}`);
});
```

```html [client-candidate.html]
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>WSA2026 — Candidate Dashboard</title>
</head>
<body>
  <h1>WSA2026 — Candidate Dashboard</h1>
  <div id="status">กำลังเชื่อมต่อ...</div>
  <div id="scores"></div>

  <!-- Socket.IO Client (served by server automatically) -->
  <script src="/socket.io/socket.io.js"></script>
  <script>
    const socket = io('http://localhost:3000');

    // เมื่อเชื่อมต่อสำเร็จ ลงทะเบียนตัวเอง
    socket.on('connect', () => {
      document.getElementById('status').textContent = 'เชื่อมต่อแล้ว ✅';

      // สมมติ Candidate ID = 7
      socket.emit('register', { userId: 7, role: 'candidate' });
    });

    socket.on('registered', (data) => {
      console.log('Registered:', data.message);
    });

    // รับคะแนนจาก Judge
    socket.on('your-score', (data) => {
      const div = document.getElementById('scores');
      div.innerHTML += `
        <p>
          📋 Task ${data.taskId}: <strong>${data.score} คะแนน</strong>
          <small>(${data.timestamp})</small>
        </p>
      `;
    });

    socket.on('disconnect', () => {
      document.getElementById('status').textContent = 'ขาดการเชื่อมต่อ ❌';
    });
  </script>
</body>
</html>
```

:::

---

## 🎯 โจทย์ฝึกปฏิบัติเสริมความเข้าใจ (Mini Exercise)

**โจทย์:** เพิ่ม event `leaderboard-update` ที่ส่งไปยัง **ทุกคน** (broadcast) เมื่อ Judge ให้คะแนนเสร็จ โดย payload ประกอบด้วย:
- `updatedAt` — เวลาที่อัปเดต
- `message` — "Leaderboard มีการเปลี่ยนแปลง กรุณา Refresh"

::: details 💡 คำใบ้ (Hint)

ใน `score-updated` handler เพิ่ม:

```js
io.emit('leaderboard-update', {
  updatedAt : new Date().toISOString(),
  message   : 'Leaderboard มีการเปลี่ยนแปลง กรุณา Refresh',
});
```

:::

---

## 🔥 Challenge (โจทย์ท้าทาย!)

สร้าง **Acknowledgement System** สำหรับ Score Update:
1. Judge emit `score-updated` พร้อม callback function
2. Server บันทึก DB แล้วเรียก callback พร้อมผลลัพธ์
3. ถ้า DB error → callback ส่ง `{ success: false, error: '...' }`
4. ถ้าสำเร็จ → callback ส่ง `{ success: true, submissionId, score }`

```js
// Judge Client
socket.emit('score-updated', { submissionId: 5, score: 95 }, (response) => {
  if (response.success) {
    alert('บันทึกคะแนนสำเร็จ!');
  } else {
    alert('เกิดข้อผิดพลาด: ' + response.error);
  }
});

// Server
socket.on('score-updated', async (data, callback) => {
  try {
    await db.query('UPDATE submissions SET score=? WHERE id=?', [data.score, data.submissionId]);
    callback({ success: true, ...data });
  } catch (err) {
    callback({ success: false, error: err.message });
  }
});
```

---

## 📚 Socket.IO Glossary

| คำศัพท์ | ความหมาย |
|---------|---------|
| **Emit** | ส่ง Event ออกไป |
| **On** | ดักฟัง Event ที่ถูกส่งมา |
| **Room** | กลุ่มย่อยของ Socket (เช่น ห้อง candidate-7) |
| **Namespace** | ช่องทางสื่อสารหลัก (เช่น /admin, /scoring) |
| **Broadcast** | ส่งไปยัง Socket หลายตัวพร้อมกัน |
| **Acknowledgement** | Callback ยืนยันว่า event ถึงปลายทางแล้ว |
| **Handshake** | การ negotiate ก่อนเชื่อมต่อ (version, auth, transport) |

---

## 🗣️ ทบทวน (Review)

::: details ❓ คำถามทบทวน

**คำถาม 1:** `socket.to('room').emit()` ต่างจาก `io.to('room').emit()` อย่างไร?
**แนวคำตอบ:** `socket.to('room')` ส่งไปยังทุกคนในห้องยกเว้นตัว socket เอง; `io.to('room')` ส่งไปยังทุกคนในห้องรวมตัว socket ด้วย

**คำถาม 2:** ทำไมต้องใช้ `server.listen()` ไม่ใช่ `app.listen()`?
**แนวคำตอบ:** Socket.IO ต้องแนบกับ `http.Server` object ถ้าใช้ `app.listen()` จะสร้าง HTTP Server ใหม่แยกต่างหาก ทำให้ Socket.IO ไม่ได้แนบกับ Server ที่กำลัง listen อยู่

**คำถาม 3:** Rooms ใน Socket.IO ใช้ทำอะไร?
**แนวคำตอบ:** ใช้จัดกลุ่ม Socket เพื่อส่ง event ไปยังเฉพาะกลุ่มนั้น เช่น ส่งคะแนนไปยัง `candidate-7` เฉพาะ Candidate คนนั้น ไม่ใช่ทุกคน

**คำถาม 4:** Socket.IO มีข้อดีอะไรเหนือ `ws` package?
**แนวคำตอบ:** Auto Reconnect, Fallback to Long Polling ถ้า WS ไม่รองรับ, Rooms/Namespaces built-in, Named events แทน binary frames, Acknowledgement callbacks

:::

---

> 👉 **ไปต่อ: [Project 12: Live Scoreboard](/node/12-project-chat-api)**
