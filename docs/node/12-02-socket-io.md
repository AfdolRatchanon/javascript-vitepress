# 12-02: Real-time with Socket.IO 🟢

> *"Socket.IO enables real-time, bidirectional and event-based communication."*

พระเอกของเราคือ **Socket.IO** ครับ
มันประกอบด้วย 2 ส่วน:
1.  **Server API**: รันบน Node.js
2.  **Client API**: รันบน Browser


## 🛠️ Server Setup

```bash
npm install socket.io
```

เนื่องจาก Socket.IO ต้องเกาะกับ HTTP Server เราต้องปรับแก้ `server.js` นิดหน่อย:

```javascript
/* server.js */
const express = require('express');
const http = require('http'); // 1. ต้องใช้ module http
const { Server } = require("socket.io"); // 2. import Server class

const app = express();
const server = http.createServer(app); // 3. สร้าง server จาก app
const io = new Server(server, {
    cors: {
        origin: "*" // อนุญาตทุกโดเมน (Dev Mode)
    }
}); // 4. สร้าง IO instance

// 5. เมื่อมีคนเชื่อมต่อเข้ามา
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // รับ event ชื่อ 'hello'
    socket.on('chat message', (msg) => {
        console.log('Message:', msg);
        // ส่งต่อให้ทุกคน (Broadcast)
        io.emit('chat message', msg);
    });

    // เมื่อคนตัดการเชื่อมต่อ
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// ⚠️ ต้องใช้ server.listen ไม่ใช่ app.listen
server.listen(3000, () => {
    console.log('listening on *:3000');
});
```


## 💻 Client Setup (Frontend)

เราสามารถใช้ CDN โหลด script มาแปะใน HTML ได้เลย

```html
<!-- index.html -->
<script src="/socket.io/socket.io.js"></script>
<script>
  // 1. Connect ไป Server
  const socket = io('http://localhost:3000');

  // 2. ส่งข้อมูล (Emit)
  function sendMessage() {
      socket.emit('chat message', 'Hello World!');
  }

  // 3. รับข้อมูล (Listen)
  socket.on('chat message', (msg) => {
      console.log('New message:', msg);
  });
</script>
```


## 📡 Broadcasting Methods

การส่งข้อมูลมี 3 แบบหลักๆ:

1.  **Direct Reply (ตอบกลับคนเดิม)**:
    ```javascript
    socket.emit('hello', 'Hi there!');
    ```

2.  **Broadcast (บอกคนอื่นหมดยกเว้นคนส่ง)**:
    ```javascript
    socket.broadcast.emit('user_joined', 'Somchai has joined');
    ```

3.  **IO Emit (บอกทุกคนรวมถึงคนส่ง)**:
    ```javascript
    io.emit('announcement', 'Server will restart in 5 mins');
    ```


## 🏠 Rooms (ห้องแชท)

ฟีเจอร์เด็ดของ Socket.IO คือ "ห้อง"

```javascript
/* Server Side */
socket.on('join_room', (roomName) => {
    socket.join(roomName); // เอาคนนี้เข้าห้อง
    console.log(`User joined: ${roomName}`);
});

socket.on('send_to_room', ({ room, message }) => {
    // ส่งเฉพาะคนที่อยู่ในห้องนั้น
    io.to(room).emit('receive_message', message);
});
```


## 🥊 Challenges

### Level 1: Typing Indicator
ทำฟีเจอร์ "Somchai is typing..."
1. Client: เมื่อ input มีการพิมพ์ -> `socket.emit('typing')`
2. Server: รับ event -> `socket.broadcast.emit('typing')`
3. Client อื่น: โชว์ข้อความ "Somebody is typing..."

::: details ✨ เฉลย
```javascript
// Server
socket.on('typing', () => {
    socket.broadcast.emit('user_typing', { userId: socket.id });
});

// Client
input.addEventListener('input', () => {
    socket.emit('typing');
});
socket.on('user_typing', () => {
    showTypingIcon();
    // อย่าลืมซ่อน icon เมื่อหยุดพิมพ์ (ใช้ setTimeout)
});
```
:::


## 📚 Glossary

| คำศัพท์ | ความหมาย |
|:--------|:---------|
| **Emit** | การส่ง Event ออกไป |
| **On** | การดักฟัง Event ที่ถูกส่งมา |
| **Handshake** | การจับมือเชื่อมต่อครั้งแรก |
| **Namespace** | การแบ่งช่องทางสื่อสารใหญ่ๆ (เช่น /admin, /game) |
| **Room** | การแบ่งกลุ่มย่อยใน Namespace (เช่น ห้องแชท A, ห้อง B) |


> 👉 **ไปต่อ: [Project: Chat API](/node/12-project-chat-api)**
