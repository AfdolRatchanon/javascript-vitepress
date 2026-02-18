# 🚀 Project 11: High Performance API

ในโปรเจกต์นี้ เราจะมาเร่งความเร็ว API ของเราให้เหมือนติด Turbo!
โดยการใช้ **Redis Caching Middleware** 🏎️

> **Goal**: ทำให้ Endpoint ที่ดึงข้อมูลช้าๆ (เช่น Report, Dashboard, Product List) เร็วขึ้น 10-100 เท่า!


## 🛠️ Step 1: Redis Helper (`utils/cache.js`)

เราจะเขียน Helper Function เพื่อให้ชีวิตง่ายขึ้น

```javascript
const client = require('../config/redis'); // จากบทที่แล้ว

// ฟังก์ชันเก็บ Cache
exports.setCache = async (key, data, ttl = 300) => {
    await client.set(key, JSON.stringify(data), { EX: ttl });
};

// ฟังก์ชันดึง Cache
exports.getCache = async (key) => {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
};

// ฟังก์ชันลบ Cache (ใช้ตอน Update/Delete)
exports.clearCache = async (key) => {
    await client.del(key);
};
```


## 🛠️ Step 2: Caching Middleware

แทนที่จะเขียน Logic ซ้ำๆ ในทุก Route... เรามาสร้าง Middleware กันดีกว่า
ไอเดียคือ: **"ถ้ามี Cache ให้ส่งกลับเลย ไม่ต้องไปถึง Controller"**

```javascript
/* middleware/cacheMiddleware.js */
const client = require('../config/redis');

const checkCache = (duration) => {
    return async (req, res, next) => {
        // สร้าง Key จาก URL (เช่น /api/products?page=1)
        const key = `express_cache:${req.originalUrl}`; // originalUrl รวม query string ด้วย

        try {
            const cachedData = await client.get(key);
            
            if (cachedData) {
                // ✅ Cache HIT: ส่งของกลับเลย
                return res.json({
                    success: true,
                    source: 'redis',
                    data: JSON.parse(cachedData)
                });
            } else {
                // ❌ Cache MISS: ไปต่อ (next)
                // แต่เดี๋ยวก่อน! เราต้องดักตอนขากลับ (res.send) เพื่อเอาของมาเก็บ Cache ด้วย
                // (วิธีนี้ Advance หน่อย เรียกว่าการ override response method)
                res.originalJson = res.json;
                
                res.json = (body) => {
                    // เก็บ Cache ก่อนส่ง
                     if (res.statusCode === 200) { // เก็บเฉพาะตอน success
                        client.set(key, JSON.stringify(body.data || body), { EX: duration });
                     }
                    // เรียก method เดิมเพื่อส่ง response จริงๆ
                    res.originalJson(body);
                };
                
                next();
            }
        } catch (err) {
            // ถ้า Redis พัง... อย่าให้เว็บพัง ให้ข้าม Cache ไป query database ปกติ
            console.error('Redis Error:', err);
            next();
        }
    };
};

module.exports = checkCache;
```


## 🛠️ Step 3: Use in Routes

ง่ายเหมือนปลอกกล้วย! แค่แปะ Middleware ไปข้างหน้า

```javascript
/* routes/productRoutes.js */
const checkCache = require('../middleware/cacheMiddleware');
const productController = require('../controllers/productController');

// Cache 60 วินาที
router.get('/', checkCache(60), productController.getAllProducts);

// Cache 5 นาที (300 วิ) สำหรับสินค้าเดี่ยว
router.get('/:id', checkCache(300), productController.getProductById);
```


## 🧪 Testing Performance

ลองวัดความเร็วด้วย **Postman** (ดูช่อง Time มุมขวาบน)

| ครั้งที่ | Source | Time (approx.) |
|:---|:---|:---|
| 1 | Database (MySQL/Mongo) | 150ms - 500ms 🐢 |
| 2 | Redis Cache | **5ms - 20ms** 🚀 |
| 3 | Redis Cache | **5ms - 20ms** 🚀 |

เห็นความต่างไหมครับ? เร็วขึ้นเป็น 10 เท่า!


## 🧩 Challenge: Auto Invalidate by Pattern

ถ้าเรามี Cache สินค้าเยอะมาก (`product:1`, `product:2`, `products:page:1`)
เวลาเพิ่มสินค้าใหม่... เราอยากลบ Cache ที่เกี่ยวข้องทั้งหมด
ลองค้นหาวิธีการลบ Cache แบบ **Pattern Matching** (เช่น `product:*`) ใน Redis

::: details ✨ เฉลย
Redis ไม่แนะนำให้ใช้คำสั่ง `KEYS product:*` ใน Production (เพราะมันช้าจน Server ค้างได้)
วิธีที่ถูกคือ:
1.  **ใช้ Set**: เก็บรายการ Key ทั้งหมดไว้ใน Set `product_keys`
2.  **Tagging**: เก็บ version ไว้ใน key
3.  **Scan**: ใช้คำสั่ง `SCAN` เพื่อทยอยหา (ปลอดภัยกว่า KEYS)
   
*แต่สำหรับโปรเจกต์เล็กๆ การลบเฉพาะ ID ที่เปลี่ยน หรือปล่อยให้หมดอายุเอง (TTL) ก็เพียงพอแล้วครับ*
:::


> 👉 **ไปต่อ: [Module 12: Real-time Communication (Socket.IO)](/node/12-01-websockets-intro)**
