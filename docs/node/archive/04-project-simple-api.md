# 🎯 Project: RESTful API Server (สร้าง API แบบมืออาชีพ! 🌐)

> **"APIs are the glue of the modern web."**
> — *Tech Wisdom*

ยินดีต้อนรับสู่ **Project 4: The Masterclass!** 
ที่ผ่านมาเราเขียน Server แบบ "รวมทุกอย่างไว้ในไฟล์เดียว" (Spaghetti Code 🍝) ซึ่งใช้ได้กับโปรเจกต์เล็กๆ... แต่ในโลกความจริง **ทำแบบนั้นไม่ได้!**

ในโปรเจกต์นี้ เราจะสร้าง **"E-Commerce API"** ที่มีโครงสร้างมาตรฐานบริษัท (Standard Architecture) แยกส่วนชัดเจน รองรับการขยายตัวในอนาคต

---

## 🎯 The Goal (เป้าหมาย)

สร้าง API Server สำหรับร้านค้าออนไลน์ ที่มี Features:
1.  **Product Management:** `GET /products`, `GET /products/:id`
2.  **Search & Filter:** `GET /products?category=tech`
3.  **Modern Architecture:** แยก Router, Controller, Data ออกจากกัน (MVC-ish)
4.  **Security:** รองรับ **CORS** (ให้ Frontend ต่างโดเมนยิงได้)
5.  **Standard Response:** ส่ง JSON พร้อม Status Code ที่ถูกต้องเสมอ

---

## 🏗️ Architecture Design (MVC Pattern)

เราจะไม่อัดทุกอย่างใน `server.js` อีกต่อไป!

```
ecommerce-api/
├── data/               ← ฐานข้อมูลจำลอง (Mock DB)
│   └── products.json
├── controllers/        ← สมองของระบบ (Logic)
│   └── productController.js
├── routes/             ← ป้ายบอกทาง (Mapping URL → Controller)
│   └── productRoutes.js
├── utils/              ← เครื่องมือช่วย (Helper)
│   └── response.js     (ช่วยส่ง JSON สวยๆ)
├── server.js           ← จุดเริ่มต้น (Entry Point)
└── package.json
```

---

## 🛠️ Phase 1: Setup & Data Layer

### 1.1 Init Project
```bash
mkdir ecommerce-api
cd ecommerce-api
npm init -y
```

### 1.2 Update package.json
เพิ่ม `dev` script เพื่อใช้ node watch mode (Node v18+):
```json
"scripts": {
  "dev": "node --watch server.js"
}
```

### 1.3 Create Mock Data (`data/products.json`)
สร้างข้อมูลสินค้าจำลอง:

```json
[
  { "id": 1, "name": "MacBook Pro", "category": "tech", "price": 45000 },
  { "id": 2, "name": "Mechanical Keyboard", "category": "tech", "price": 3500 },
  { "id": 3, "name": "Coffee Mug", "category": "lifestyle", "price": 250 },
  { "id": 4, "name": "Notion Template", "category": "digital", "price": 500 }
]
```

---

## 🧠 Phase 2: Utilities & Helper

สร้างตัวช่วยเพื่อให้โค้ดหลักสะอาดขึ้น

### 2.1 Response Helper (`utils/response.js`)
ฟังก์ชันมาตรฐานสำหรับส่งคำตอบกลับ

```javascript
// utils/response.js

const sendJSON = (res, statusCode, data) => {
    res.writeHead(statusCode, { 
        'Content-Type': 'application/json',
        // ✅ CORS Headers (อนุญาตให้ทุกคนเข้าถึง)
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    });
    res.end(JSON.stringify(data));
};

const sendError = (res, statusCode, message) => {
    sendJSON(res, statusCode, { success: false, error: message });
};

module.exports = { sendJSON, sendError };
```

---

## 🎮 Phase 3: Controllers (Business Logic)

ส่วนที่สำคัญที่สุด! คือ "สมอง" ที่คอยคิดว่าจะทำอะไรกับข้อมูล

### 3.1 Product Controller (`controllers/productController.js`)

```javascript
const products = require('../data/products.json');
const { sendJSON, sendError } = require('../utils/response');

// GET /api/products
const getProducts = (req, res) => {
    // 1. Parse Query String (e.g. ?category=tech)
    const url = new URL(req.url, `http://${req.headers.host}`);
    const category = url.searchParams.get('category');

    let result = products;

    // 2. Filter Logic
    if (category) {
        result = products.filter(p => p.category === category);
    }

    sendJSON(res, 200, { success: true, count: result.length, data: result });
};

