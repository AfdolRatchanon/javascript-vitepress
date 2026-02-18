# 🏆 Project 15: E-Commerce API

> *"The best way to predict the future is to invent it."* — **Alan Kay**

นี่คือบททดสอบสุดท้าย! เราจะสร้าง API ร้านค้าครบวงจร
เนื่องจากโค้ดจะเยอะมาก ผมจะตัดมาเฉพาะส่วนสำคัญ (Core Logic) ให้ดูนะครับ
คุณต้องนำไปประกอบร่างเป็น Project structure เอง (MVC Pattern)



## 🛠️ Step 1: Models

### `models/User.js`
(เหมือนโปรเจกต์ Auth แต่เพิ่ม field address)

### `models/Product.js`
```javascript
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    imageUrl: String,
    stock: { type: Number, default: 0 },
    category: String
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
```

### `models/Order.js`
```javascript
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 },
        price: Number // เก็บราคา ณ ตอนซื้อ ไว้กันราคาสินค้าเปลี่ยน
    }],
    totalAmount: Number,
    status: { type: String, default: 'pending', enum: ['pending', 'paid', 'shipped'] }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
```



## 🛠️ Step 2: Product Controllers (Admin Function)

ฟีเจอร์สำหรับ Admin: เพิ่มสินค้าพร้อมรูปภาพ

```javascript
// routes/products.js
const express = require('express');
const upload = require('../middleware/upload'); // (จาก module 9)
const Product = require('../models/Product');
const { verifyToken, isAdmin } = require('../middleware/auth'); // (จาก module 8)

const router = express.Router();

// Create Product (Admin Only, with Image)
router.post('/', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
    try {
        const { name, price, description, stock } = req.body;
        
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

        const product = await Product.create({
            name, price, description, stock, imageUrl
        });

        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Products (Public, with Pagination)
router.get('/', async (req, res) => {
    const { page = 1, limit = 10, search } = req.query;
    
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' }; // Case-insensitive
    
    const products = await Product.find(query)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });
        
    res.json(products);
});

module.exports = router;
```



## 🛠️ Step 3: Order Controller (The Hard Part)

การสั่งซื้อสินค้า (Checkout)
1. User ส่งรายการ `[{ productId, quantity }]` มา
2. Server ต้องคำนวณราคารวม (ห้ามเชื่อราคาที่ Client ส่งมา!)
3. สร้าง Order

```javascript
// routes/orders.js
const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
    const { items } = req.body; // [{ productId: "...", quantity: 2 }]
    
    if (!items || items.length === 0) return res.status(400).json({ error: "Cart is empty" });

    try {
        let totalAmount = 0;
        const orderItems = [];

        // วนลูปสินค้าเพื่อดึงราคาจริง & ตัดสต็อก
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) continue;
            
            if (product.stock < item.quantity) {
                return res.status(400).json({ error: `${product.name} out of stock` });
            }

            // ตัดสต็อก (อย่างง่าย)
            product.stock -= item.quantity;
            await product.save();

            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price // บันทึกราคา ณ ตอนซื้อ
            });

            totalAmount += product.price * item.quantity;
        }

        // สร้าง Order
        const order = await Order.create({
            user: req.user.id,
            items: orderItems,
            totalAmount
        });

        res.status(201).json(order);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ดูประวัติการสั่งซื้อ
router.get('/my-orders', verifyToken, async (req, res) => {
    const orders = await Order.find({ user: req.user.id })
        .populate('items.product', 'name imageUrl'); // Join เอาชื่อสินค้ามาด้วย
        
    res.json(orders);
});

module.exports = router;
```



## 🚀 Deployment Checklist

1.  **Environment Variables**: ตั้งค่า `MONGO_URI`, `JWT_SECRET` ใน Dashboard ของ Cloud Provider
2.  **Remove Console Logs**: ลบ `console.log` ที่ไม่จำเป็นออก
3.  **Use PM2**: ใช้ Process Manager (`pm2`) รัน Node.js
4.  **Security Audit**: ลองยิง Test ดูว่ามีช่องโหว่ไหม



## 🎉 Congratulations!

ยินดีด้วยครับ! คุณจบหลักสูตร **Node.js Backend Zero to Hero** แล้ว! 🎓
ขอให้สนุกกับการเขียนโค้ดต่อไปครับ! Happy Coding! ❤️



> 👉 **[กลับสู่หน้าหลัก](/node/)**
