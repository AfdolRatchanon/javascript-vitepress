# 08-3: Authentication Middleware & RBAC 🛡️

> *"Trust, but verify."* — **Russian Proverb**

ในบทที่ผ่านมาเรารู้วิธีสร้าง **JWT Card** แจกให้ User แล้ว 🎫
บทนี้เราจะมาสร้าง **"ยาม" (Middleware)** เพื่อตรวจบัตรนั้นก่อนอนุญาตให้เข้าถึงข้อมูลสำคัญ
และจะอัปเกรดให้รองรับ **RBAC (Role-Based Access Control)** เพื่อแยกสิทธิ์ Admin vs User ธรรมดา


## 🐣 Analogy: The Club Bouncer (การ์ดหน้าคลับ)

- **Express App** = คลับสุดหรู 💃
- **Route (`/profile`, `/admin`)** = โซน VIP ด้านใน
- **Middleware** = **การ์ด (Bouncer)** ที่ยืนขวางประตู
    - ลูกค้าเดินมา -> การ์ดขอดูข้อมือ (Token)
    - **ถ้ามีและไม่หมดอายุ** -> "เชิญครับ" (`next()`)
    - **ถ้าไม่มีหรือบัตรปลอม** -> "เชิญกลับบ้านครับ" (`401 Unauthorized`)
    - **ถ้าจะเข้าห้องผู้จัดการ (Admin Zone)** -> ดูสีของสายรัดข้อมือ (Role) ว่าใช่สีทองไหม? ถ้าใช่ถึงให้เข้า


## 🛠️ 1. สร้าง Auth Middleware

เราจะแยก Middleware นี้ไว้ในไฟล์ `middleware/authMiddleware.js` เพื่อให้นำไปแปะได้ทุกที่

```javascript
/* middleware/authMiddleware.js */
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  // 1. ดึง Token จาก Header (นิยมส่งมาแบบ "Bearer <token>")
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  try {
    // 2. ตัดคำว่า "Bearer " ออก เหลือแค่ตัว Token
    const token = authHeader.split(' ')[1];

    // 3. ตรวจสอบลายเซ็น (Verify Signature)
    // process.env.JWT_SECRET ต้องตรงกับตอน Sign นะ!
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. ถ้าผ่าน: แปะข้อมูล User ลงใน req เพื่อให้ Route ถัดไปใช้ต่อได้
    req.user = decoded; 
    
    console.log('User verified:', req.user.username); // (Optional) Log ดูเล่น
    next(); // ✅ อนุญาตให้ไปต่อ
  } catch (error) {
    // 5. ถ้าไม่ผ่าน (Token หมดอายุ, ปลอม, ผิด format)
    res.status(403).json({ message: 'Token is not valid' });
  }
};

module.exports = protect;
```


## 🔒 2. Protecting Routes (การใช้งานจริง)

สมมติเรามีไฟล์ `routes/userRoutes.js` เราอยากล็อก Route ให้เข้าได้เฉพาะคนมี Token

```javascript
/* routes/userRoutes.js */
const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware'); // Import มา

// Public Route (ใครก็เข้าได้)
router.get('/public', (req, res) => {
  res.json({ message: 'This is public content.' });
});

// Protected Route (ต้องมี Token) 🔒
router.get('/profile', protect, (req, res) => {
  // เข้าถึง req.user ได้ เพราะ protect แปะไว้ให้
  res.json({ 
    message: `Welcome back, ${req.user.username}`,
    role: req.user.role 
  });
});

module.exports = router;
```


## 👮 3. Role-Based Access Control (RBAC)

บางครั้งแค่ "ล็อกอินแล้ว" ยังไม่พอ... ต้องเป็น **Admin** ด้วยถึงจะลบข้อมูลได้!
เราจะสร้าง Middleware อีกตัวชื่อ `adminOnly` มาทำงานต่อจาก `protect`

```javascript
/* middleware/authMiddleware.js (เพิ่มต่อจากเดิม) */

// ... (protect function เดิม) ...

const adminOnly = (req, res, next) => {
  // เช็คว่า protect ทำงานมาก่อนหรือยัง? (ต้องมี req.user)
  if (req.user && req.user.role === 'admin') {
    next(); // ✅ เป็น Admin จริง -> ไปต่อ
  } else {
    res.status(403).json({ message: 'Admin access required' }); // ⛔ ห้ามเข้า
  }
};

module.exports = { protect, adminOnly }; // Export ทั้งคู่
```

### การใช้งานแบบ Chaining Middleware

```javascript
/* routes/adminRoutes.js */
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ต้องผ่านด่าน protect ก่อน -> แล้วค่อยเจอ adminOnly
router.delete('/delete-user/:id', protect, adminOnly, (req, res) => {
  res.json({ message: 'User deleted successfully (Admin Action)' });
});
```


## 🥊 Challenges

### Level 1: Multi-Role Support
จงแก้ไข `adminOnly` ให้เป็นฟังก์ชัน `authorize(...roles)` ที่รับ Role ได้หลายแบบ เช่น `authorize('admin', 'manager')`

::: details ✨ เฉลย
```javascript
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role ${req.user.role} is not authorized` });
    }
    next();
  };
};

// Usage:
// router.delete('/file', protect, authorize('admin', 'editor'), deleteFileHandler);
```
:::

### Level 2: Token Blacklist (Logout)
เมื่อ User กด Logout เราจะทำยังไงให้ Token เดิมใช้ไม่ได้อีก? (ปกติ JWT หมดอายุยาก)
ลองเสนอไอเดีย (Concept)

::: details ✨ เฉลย
1.  **Client-Side**: ลบ Token ออกจาก LocalStorage (แต่นั่นแค่ฝั่ง Client)
2.  **Server-Side (Blacklist)**:
    - สร้าง Redis หรือ DB Table เก็บ `token` ที่ถูก Logout
    - ใน `protect` middleware: เช็คว่า Token นี้อยู่ใน Blacklist ไหม? ถ้าอยู่ -> Reject
    - ตั้ง TTL ให้ Blacklist record หมดอายุเท่ากับอายุ Token เพื่อไม่ให้รก DB
:::


## 📚 Glossary

| คำศัพท์ | ความหมาย |
|:--------|:---------|
| **Middleware Chaining** | การต่อ Middleware หลายตัวเรียงกัน (เช่น checkAuth -> checkAdmin -> Controller) |
| **RBAC** | Role-Based Access Control การจัดการสิทธิ์ตามบทบาท (User, Admin, Editor) |
| **401 Unauthorized** | ไม่มีสิทธิ์เข้า (เพราะไม่ยืนยันตัวตน / ไม่มี Token) |
| **403 Forbidden** | ยืนยันตัวตนแล้ว แต่สิทธิ์ไม่ถึง (เช่น เป็น User ธรรมดาจะเข้าห้อง Admin) |
| **Bearer** | ผู้ถือครอง (Token) ใครถือบัตรนี้มา เราให้บริการหมด (เหมือนธนบัตร) |


> 👉 **บทต่อไป: [Project: Secure Auth System](/node/08-project-auth-system)**
