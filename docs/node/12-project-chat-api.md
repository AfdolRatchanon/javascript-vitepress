# Project 12: Live Scoreboard 🏆

> 💡 **เป้าหมาย:** สร้างระบบ Real-time Scoreboard ด้วย Socket.IO สำหรับ TP2026
> เมื่อ Judge ให้คะแนน Submission → Candidate รับ Update ในห้องของตัวเองทันที

---

## 🗂️ โครงสร้างโปรเจกต์

```
tp2026-live/
├── config/
│   └── db.js
├── handlers/
│   └── socketHandler.js     ← Socket.IO events
├── routes/
│   └── submissions.js       ← REST + trigger WS
├── public/
│   ├── candidate.html       ← หน้า Candidate
│   └── judge.html           ← หน้า Judge
├── app.js
└── package.json
```

---

## 📦 Step 1: ติดตั้ง Dependencies

```bash
npm init -y
npm install express socket.io mysql2 dotenv
```

---

## 🔧 Step 2: Server Setup

::: code-group

```js [app.js]
/**
 * WSA2026 Live Scoreboard Server
 */
require('dotenv').config();

const express = require('express');
const http    = require('http');
const { Server } = require('socket.io');
const path    = require('path');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: '*' },
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// แชร์ io instance ไปยัง routes
app.set('io', io);

// Socket Handlers
require('./handlers/socketHandler')(io);

// REST Routes
app.use('/api/submissions', require('./routes/submissions'));

app.get('/health', (req, res) => {
  res.json({
    status    : 'ok',
    connected : io.engine.clientsCount,
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`WSA2026 Live Scoreboard: http://localhost:${PORT}`);
});
```

:::

---

## 🔌 Step 3: Socket Handler

::: code-group

```js [handlers/socketHandler.js]
/**
 * Socket.IO Event Handlers
 * WSA2026 Test Submission Management System
 *
 * Rooms:
 *   candidate-{id}  → Candidate รับคะแนนส่วนตัว
 *   judges          → Judge เห็น Submission ใหม่
 *   managers        → Manager เห็นทุก event
 */
module.exports = function registerHandlers(io) {

  // เก็บ mapping userId → socketId สำหรับ DM
  const onlineUsers = new Map(); // userId → socket.id

  io.on('connection', (socket) => {
    console.log(`[WS] +connect  ${socket.id}`);

    // ── register ──────────────────────────────────────────
    socket.on('register', ({ userId, role }) => {
      if (!userId || !role) {
        return socket.emit('error', { message: 'userId และ role จำเป็น' });
      }

      socket.userId = String(userId);
      socket.role   = role;
      onlineUsers.set(String(userId), socket.id);

      // เข้า Room ตาม role
      const rooms = [];

      if (role === 'candidate') {
        socket.join(`candidate-${userId}`);
        rooms.push(`candidate-${userId}`);
      }

      if (role === 'judge' || role === 'manager') {
        socket.join('judges');
        rooms.push('judges');
      }

      if (role === 'manager') {
        socket.join('managers');
        rooms.push('managers');
      }

      socket.emit('registered', {
        userId,
        role,
        rooms,
        onlineCount : onlineUsers.size,
      });

      // แจ้ง Manager ว่ามีคน online เพิ่ม
      io.to('managers').emit('user-online', {
        userId,
        role,
        timestamp : new Date().toISOString(),
      });
    });

    // ── score-updated (Judge ให้คะแนน) ────────────────────
    socket.on('score-updated', async ({ submissionId, candidateId, taskId, score }, ack) => {
      // Validate
      if (!['judge', 'manager'].includes(socket.role)) {
        const err = { success: false, error: 'ไม่มีสิทธิ์ให้คะแนน' };
        if (ack) ack(err);
        return socket.emit('error', err);
      }

      if (typeof score !== 'number' || score < 0 || score > 100) {
        const err = { success: false, error: 'score ต้องเป็น 0-100' };
        if (ack) ack(err);
        return;
      }

      // ส่ง update ไปยัง Candidate คนที่ถูกให้คะแนน
      io.to(`candidate-${candidateId}`).emit('your-score', {
        submissionId,
        taskId,
        score,
        judgeId   : socket.userId,
        message   : `Task ${taskId}: คุณได้ ${score} คะแนน`,
        timestamp : new Date().toISOString(),
      });

      // แจ้ง Manager ทั้งหมด
      io.to('managers').emit('score-recorded', {
        submissionId,
        candidateId,
        taskId,
        score,
        judgeId   : socket.userId,
        timestamp : new Date().toISOString(),
      });

      // Broadcast Leaderboard update ทุกคน
      io.emit('leaderboard-changed', {
        message   : 'Leaderboard มีการเปลี่ยนแปลง',
        timestamp : new Date().toISOString(),
      });

      console.log(`[WS] Judge ${socket.userId} scored submission ${submissionId}: ${score}`);

      // Acknowledgement กลับ Judge
      if (ack) ack({ success: true, submissionId, score });
    });

    // ── submission-new ─────────────────────────────────────
    socket.on('submission-new', ({ submissionId, candidateId, taskId }) => {
      io.to('judges').emit('new-submission', {
        submissionId,
        candidateId,
        taskId,
        message   : `Candidate ${candidateId} ส่งงาน Task ${taskId}`,
        timestamp : new Date().toISOString(),
      });
    });

    // ── disconnect ────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.to('managers').emit('user-offline', {
          userId    : socket.userId,
          role      : socket.role,
          reason,
          timestamp : new Date().toISOString(),
        });
      }
      console.log(`[WS] -disconnect ${socket.id} (${reason})`);
    });
  });

  console.log('[WS] Handlers registered ✅');
};
```

:::

---

## 🛣️ Step 4: REST Route + WS Trigger

::: code-group

```js [routes/submissions.js]
/**
 * Submissions REST Routes
 * WSA2026 Test Submission Management System
 *
 * REST → DB → Trigger WS event
 */
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

