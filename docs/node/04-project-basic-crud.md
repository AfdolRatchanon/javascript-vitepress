# Project 4: Basic CRUD API (In-Memory) 🛒

> **"Create, Read, Update, Delete. The bread and butter of every developer."**

ยินดีต้อนรับสู่โปรเจกต์แรกอย่างเป็นทางการ! เราจะสร้าง **RESTful API** สำหรับจัดการข้อมูลสินค้า (Products)
โดยในบทนี้เราจะยังไม่ใช้ Database (เพื่อให้โฟกัสที่ Logic ของ API ก่อน) แต่จะเก็บข้อมูลไว้ในตัวแปร Array ใน Ram (In-Memory) แทน


## 🎯 Project Goals

1.  เข้าใจ Concept ของ **RESTful API** (GET, POST, PUT, DELETE)
2.  จัดการ **Status Code** ให้ถูกต้อง (200, 201, 404, 400)
3.  Design **URL Endpoint** ที่สวยงามและสื่อความหมาย
4.  ฝึกใช้ **Postman** ยิงทดสอบ


## 🛠️ Step 1: Project Setup

เริ่มจากการสร้างโฟลเดอร์และลง Express

```bash
mkdir my-crud-api
cd my-crud-api
npm init -y
npm install express
```

สร้างไฟล์ `app.js`:

```javascript
const express = require('express');
const app = express();
const PORT = 3000;

// Middleware เพื่ออ่าน JSON Body
app.use(express.json());

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
```


## 💾 Step 2: In-Memory Database

เราจะจำลอง Database ด้วย Array ง่ายๆ

```javascript
// Mock Data
let products = [
    { id: 1, name: 'Laptop', price: 25000 },
    { id: 2, name: 'Mouse', price: 500 },
    { id: 3, name: 'Keyboard', price: 1200 }
];

// POSTMAN Test: GET http://localhost:3000/products
```


## 💻 Step 3: Implementation (CRUD)

### 3.1 READ (GET) 📖
ดึงข้อมูลทั้งหมด หรือ ดึงตาม ID

```javascript
// 1. Get All Products
app.get('/products', (req, res) => {
    res.json(products);
});

// 2. Get Single Product by ID
app.get('/products/:id', (req, res) => {
    const id = parseInt(req.params.id); // params เป็น string ต้องแปลงเป็น int
    const product = products.find(p => p.id === id);

    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
});
```

### 3.2 CREATE (POST) ➕
เพิ่มข้อมูลใหม่

```javascript
app.post('/products', (req, res) => {
    const newProduct = {
        id: products.length + 1, // Generate ID แบบง่ายๆ (ระวังซ้ำถ้ามีการลบ)
        name: req.body.name,
        price: req.body.price
    };

    // Validation (กันข้อมูลมั่ว)
    if (!newProduct.name || !newProduct.price) {
        return res.status(400).json({ message: 'Please provide name and price' });
    }

    products.push(newProduct);
    
    // 201 Created ส่งข้อมูลที่เพิ่งสร้างกลับไปยืนยัน
    res.status(201).json(newProduct);
});
```

### 3.3 UPDATE (PUT) ✏️
แก้ไขข้อมูล (แทนที่ทั้งก้อน)

```javascript
app.put('/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({ message: 'Product not found' });
    }

    // อัพเดทข้อมูล
    products[index] = {
        id: id,
        name: req.body.name,
        price: req.body.price
    };

    res.json(products[index]);
});
```

### 3.4 DELETE (DELETE) 🗑️
ลบข้อมูล

```javascript
app.delete('/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({ message: 'Product not found' });
    }

    // ลบออกจาก Array 1 ตัว ที่ตำแหน่ง index
    const deletedProduct = products.splice(index, 1);

    res.json({ message: 'Product deleted', product: deletedProduct[0] });
});
```


## 🧪 4. Testing Guide (Postman)

อย่าเชื่อ Code จนกว่าจะได้ Test! ให้เปิด Postman ขึ้นมาทดสอบตามนี้:

1.  **GET All**
    *   Method: `GET`
    *   URL: `http://localhost:3000/products`
    *   Expect: เห็น Array ของสินค้า 3 ชิ้น

2.  **Create New**
    *   Method: `POST`
    *   URL: `http://localhost:3000/products`
    *   Body (Raw JSON): `{"name": "Gaming Chair", "price": 5500}`
    *   Expect: Status 201, ได้ JSON สินค้าใหม่กลับมา

3.  **Update**
    *   Method: `PUT`
    *   URL: `http://localhost:3000/products/2`
    *   Body: `{"name": "Wireless Mouse", "price": 990}`
    *   Expect: Status 200, ชื่อเปลี่ยนจาก Mouse เป็น Wireless Mouse

4.  **Delete**
    *   Method: `DELETE`
    *   URL: `http://localhost:3000/products/1`
    *   Expect: Status 200, ลอง GET All อีกทีต้องไม่เจอ ID 1 แล้ว


## 🛡️ 5. Challenges & Improvements

### ⚠️ Bug Alert: ID Generation
Code `id: products.length + 1` มีบั๊ก!
ถ้าเรามีสินค้า ID 1, 2, 3
ลบ ID 3 ออก -> products.length = 2
เพิ่มใหม่ -> ได้ ID 3 (ซ้ำกับตัวที่เพิ่งลบไป ถ้ามี Log เก่าจะงง)

**Challenge 1:** แก้ Logic การเจน ID ให้ไม่ซ้ำกัน (เช่น ใช้ `Date.now()` หรือหา Max ID + 1)

### ⚠️ Bug Alert: Input Type
ถ้า User ส่ง `price: "แพงมาก"` มา Code เราจะพังไหม?

**Challenge 2:** เพิ่ม Validation เช็ค type ของราคาต้องเป็น number และมากกว่า 0

```javascript
/* ตัวอย่าง */
if (typeof req.body.price !== 'number' || req.body.price <= 0) {
    return res.status(400).json({ message: 'Price must be a positive number' });
}
```


## 📚 FAQ

**Q: ทำไมพอ Restart Server แล้วข้อมูลที่เพิ่มหายหมด?**
A: เพราะเราเก็บใน In-Memory (ตัวแปร) พอ Process จบ ตัวแปรก็หายครับ ถ้าอยากเก็บถาวรต้องใช้ Database หรือเขียนลง File (เดี๋ยวเรียนในบทต่อไป)

**Q: PUT vs PATCH ต่างกันยังไง?**
A:
*   **PUT**: แทนที่ข้อมูล "ทั้งหมด" (ถ้าส่งมาแค่ name, price จะหายไป)
*   **PATCH**: แก้ไข "บางส่วน" (ส่งมาแค่ name ก็แก้แค่ name)


👉 **[ไปต่อ: Module 5 - Middleware & Clean Architecture](/node/05-01-middleware-concept)**
