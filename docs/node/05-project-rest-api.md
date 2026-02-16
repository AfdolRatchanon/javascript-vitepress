# 🎯 Project: RESTful API Manager (CRUD เต็มรูปแบบ) 🛠️

> **"Code is like humor. When you have to explain it, it’s bad."**
> — *Cory House*

ในโปรเจกต์นี้ เราจะอัปเกรดจาก "API ร้านค้าจำลอง" ในบทที่แล้ว มาเป็น **"User Management System"** ที่สมบูรณ์แบบด้วย Express.js
เราจะใช้ทุกวิชาที่เรียนมาใน Module 5: **Custom Middleware**, **Error Handling**, **Router**, และ **Validation**

---

## 🎯 The Goal (เป้าหมาย)

สร้าง API จัดการผู้ใช้ (`/api/users`) ที่ทำ CRUD ได้ครบ:
1.  **Create:** สมัครสมาชิกใหม่ (POST) พร้อม Validataion
2.  **Read:** ดูรายชื่อและข้อมูลส่วนตัว (GET) พร้อม Pagination/Filter
3.  **Update:** แก้ไขข้อมูล (PUT)
4.  **Delete:** ลบผู้ใช้ (DELETE)

**Architecture: "Separation of Concerns"**
เราจะแยกโค้ดเป็น 3 ชั้น (Layers) ตามมาตรฐานบริษัท:
1.  **Controller:** รับ Request / ส่ง Response
2.  **Service:** Business Logic (คำนวณ, ตรวจสอบ Business Rules)
3.  **Model/Data:** ติดต่อ Database (ในที่นี้ใช้ Mock Data ไปก่อน)

---

## 🛠️ Step 1: Setup & Project Structure

```bash
mkdir express-user-api
cd express-user-api
npm init -y
npm install express cors morgan uuid joi dotenv
```

*   `uuid`: สร้าง ID
*   `joi`: ตรวจสอบข้อมูล (Validation)
*   `dotenv`: จัดการ Config

โครงสร้างโฟลเดอร์:
```
express-user-api/
├── controllers/    ← Traffic Police (รับ Req -> เรียก Service -> ส่ง Res)
│   └── userController.js
├── services/       ← The Brain (Logic หลัก)
│   └── userService.js
├── routes/         ← Maps URL to Controller
│   └── userRoutes.js
├── middlewares/    ← Error Handler, Validation
│   └── errorHandler.js
│   └── validator.js
├── app.js          ← App Setup
├── server.js       ← Server Entry
└── package.json
```

---

## 📂 Step 2: The Service Layer (The Brain) 🧠

สร้าง `services/userService.js`:
หน้านี้คือ "คนทำงานจริง" เราจะเขียน Logic ทุกอย่างที่นี่ (และจำลองว่ามันเป็น Async เหมือนดึง DB)

```javascript
const { v4: uuidv4 } = require('uuid');

// Mock Database
let users = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user' }
];

exports.getAllUsers = async (page = 1, limit = 10, role) => {
    // 1. Filtering
    let result = users;
    if (role) {
        result = result.filter(u => u.role === role);
    }

    // 2. Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    return {
        total: result.length,
        page: Number(page),
        data: result.slice(startIndex, endIndex)
    };
};

exports.getUserById = async (id) => {
    const user = users.find(u => u.id === id);
    if (!user) throw new Error('USER_NOT_FOUND'); // โยน Error ให้ Controller จัดการ
    return user;
};

exports.createUser = async (userData) => {
    // Check Email Duplicate
    const exist = users.find(u => u.email === userData.email);
    if (exist) throw new Error('EMAIL_ALREADY_EXISTS');

    const newUser = {
        id: uuidv4(),
        ...userData,
        role: userData.role || 'user'
    };
    users.push(newUser);
    return newUser;
};

exports.updateUser = async (id, updateData) => {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('USER_NOT_FOUND');

    // Merge Data
    users[index] = { ...users[index], ...updateData };
    return users[index];
};

exports.deleteUser = async (id) => {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('USER_NOT_FOUND');
    
    users.splice(index, 1);
    return true;
};
```

---

## 👮 Step 3: The Controller Layer (Traffic Police)

สร้าง `controllers/userController.js`:
หน้าที่คือรับ Request, แกะข้อมูล, เรียก Service, และส่ง Response (ห้ามมี Logic ซับซ้อน!)

```javascript
const userService = require('../services/userService');

// Helper function to handle async errors (แทน try-catch ทุกตัว)
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

exports.getUsers = asyncHandler(async (req, res) => {
    const { page, limit, role } = req.query;
    const result = await userService.getAllUsers(page, limit, role);
    res.json(result);
});

exports.getUserById = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
});

exports.createUser = asyncHandler(async (req, res) => {
    const newUser = await userService.createUser(req.body);
    res.status(201).json(newUser);
});

exports.updateUser = asyncHandler(async (req, res) => {
    const updatedUser = await userService.updateUser(req.params.id, req.body);
    res.json(updatedUser);
});

exports.deleteUser = asyncHandler(async (req, res) => {
    await userService.deleteUser(req.params.id);
    res.status(204).send();
});
```

---

## 🛡️ Step 4: Middleware (Validation & Error Handling)