// GET /api/products/:id
const getProductById = (req, res, id) => {
    const product = products.find(p => p.id === parseInt(id));

    if (!product) {
        return sendError(res, 404, "Product Not Found");
    }

    sendJSON(res, 200, { success: true, data: product });
};

module.exports = { getProducts, getProductById };
```

---

## 🚦 Phase 4: Server & Routing (The Gateway)

นี่คือ "พนักงานต้อนรับ" ที่คอยดู URL แล้วส่งต่อให้ Controller

### 4.1 Route Switcher (`server.js`)

```javascript
const http = require('http');
const { getProducts, getProductById } = require('./controllers/productController');
const { sendError } = require('./utils/response');

const PORT = 3000;

const server = http.createServer((req, res) => {
    // Log ทุก Request ที่เข้ามา
    console.log(`📡 [${req.method}] ${req.url}`);

    // CORS Preflight (สำหรับ Browser)
    if (req.method === 'OPTIONS') {
        res.writeHead(204, { 
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        });
        res.end();
        return;
    }

    const url = req.url.split('?')[0]; // ตัด Query param ออกเพื่อดู Path หลัก

    // --- Routing Logic ---
    
    // 1. GET All Products / Filter
    if (url === '/api/products' && req.method === 'GET') {
        getProducts(req, res);
    } 
    
    // 2. GET Single Product (Dynamic Route: /api/products/1)
    else if (url.match(/\/api\/products\/\d+/) && req.method === 'GET') {
        const id = url.split('/')[3]; // ดึง ID จาก URL
        getProductById(req, res, id);
    } 
    
    // 3. 404 Not Found
    else {
        sendError(res, 404, "API Endpoint Not Found");
    }
});

server.listen(PORT, () => {
    console.log(`🚀 API Server running at http://localhost:${PORT}`);
});
```

---

## 🧪 Testing Time!

เปิด Terminal รัน: `npm run dev` แล้วทดสอบผ่าน **Browser** หรือ **Postman**:

1.  **Get All:** `http://localhost:3000/api/products`
    *   ✅ ได้ JSON สินค้าทั้งหมด
2.  **Filter:** `http://localhost:3000/api/products?category=tech`
    *   ✅ ได้เฉพาะสินค้าหมวด Tech
3.  **Get One:** `http://localhost:3000/api/products/1`
    *   ✅ ได้ MacBook Pro
4.  **Error Case:** `http://localhost:3000/api/products/999`
    *   ✅ ได้ 404 Error `{"success": false, "error": "Product Not Found"}`

---

> **📖 คำศัพท์เทคนิค (Glossary):**
> *   **MVC Architecture:** รูปแบบการออกแบบซอฟต์แวร์ที่แยก Model (Data), View (Response), Controller (Logic)
> *   **Controller:** ส่วนจัดการ Logic หลักของระบบ รับผิดชอบการตัดสินใจและสั่งการ
> *   **Response Wrapper:** การสร้างฟังก์ชันกลางเพื่อส่ง Response รูปแบบเดียวกันเสมอ (Standard Format)
> *   **Dynamic Routing:** Route ที่รองรับค่าที่เปลี่ยนแปลงได้ (เช่น `/products/:id` จับ ID อะไรก็ได้)
> *   **CORS:** Cross-Origin Resource Sharing — ระบบความปลอดภัยที่อนุญาตให้เว็บต่างโดเมนเรียก API เราได้
> *   **Query Params:** ค่าที่ส่งมากับ URL หลังเครื่องหมาย `?` (ใช้สำหรับ Search/Filter)
> *   **Mock Data:** ข้อมูลจำลองที่สร้างขึ้นมาทดแทน Database จริงเพื่อใช้ในการพัฒนาเบื้องต้น

## 🏆 Extra Challenges (ท้าทาย)

### 🦁 Level 1: Create Product (POST)
เพิ่ม Logic รับ `POST /api/products` เพื่อเพิ่มสินค้าใหม่ (รับ Body เป็น JSON)
*   Hint: ต้องใช้ `req.on('data')` เพื่อรับ Body Stream

### 🐯 Level 2: Delete Product (DELETE)
เพิ่ม Logic `DELETE /api/products/:id` เพื่อลบสินค้า
*   Hint: ใช้ `filter` เพื่อกรอง ID นั้นออก (จำลองการลบ)

### 🐲 Level 3: Refactor Router
ถ้าเริ่มมี User, Order, Cart... `server.js` จะบวมมาก!
จงแยกไฟล์ `routes/productRoutes.js` ออกมาจัดการ Routing เฉพาะของ Product
*   Hint: ส่ง `req, res` ไปให้ Router ตัดสินใจแทน Main Server

---
