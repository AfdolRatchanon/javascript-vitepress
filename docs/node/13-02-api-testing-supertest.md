# 13-02: API Integration Testing with Supertest 🧪

> *"It works on my machine" is not a valid test result.*

Unit Test ดูแค่ไส้ในฟังก์ชัน
แต่ **Integration Test** ดูภาพรวมว่า "ยิง API แล้วได้ของถูกต้องไหม?"

เราจะใช้ **Supertest** ซึ่งเป็นไลบรารีที่ช่วยจำลอง HTTP Request ไปยัง Express App ของเรา (โดยไม่ต้องรัน Server จริงๆ!) 😲


## 🛠️ Setup

```bash
npm install supertest --save-dev
```


## 🧪 Testing Express App

สมมติเรามีไฟล์ `app.js` (ต้อง export app ออกมานะ อย่าเพิ่ง `app.listen` ในไฟล์เดียวกัน หรือแยก `server.js` ต่างหาก)

```javascript
/* app.js */
const express = require('express');
const app = express();

app.get('/user', (req, res) => {
  res.status(200).json({ name: 'somchai' });
});

module.exports = app;
```

เขียน Test:

```javascript
/* app.test.js */
const request = require('supertest');
const app = require('./app');

describe('GET /user', () => {
  it('responds with json', async () => {
    const response = await request(app)
      .get('/user')
      .expect('Content-Type', /json/) // เช็ค Header
      .expect(200);                   // เช็ค Status Code

    // เช็ค Body
    expect(response.body).toEqual({ name: 'somchai' });
  });
});
```


## 🔌 Setup & Teardown (Database)

ถ้า API เราต้องต่อ Database เราต้องระวัง:
1.  **Before All**: เชื่อมต่อ DB (Memory หรือ Test DB)
2.  **After All**: ตัดการเชื่อมต่อ (ไม่งั้น Jest จะค้าง ไม่ยอมจบ)

```javascript
/* user.test.js */
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('POST /users', () => {
  it('creates a new user', async () => {
    const res = await request(app)
      .post('/users')
      .send({ username: 'testuser', password: '123' });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body.username).toBe('testuser');
  });
});
```


## 🥊 Challenges

### Level 1: Test Auth Middleware
ลองเขียน Test สำหรับ Route ที่ต้องการ Login (`GET /profile`)
- Case 1: ไม่ส่ง Token -> ต้องได้ 401
- Case 2: ส่ง Token ผิด -> ต้องได้ 403
- Case 3: ส่ง Token ถูก -> ต้องได้ 200

::: details ✨ เฉลย (แนวคิด)
```javascript
it('should reject without token', async () => {
  await request(app).get('/profile').expect(401);
});

it('should accept valid token', async () => {
  const token = 'mock_valid_token'; // หรือ login เอา token จริงมาก่อน
  await request(app)
    .get('/profile')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
});
```
:::


## 📚 Glossary

| คำศัพท์ | ความหมาย |
|:--------|:---------|
| **Supertest** | Library สำหรับยิง HTTP Request ใส่ Node.js Server เพื่อทำ Test |
| **Setup/Teardown** | โค้ดที่รันก่อน (`before`) และหลัง (`after`) การเทส เพื่อเตรียม/ล้างสภาพแวดล้อม |
| **Test Database** | ฐานข้อมูลแยกต่างหากสำหรับการเทส (ห้ามใช้ DB จริงเด็ดขาด! ข้อมูลหายนะ) |


> 👉 **ไปต่อ: [Project: Tested API](/node/13-project-tested-api)**
