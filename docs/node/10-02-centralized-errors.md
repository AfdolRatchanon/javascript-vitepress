# Module 10.2: Centralized Error Handling 🚨

> *"Errors should never pass silently. Unless explicitly silenced."* — **Zen of Python**

คุณเคยประสบปัญหานี้ไหม?
- ลืม `try-catch` เว็บพังทั้งเว็บ
- ส่ง Error Code มั่ว (500 บ้าง 200 บ้าง)
- Frontend งงว่า Error คืออะไรกันแน่

ในบทนี้เราจะมาจัดระเบียบ Error Handling ให้เป็นระบบเดียวกันทั้ง App ด้วย **Centralized Error Handler** ครับ


## 🚑 The Problem: Try-Catch Hell

ปกติเรามักจะเขียนแบบนี้:

```javascript
/* controller/userController.js */
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    // ❌ Duplicate Code: ต้องเขียนแบบนี้ทุก Controller!
    console.error(err);
    res.status(500).json({ message: 'Server Error' }); 
  }
};
```

ถ้ามี 50 Controllers... ก็ต้องเขียน Catch 50 รอบ! 😱


## 🛠️ Solution 1: Async Handler (Wrapper)

เราจะสร้าง Wrapper Function มาครอบ Controller ไว้
หน้าที่ของมันคือ: **"ถ้ามี Error ให้ส่งต่อไปที่ Error Middleware (`next`)"**

```javascript
/* utils/asyncHandler.js */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    // รัน function ปกติ ถ้า error ให้ catch แล้วส่ง next(err)
    fn(req, res, next).catch(next);
  };
};

module.exports = asyncHandler;
```

เวลาใช้ก็แค่นี้: (**ไม่ต้องมี try-catch แล้ว!**)

```javascript
/* controller/userController.js */
const asyncHandler = require('../utils/asyncHandler');

exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      // โยน Error ไปให้ Global Handler จัดการ
      throw new Error('User not found'); 
    }
    res.json(user);
});
```


## 🛠️ Solution 2: Global Error Handler

เราจะสร้าง Middleware ตัวสุดท้ายของ App เพื่อดักจับ Error ทุกอย่างในที่เดียว

```javascript
/* middleware/errorHandler.js */
const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log ลง Console (หรือส่งเข้า Sentry)

  // กำหนด Default Status Code
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined // ซ่อน stack ใน prod
  });
};

module.exports = errorHandler;
```

อย่าลืมเอาไปใส่ใน `app.js` **(ต้องอยู่ล่างสุดของการประกาศ Route!)**

```javascript
/* app.js */
app.use('/api/users', userRoutes);
// ... routes อื่นๆ ...

// 🚑 Error Handler (วางไว้ท้ายสุด)
app.use(require('./middleware/errorHandler'));
```


## 🛠️ Solution 3: Custom Error Class

เพื่อให้เรากำหนด Status Code ได้ง่ายๆ (เช่น 404, 400, 403) เราสร้าง Class พิเศษขึ้นมา

```javascript
/* utils/AppError.js */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // บอกว่าเป็น Error ที่เรารู้จัก (ไม่ใช่ Bug)
  }
}

module.exports = AppError;
```

เวลาใช้:

```javascript
const AppError = require('../utils/AppError');

// Controller
if (!user) {
  // ส่ง 404 Not Found (แทนที่จะเป็น 500)
  throw new AppError('User not found', 404);
}

if (req.body.password.length < 6) {
  // ส่ง 400 Bad Request
  throw new AppError('Password too short', 400); 
}
```


## 🥊 Challenges

### Level 1: Mongoose Error Mapping
Mongoose ชอบส่ง Error message แปลกๆ (เช่น CastError, ValidationError)
จงแก้ไข `errorHandler` ให้แปลง Mongoose Error เป็นข้อความที่ User อ่านรู้เรื่อง

Input: `CastError: Cast to ObjectId failed for value "123"`
Allowed Output: `Resource not found (Invalid ID)` (Status 404)

::: details ✨ เฉลย
```javascript
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // 1. Mongoose Bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found`;
    error = new AppError(message, 404);
  }

  // 2. Mongoose Duplicate Key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 400);
  }

  // 3. Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new AppError(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};
```
:::


## 📚 Glossary

| คำศัพท์ | ความหมาย |
|:--------|:---------|
| **Try-Catch** | บล็อกโค้ดสำหรับดักจับ Error (ถ้าเกิด Error ใน Try -> กระโดดไป Catch) |
| **Async Handler** | ฟังก์ชัน Wrapper ที่ช่วยส่ง Async Error ไปยัง `next()` อัตโนมัติ |
| **Operational Error** | Error ที่คาดการณ์ได้ (User กรอกผิด, เน็ตหลุด, หาไฟล์ไม่เจอ) |
| **Programming Error** | Error ที่เกิดจาก Bug ของโปรแกรมเมอร์ (เขียนโค้ดผิด, ลืมประกาศตัวแปร) |


> 👉 **ไปต่อ: [Security Hardening](/node/10-03-security-hardening)**