// POST /api/submissions — Candidate ส่งงาน
router.post('/', async (req, res) => {
  const { candidate_id, task_id, submission_url } = req.body;

  if (!candidate_id || !task_id || !submission_url) {
    return res.status(400).json({
      error : 'ต้องระบุ candidate_id, task_id, submission_url',
    });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO submissions (candidate_id, task_id, submission_url, status)
       VALUES (?, ?, ?, 'submitted')`,
      [candidate_id, task_id, submission_url]
    );

    const submissionId = result.insertId;

    // Trigger WS: แจ้ง Judge ว่ามีงานใหม่
    const io = req.app.get('io');
    io.to('judges').emit('new-submission', {
      submissionId,
      candidateId : candidate_id,
      taskId      : task_id,
      message     : `Candidate ${candidate_id} ส่งงาน Task ${task_id}`,
      timestamp   : new Date().toISOString(),
    });

    res.status(201).json({
      message      : 'ส่งงานสำเร็จ',
      submissionId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/submissions/:id/score — Judge ให้คะแนน (REST fallback)
router.put('/:id/score', async (req, res) => {
  const { id }    = req.params;
  const { score, judge_id } = req.body;

  if (typeof score !== 'number' || score < 0 || score > 100) {
    return res.status(400).json({ error: 'score ต้องเป็น 0-100' });
  }

  try {
    // ดึง submission ก่อนเพื่อรู้ candidateId
    const [[sub]] = await db.query(
      'SELECT * FROM submissions WHERE id = ?', [id]
    );

    if (!sub) {
      return res.status(404).json({ error: 'ไม่พบ Submission' });
    }

    await db.query(
      `UPDATE submissions SET score = ?, status = 'scored' WHERE id = ?`,
      [score, id]
    );

    // Trigger WS
    const io = req.app.get('io');
    io.to(`candidate-${sub.candidate_id}`).emit('your-score', {
      submissionId : Number(id),
      taskId       : sub.task_id,
      score,
      judgeId      : judge_id,
      message      : `Task ${sub.task_id}: คุณได้ ${score} คะแนน`,
      timestamp    : new Date().toISOString(),
    });
    io.emit('leaderboard-changed', { timestamp: new Date().toISOString() });

    res.json({ message: 'บันทึกคะแนนสำเร็จ', submissionId: Number(id), score });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
```

:::

---

## 🖥️ Step 5: Client Pages

::: code-group

```html [public/candidate.html]
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>WSA2026 — Candidate</title>
  <style>
    body { font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 0 20px; }
    .score-card { background:#f0f9ff; border-left:4px solid #0ea5e9; padding:12px; margin:8px 0; }
    .status { padding:4px 8px; border-radius:4px; display:inline-block; }
    .online  { background:#dcfce7; color:#166534; }
    .offline { background:#fee2e2; color:#991b1b; }
  </style>
</head>
<body>
  <h2>WSA2026 — Candidate Dashboard</h2>
  <p>Status: <span id="status" class="status offline">Offline</span></p>
  <h3>คะแนนที่ได้รับ</h3>
  <div id="scores"><em>รอคะแนน...</em></div>

  <script src="/socket.io/socket.io.js"></script>
  <script>
    // สมมติ candidateId = 7 (จริงๆ ดึงจาก session/auth)
    const CANDIDATE_ID = 7;
    const socket = io();

    socket.on('connect', () => {
      document.getElementById('status').className = 'status online';
      document.getElementById('status').textContent = 'Online';
      socket.emit('register', { userId: CANDIDATE_ID, role: 'candidate' });
    });

    socket.on('your-score', (data) => {
      const div = document.getElementById('scores');
      if (div.querySelector('em')) div.innerHTML = '';
      div.innerHTML = `
        <div class="score-card">
          <strong>Task ${data.taskId}</strong>: ${data.score} คะแนน<br>
          <small>${new Date(data.timestamp).toLocaleString('th-TH')}</small>
        </div>
      ` + div.innerHTML;
    });

    socket.on('leaderboard-changed', () => {
      console.log('Leaderboard updated — consider refreshing');
    });

    socket.on('disconnect', () => {
      document.getElementById('status').className = 'status offline';
      document.getElementById('status').textContent = 'Offline';
    });
  </script>
</body>
</html>
```

```html [public/judge.html]
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>WSA2026 — Judge Panel</title>
  <style>
    body { font-family: sans-serif; max-width: 700px; margin: 40px auto; padding: 0 20px; }
    .sub-card { background:#fefce8; border-left:4px solid #eab308; padding:12px; margin:8px 0; }
    button { background:#0ea5e9; color:white; border:none; padding:6px 14px; border-radius:4px; cursor:pointer; }
  </style>
</head>
<body>
  <h2>WSA2026 — Judge Panel</h2>
  <h3>Submission ที่รอตรวจ</h3>
  <div id="submissions"><em>รอ Submission...</em></div>

  <script src="/socket.io/socket.io.js"></script>
  <script>
    const JUDGE_ID = 2; // สมมติ
    const socket = io();

    socket.on('connect', () => {
      socket.emit('register', { userId: JUDGE_ID, role: 'judge' });
    });

    socket.on('new-submission', (data) => {
      const div = document.getElementById('submissions');
      if (div.querySelector('em')) div.innerHTML = '';

      const score = prompt(`ให้คะแนน Submission #${data.submissionId} (0-100):`);
      if (score !== null) {
        socket.emit('score-updated', {
          submissionId : data.submissionId,
          candidateId  : data.candidateId,
          taskId       : data.taskId,
          score        : Number(score),
        }, (ack) => {
          alert(ack.success ? `บันทึกคะแนน ${ack.score} สำเร็จ` : `Error: ${ack.error}`);
        });
      }
    });
  </script>
</body>
</html>
```

:::

---

## 📋 Events Reference

```
SOCKET.IO EVENTS — TP2026 LIVE SCOREBOARD
============================================================

  CLIENT → SERVER:
  ┌─────────────────────┬────────────────────────────────────┐
  │ Event               │ Payload                            │
  ├─────────────────────┼────────────────────────────────────┤
  │ register            │ { userId, role }                   │
  │ score-updated       │ { submissionId, candidateId,       │
  │                     │   taskId, score }                  │
  │ submission-new      │ { submissionId, candidateId,       │
  │                     │   taskId }                         │
  └─────────────────────┴────────────────────────────────────┘

  SERVER → CLIENT:
  ┌─────────────────────┬────────────────────────────────────┐
  │ Event               │ Receiver   │ Payload               │
  ├─────────────────────┼────────────┼───────────────────────┤
  │ registered          │ emitter    │ { userId, rooms, ... } │
  │ your-score          │ candidate  │ { submissionId,score } │
  │ new-submission      │ judges     │ { submissionId, ... }  │
  │ score-recorded      │ managers   │ { submissionId, ... }  │
  │ leaderboard-changed │ everyone   │ { timestamp }          │
  │ user-online/offline │ managers   │ { userId, role }       │
  └─────────────────────┴────────────┴───────────────────────┘
```

---

## 🔥 Challenge (โจทย์ท้าทาย!)

เพิ่ม **Authentication Middleware** ใน Socket.IO:

1. Client ส่ง token ตอน connect: `io({ auth: { token: 'jwt...' } })`
2. Server ตรวจสอบ token ใน `io.use()` middleware
3. ถ้า token ไม่ถูกต้อง → `next(new Error('Authentication failed'))`
4. ดึง userId และ role จาก token payload แล้วเก็บใน `socket.userId`

```js
// Hint:
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = payload.userId;
    socket.role   = payload.role;
    next();
  } catch {
    next(new Error('Authentication failed'));
  }
});
```

---

## 🗣️ ทบทวน (Review)

::: details ❓ คำถามทบทวน

**คำถาม 1:** `req.app.get('io')` ใน REST Route ใช้ทำอะไร?
**แนวคำตอบ:** ดึง io instance ที่ผูกไว้กับ Express app ด้วย `app.set('io', io)` ทำให้ REST Route สามารถ Emit WS event ได้แม้ไม่ใช่ Socket context

**คำถาม 2:** ทำไม Candidate ต้อง join room `candidate-{id}` แทนที่จะรอรับจาก broadcast ทั่วไป?
**แนวคำตอบ:** เพื่อความเป็นส่วนตัว Candidate แต่ละคนควรเห็นเฉพาะคะแนนของตัวเอง ไม่ใช่คะแนนของทุกคน การใช้ Room แยกทำให้ Judge emit ไปยังเฉพาะ Candidate ที่ถูกให้คะแนนได้

**คำถาม 3:** Acknowledgement callback ใน Socket.IO ทำงานอย่างไร?
**แนวคำตอบ:** Emit พร้อม function เป็น argument สุดท้าย Server รับ argument นั้นเป็น `ack` แล้วเรียก `ack(data)` เพื่อส่งข้อมูลกลับหา Client ยืนยันว่า event ถูกประมวลผลแล้ว

:::

---

> 👉 **ไปต่อ: [13-01: Unit Testing with Jest](/node/13-01-unit-testing-jest)**
