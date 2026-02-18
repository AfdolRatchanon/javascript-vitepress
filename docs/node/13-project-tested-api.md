# Project 13: Tested API (Jest & Supertest) 🧪

> **"If it's not tested, it's broken."**

ในโปรเจกต์นี้ เราจะไม่สร้าง API ใหม่ แต่เราจะเอา API เดิม (เช่นจากบท 4 หรือ 5) มา **"เขียนTest"** ลงไป
การมี Test Suite ที่ดีช่วยให้เรากล้า Refactor Code และมั่นใจว่า Deploy แล้วจะไม่พังกลางทาง


## 🎯 Project Goals

1.  **Unit Testing**: ทดสอบ Function เล็กๆ แยกกัน (Isolation)
2.  **Integration Testing**: ทดสอบการทำงานร่วมกันของ API (Endpoint -> DB)
3.  **Code Coverage**: วัดผลว่า Test ครอบคลุม Code เรากี่ % (เป้าหมาย > 80%)
4.  **TDD (Test Driven Development)**: ลองเขียน Test ก่อนเขียน Code (Optional)


## 🛠️ 1. Setup Testing Environment

ลง Library พระเอกของเรา: `jest` (Test Runner) และ `supertest` (HTTP Assertion)

```bash
npm install jest supertest --save-dev
```

แก้ `package.json` ให้รองรับ Jest และตั้งค่า Script

```json
{
  "scripts": {
    "start": "node app.js",
    "test": "jest --detectOpenHandles",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "testEnvironment": "node",
    "coveragePathIgnorePatterns": [
      "/node_modules/"
    ]
  }
}
```


## 🏗️ 2. The Subject Under Test (App)

สมมติเรามี Express App ง่ายๆ (ไฟล์ `app.js`)
**เคล็ดลับ:** เราต้อง `export app` ออกมาเพื่อเอาไป Test ไม่ใช่แค่ `app.listen` อย่างเดียว

```javascript
// app.js
const express = require('express');
const app = express();

app.use(express.json());

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.post('/calculate', (req, res) => {
    const { a, b } = req.body;
    if (typeof a !== 'number' || typeof b !== 'number') {
        return res.status(400).json({ error: 'Invalid input' });
    }
    res.json({ result: a + b });
});

// สำคัญ! แยก server.js (ที่มี app.listen) ออกจาก app.js logic
// เพื่อเวลา Test จะได้ไม่ต้องเปิด Port จริงๆ
module.exports = app;
```


## 💻 3. Writing Tests

สร้างโฟลเดอร์ `__tests__` หรือไฟล์ชื่อ `xxx.test.js`

### 3.1 Unit Test (Testing Logic)
ทดสอบ Function บวกเลขง่ายๆ (ไม่ต้องเปิด Server)

```javascript
// math.js
const add = (a, b) => a + b;
module.exports = { add };

// math.test.js
const { add } = require('../math');

describe('Math Logic Helper', () => {
    test('should add 1 + 2 to equal 3', () => {
        expect(add(1, 2)).toBe(3);
    });

    test('should handle negative numbers', () => {
        expect(add(-1, -1)).toBe(-2);
    });
});
```

### 3.2 Integration Test (Testing endpoints)
ใช้ `supertest` ยิง Request จำลองไปที่ `app`

```javascript
// app.test.js
const request = require('supertest');
const app = require('../app');

describe('API Endpoints', () => {
    
    // Test GET /health
    describe('GET /health', () => {
        it('should return 200 OK', async () => {
            const res = await request(app).get('/health');
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({ status: 'ok' });
        });
    });

    // Test POST /calculate
    describe('POST /calculate', () => {
        it('should calculate sum correctly', async () => {
            const res = await request(app)
                .post('/calculate')
                .send({ a: 10, b: 20 });
            
            expect(res.statusCode).toBe(200);
            expect(res.body.result).toBe(30);
        });

        it('should return 400 for invalid input', async () => {
            const res = await request(app)
                .post('/calculate')
                .send({ a: "10", b: 20 }); // String instead of Number
            
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBeDefined();
        });
    });

});
```


## 📊 4. Running Tests & Coverage

รันคำสั่ง:
```bash
npm test
```
*   Jest จะค้นหาไฟล์ `*.test.js` ทั้งหมดแล้วรันให้
*   ถ้าผ่านจะขึ้นสีเขียว ✅ ถ้าพังจะขึ้นสีแดง ❌ พร้อมบอกบรรทัดที่ผิด

รัน Coverage:
```bash
npm run test:coverage
```
*   มันจะสร้าง Report บอกว่าเรา Test ไปกี่ % ของ Code ทั้งหมด
*   เข้าไปดูไฟล์ `coverage/lcov-report/index.html` เพื่อดูหน้าเว็บสวยๆ ได้เลย


## ⚡ 5. Challenge: Mocking Database 🏆

การ Test กับ Database จริงๆ (Real DB) นั้นช้าและจัดการยาก (Data สกปรก)
**โจทย์**: ให้เขียน Test API `/users` โดยการ **Mock** function ที่เรียก Database

สมมติเรามี Controller:
```javascript
// userController.js
const db = require('./db');
exports.getUsers = async (req, res) => {
    const users = await db.findAll(); // เราจะ Mock ตัวนี้!
    res.json(users);
};
```

วิธี Test (โดยไม่ต่อ DB จริง):
```javascript
// userController.test.js
const db = require('./db');
const { getUsers } = require('./userController');

// บอก Jest ว่าไฟล์นี้ขอ Mock นะ (ห้ามเรียกของจริง)
jest.mock('./db'); 

test('should return list of users', async () => {
    const mockUsers = [{ name: 'Test User' }];
    
    // กำหนดให้ db.findAll คืนค่า mockUsers เสมอเมื่อถูกเรียก
    db.findAll.mockResolvedValue(mockUsers); 

    const req = {};
    const res = {
        json: jest.fn() // Mock res.json เพื่อตรวจสอบว่าถูกเรียกไหม
    };

    await getUsers(req, res);

    expect(res.json).toHaveBeenCalledWith(mockUsers);
});
```


## 📚 FAQ

**Q: TDD คืออะไร?**
A: **Test Driven Development**: เขียน Test ให้พังก่อน (Red) -> เขียน Code ให้ผ่าน (Green) -> ปรับปรุง Code (Refactor) วนไปเรื่อยๆ

**Q: จำเป็นต้อง Test 100% Coverage ไหม?**
A: **ไม่จำเป็น** และมักจะไม่คุ้มค่า (Diminishing Returns) เป้าหมายควรอยู่ที่ 80-90% และเน้น Test ในส่วนที่เป็น Business Logic สำคัญๆ (Critical Path) มากกว่า Code ทั่วไป


👉 **[ไปต่อ: Module 14 - Deployment & DevOps](/node/14-01-process-managers)**