### 4.1 Input Validation (`middlewares/validator.js`)
เราจะใช้ **Joi** เพื่อตรวจสอบข้อมูลขาเข้าอย่างมืออาชีพ

```javascript
const Joi = require('joi');

const userSchema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    role: Joi.string().valid('admin', 'user')
});

exports.validateUser = (req, res, next) => {
    const { error } = userSchema.validate(req.body);
    if (error) {
        // 400 Bad Request
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};
```

### 4.2 Centralized Error Handler (`middlewares/errorHandler.js`)
จัดการ Error ที่ถูกโยนมาจาก Service (เช่น `USER_NOT_FOUND`)

```javascript
module.exports = (err, req, res, next) => {
    console.error(err.stack);

    if (err.message === 'USER_NOT_FOUND') {
        return res.status(404).json({ error: 'User not found' });
    }
    if (err.message === 'EMAIL_ALREADY_EXISTS') {
        return res.status(409).json({ error: 'Email already exists' });
    }

    res.status(500).json({ error: 'Something went wrong!' });
};
```

---

## 🛣️ Step 5: The Router

สร้าง `routes/userRoutes.js`: เชื่อม URL → Middleware → Controller

```javascript
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateUser } = require('../middlewares/validator');

router.route('/')
    .get(userController.getUsers)        // GET /api/users?page=1&role=admin
    .post(validateUser, userController.createUser); // มี Validation กั้นก่อน

router.route('/:id')
    .get(userController.getUserById)
    .put(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;
```

---

## 🚀 Step 6: Main Entry (`app.js`)

```javascript
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// 1. Global Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// 2. Mounting Routes
app.use('/api/users', userRoutes);

// 3. 404 Handler
app.all('*', (req, res, next) => {
    res.status(404).json({ error: `Not Found: ${req.originalUrl}` });
});

// 4. Global Error Handler (ต้องอยู่ล่างสุด!)
app.use(errorHandler);

module.exports = app;
```

สร้าง `server.js` แยกมาเพื่อรัน (Good Practice):
```javascript
const app = require('./app');
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`🚀 API running on port ${PORT}`);
});
```

---

## 🧪 Testing Checklist

ใช้ **Postman** หรือ **Thunder Client** ยิงทดสอบ:

1.  **GET /api/users**: ได้ Array `[...]`
2.  **POST /api/users**:
    *   Body: `{ "name": "Test", "email": "test@test.com" }`
    *   Result: 201 Created + User Object
3.  **POST (Error Case)**:
    *   Body: `{}` (ว่างเปล่า)
    *   Result: 400 Bad Request "Missing name or email"
4.  **GET /api/users/:id**: เอา ID ที่เพิ่งสร้างไปใส่ URL → ต้องได้ข้อมูล
5.  **DELETE /api/users/:id**: ลบแล้วลอง GET ใหม่ต้องไม่เจอ

---

---



---


> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **Service Layer:** ชั้นของโค้ดที่จัดการ Business Logic (กฎทางธุรกิจ) แยกออกจาก Controller
> *   **Controller:** ชั้นของโค้ดที่จัดการ HTTP Request/Response (Traffic Police)
> *   **Repository/Model:** ชั้นของโค้ดที่จัดการ Database โดยตรง (ในบทนี้ใช้ Mock Data แทน)
> *   **Async/Await:** วิธีการเขียนโค้ด Asynchronous ให้ดูเหมือน Synchronous (อ่านง่าย)
> *   **DTO (Data Transfer Object):** วัตถุที่ใช้ส่งข้อมูลระหว่าง Process (เช่น `req.body` ที่ผ่านการ Validate แล้ว)
> *   **Validation Schema:** โครงสร้างกฎที่ใช้ตรวจสอบข้อมูล (เช่น Joi Schema)
> *   **Pagination:** การแบ่งข้อมูลเป็นหน้าๆ เพื่อไม่ให้ Server โหลดหนักเกินไป
> *   **HTTP 201 Created:** Status Code ที่บอกว่าสร้างข้อมูลสำเร็จ
> *   **HTTP 204 No Content:** Status Code ที่บอกว่าทำสำเร็จแต่ไม่มีเนื้อหาส่งกลับ (นิยมใช้กับ DELETE)



---

## 7. Deep Dive: Testing with Supertest 🧪

จะรู้ได้ไงว่า API เราไม่พัง? ต้องเขียน Test!
เรานิยมใช้ **Jest** คู่กับ **Supertest** เพื่อยิง API จำลอง

```javascript
const request = require('supertest');
const app = require('../app');

describe('GET /api/users', () => {
    it('should return all users', async () => {
        const res = await request(app).get('/api/users');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    });
});
```

---



## 9. Challenges 🏆

### 🦁 Level 1: เพิ่ม Validation Email (ด้วย Joi)
ใน `checkBody`: เช็คว่า email ต้องมีเครื่องหมาย `@` ถ้าไม่มีให้ reject (400)

### 🐯 Level 2: Router Param Middleware
ใช้ `router.param('id', ...)` ใน `userRoutes.js` เพื่อทำ Logic `findUser` ที่เดียว!
ถ้า ID ไม่เจอ ให้ส่ง 404 ทันที (ไม่ต้องไปถึง Controller)

### 🐲 Level 3: Environment Config
แยก `PORT` ไปไว้ใน `.env` และใช้ `dotenv` ในการโหลด

---


