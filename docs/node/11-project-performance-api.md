# Project 11: High Performance API 🚀

> **"Premature optimization is the root of all evil... but slow APIs are worse."**

API ที่เราเขียนมาอาจจะเร็วดีเมื่อมีข้อมูลแค่ 100 แถว
แต่ถ้าวันนึงข้อมูลมี **1 ล้านแถว**? หรือ User เข้ามาพร้อมกัน **10,000 คน**? 💥
โปรเจกต์นี้เราจะมา "จูนเครื่อง" ให้ API เร็ว แรง ทะลุนรก!


## 🎯 Project Goals

1.  **Pagination**: หั่นข้อมูลส่งทีละนิด (ไม่ใช่ส่งทั้งหมดล้านแถว)
2.  **Compression**: บีบอัดข้อมูลก่อนส่ง (Gzip) เพื่อลดขนาด Network
3.  **Indexing**: สร้างสารบัญให้ Database ค้นหาเร็วขึ้น 100 เท่า
4.  **Lean Queries**: ดึงเฉพาะ Field ที่ใช้ (Projection) และไม่สร้าง Mongoose Document (`.lean()`)


## 🛠️ 1. Setup Data Seeding

เราต้องมีข้อมูลเยอะๆ เพื่อทดสอบความช้า
สร้าง Script `seed.js` เพื่อยัดข้อมูลปลอม 100,000 แถว

```javascript
/* seed.js */
const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI);

const seed = async () => {
    const products = [];
    for (let i = 0; i < 100000; i++) {
        products.push({
            name: `Product ${i}`,
            price: Math.floor(Math.random() * 10000),
            category: 'Electronics',
            createdAt: new Date()
        });
    }
    await Product.insertMany(products); // Bulk Insert
    console.log('Done!');
    process.exit();
};

seed();
```


## 🏎️ 2. Pagination (Server-Side)

อย่าหาทำ `Product.find()` เฉยๆ กับข้อมูลแสนแถว!
Server จะ Memory Overflow และคนใช้งานจะรอนานมาก

### Implementation

```javascript
/* controllers/productController.js */
exports.getProducts = async (req, res) => {
    // 1. รับ page และ limit จาก Query String (Set default ไว้)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // 2. คำนวณข้าม (Skip)
    const skip = (page - 1) * limit;

    // 3. Query
    const products = await Product.find()
        .skip(skip)
        .limit(limit)
        .lean(); // 🔥 Trick: ไม่ต้องสร้าง Mongoose Object (เร็วขึ้น 2-3 เท่า)

    // 4. นับจำนวนทั้งหมด (เพื่อบอก Frontend ว่ามีกี่หน้า)
    const total = await Product.countDocuments();

    res.json({
        data: products,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    });
};
```


## 📦 3. Compression (Gzip)

Text (JSON) บีบอัดได้ดีมากๆ (ลดขนาดได้ 70-80%)
แค่ใส่ Middleware `compression` ตัวเดียว จบ!

### Installation
```bash
npm install compression
```

### Usage
```javascript
/* app.js */
const compression = require('compression');

// ใส่ไว้บนสุดเลย!
app.use(compression());
```


## 🔍 4. Database Indexing

สมมติเราค้นหา `Product.find({ name: "Product 99999" })`
ถ้าไม่มี Index... MongoDB ต้องไล่เปิดดูทีละ document จนครบแสนตัว (Scan) 🐢

### Creating Index
```javascript
/* models/Product.js */
const productSchema = new mongoose.Schema({
    name: { type: String, index: true }, // ✅ สร้าง Index ที่ชื่อ
    price: Number,
    category: String
});

// หรือ Compound Index (ค้นหาหลายเงื่อนไขพร้อมกัน)
productSchema.index({ category: 1, price: -1 }); // หาหมวดหมู่ แล้วเรียงราคา
```

### Explain Plan
ลองใช้ `.explain('executionStats')` เพื่อดูว่ามันเร็วขึ้นจริงไหม

*   **Before Index**: `totalDocsExamined: 100000` (อ่านแสนตัว)
*   **After Index**: `totalDocsExamined: 1` (อ่านตัวเดียว) ⚡


## 🧪 5. Load Testing (Optional)

อยากรู้ว่ารับไหวแค่ไหน? ใช้ **k6** หรือ **Apache Benchmark (ab)** ยิงถล่มดู

```bash
# ยิง 1000 request, พร้อมกัน 10 connections
ab -n 1000 -c 10 http://localhost:3000/api/products
```

เทียบดู Requests per second (RPS) ระหว่างก่อนปรับ vs หลังปรับ


## ⚡ Challenge: Caching with Redis 🔴

**โจทย์**:
แม้จะจูน DB แล้ว แต่ถ้าคนเข้าหน้าแรกพร้อมกัน 1,000 คน ก็ยังเปลือง Resource อยู่ดี
ให้ใช้ **Redis** มา Cache หน้าแรกไว้ (TTL 60 วินาที)

Logic:
1.  Check Redis: มีของไหม? -> มี -> ส่งกลับเลย (ไม่ต้องถาม Mongo)
2.  ไม่มี -> ถาม Mongo -> เก็บลง Redis -> ส่งกลับ


## 📚 FAQ

**Q: `.lean()` คืออะไร?**
A: ปกติ Mongoose จะ Return "Mongoose Document" ที่มี method เยอะแยะ (`.save()`, virtuals) ซึ่งกิน Ram และช้า
การใช้ `.lean()` บอก Mongoose ว่า "ขอแค่ Plain JS Object (JSON) พอ" (เอาไปแก้ค่าไม่ได้นะ)

**Q: Indexing มีข้อเสียไหม?**
A: มี! ทำให้การ **Insert/Update ช้าลง** เพราะต้องไปแก้สารบัญ Index ด้วย และเปลืองพื้นที่ Disk ฉะนั้นสร้างเฉพาะ Field ที่ใช้ค้นหาบ่อยๆ พอ


👉 **[ไปต่อ: Module 12 - Real-time Communication](/node/12-01-websockets-intro)**
