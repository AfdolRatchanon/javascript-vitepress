# 💬 Project 12: Real-time Chat API

ในโปรเจกต์นี้ เราจะสร้าง Chat Server ที่รองรับการแยกห้องสนทนา!
โดย API จะมีหน้าที่แค่ **Authenticate** และ **Connect Socket** เท่านั้น

> **Goal**: สร้าง Chat Room ที่คนในห้องเดียวกันคุยกันได้


## 🛠️ Step 1: Initialize Project

```bash
npm install socket.io
```


## 🛠️ Step 2: Server Implementation (`server.js`)

เราจะเขียนแบบรวมไฟล์เดียวเพื่อความง่าย (แต่ในงานจริงควรแยก `socketHandler.js`)

```javascript
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // URL ของ Frontend
        methods: ["GET", "POST"]
    }
});

// เก็บสถานะคนออนไลน์ (ใน Memory ง่ายๆ)
let onlineUsers = {};

io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // 1. Join Room
    socket.on('join_room', (data) => {
        const { username, room } = data;
        socket.join(room); // เข้าห้อง Socket
        
        // เก็บข้อมูล User
        onlineUsers[socket.id] = { username, room };

        console.log(`${username} joined room: ${room}`);

        // แจ้งเตือนคนในห้อง
        socket.to(room).emit('receive_message', {
            username: 'System',
            message: `${username} has joined the chat`,
            time: new Date().toLocaleTimeString()
        });
    });

    // 2. Send Message
    socket.on('send_message', (data) => {
        // data = { room, username, message, time }
        console.log(data);
        
        // ส่งกลับหาทุกคนในห้อง (รวมตัวเองด้วย จะได้เห็นข้อความตัวเอง)
        io.to(data.room).emit('receive_message', data);
    });

    // 3. Disconnect
    socket.on('disconnect', () => {
        const user = onlineUsers[socket.id];
        if (user) {
            io.to(user.room).emit('receive_message', {
                username: 'System',
                message: `${user.username} has left the chat`,
                time: new Date().toLocaleTimeString()
            });
            delete onlineUsers[socket.id];
        }
        console.log('User Disconnected', socket.id);
    });
});

server.listen(3001, () => {
    console.log('Chat Server running on port 3001');
});
```


## 🧪 Testing with Postman (WebSocket)

Postman เวอร์ชันใหม่รองรับ WebSocket แล้ว! 🎉

1.  เปิด Postman -> New -> **WebSocket Request**
2.  ใส่ URL: `ws://localhost:3001`
3.  กด **Connect** -> ต้องขึ้น "Connected" ✅
4.  **Send Message (Event)**:
    - ช่อง Message พิมพ์ชื่อ Event: `join_room`
    - ช่อง Payload (JSON): `{ "username": "Somchai", "room": "123" }`
    - กด Send
5.  **Listen**:
    - จะเห็น Log ข้างล่างว่า Server ตอบอะไรกลับมาบ้าง


## 🧩 Challenge: Private Message
ทำระบบทักแชทส่วนตัว (DM)
- `socket.emit('send_private', { toUserId: '...', message: '...' })`
- Server ต้องรู้ว่า `toUserId` คือ `socket.id` ไหน (ต้องใช้ `onlineUsers` map ช่วย)
- `io.to(targetSocketId).emit(...)`


> 👉 **ไปต่อ: [Module 13 - Unit Testing](/node/13-01-unit-testing-jest)**
