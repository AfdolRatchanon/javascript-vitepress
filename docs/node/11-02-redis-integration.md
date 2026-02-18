# 11-02: Redis Integration 🔴

> *"Redis is an open source, in-memory data structure store."*

**Redis** (Remote Dictionary Server) คือ Database แบบ Key-Value ที่ทำงานใน RAM ทำให้มันเร็วตีนแตก! 🏎️
นิยมใช้ทำ Caching, Session Store, และ Message Queue


## 🛠️ Setup Redis

เนื่องจาก Redis (Official) ไม่รองรับ Windows โดยตรง
ชาว Windows มี 2 ทางเลือก:
1.  **ใช้ Docker** (แนะนำ✅): `docker run -d -p 6379:6379 redis`
2.  **ใช้ WSL2**: ติดตั้งบน Linux Subsystem
3.  **ใช้ Memurai**: (Redis version Windows) สำหรับ Dev

สมมติว่าเรามี Redis รันอยู่ที่ `localhost:6379` แล้วนะครับ


## 💻 Coding with Redis

เราจะใช้ไลบรารีชื่อ `redis` (เวอร์ชัน 4+ เป็น Promise-based แล้ว ใช้ง่ายมาก)

```bash
npm install redis
```

### 1. Connection

```javascript
/* config/redis.js */
const redis = require('redis');

const client = redis.createClient({
    url: 'redis://localhost:6379'
});

client.on('error', (err) => console.log('Redis Client Error', err));
client.on('connect', () => console.log('Redis Connected! 🔴'));

// ต้อง connect ก่อนใช้งาน
(async () => {
    await client.connect();
})();

module.exports = client;
```

### 2. Set & Get Data

หลักการคือ `SET key value` และ `GET key`

```javascript
/* playground.js */
const client = require('./config/redis');

async function testRedis() {
    // 1. เก็บข้อมูล (Keyต้องเป็น String, Value ก็ต้อง String)
    await client.set('username', 'somchai');
    
    // 2. เก็บแบบมีอายุ (TTL) 10 วินาที
    await client.set('otp', '123456', { EX: 10 }); 

    // 3. ดึงข้อมูล
    const value = await client.get('username');
    console.log(value); // 'somchai'

    // 4. เก็บ Object (ต้องแปลงเป็น JSON String ก่อน)
    const user = { id: 1, name: 'Somchai' };
    await client.set('user:1', JSON.stringify(user));
    
    // ดึง Object
    const rawData = await client.get('user:1');
    const userData = JSON.parse(rawData);
}
```


## 🏗️ Caching Pattern (Cache-Aside)

นี่คือท่ามาตรฐานที่เราจะใช้ใน Project:

1.  **Check Cache**: ขอกุญแจ `sku:123` มีไหม?
    - เจอ -> Return เลย (จบข่าว)
2.  **Query DB**: ถ้าไม่เจอ -> ไปค้น Database (ช้านิดนึง)
3.  **Save Cache**: ได้ของมาแล้ว -> เอาลง Redis (ตั้ง TTL ไว้สัก 1 นาที) เพื่อให้คนต่อไปเร็ว
4.  **Return**: ส่งค่าให้ User

```javascript
app.get('/products/:id', async (req, res) => {
    const key = `product:${req.params.id}`;
    
    // 1. Check Cache
    const cachedData = await client.get(key);
    if (cachedData) {
        return res.json({ source: 'cache', data: JSON.parse(cachedData) });
    }

    // 2. Query DB
    const product = await Product.findById(req.params.id);

    // 3. Save Cache (1 Hour)
    await client.set(key, JSON.stringify(product), { EX: 3600 });

    // 4. Return
    res.json({ source: 'database', data: product });
});
```


## 🥊 Challenges

### Level 1: Cache Invalidation (ล้าง Cache)
ถ้าเรามี Cache สินค้าอยู่ แล้ว Admin **แก้ไขราคา** สินค้านั้น
จะเกิดอะไรขึ้น? User จะยังเห็นราคาเก่า (จาก Cache) จนกว่าจะครบ 1 ชั่วโมง!
จงเขียนโค้ดเพื่อแก้ปัญหานี้

::: details ✨ เฉลย
เราต้อง **ลบ Cache ทิ้ง** ทุกครั้งที่มีการ Update ข้อมูล (PUT/DELETE)

```javascript
app.put('/products/:id', async (req, res) => {
    // 1. Update DB
    await Product.findByIdAndUpdate(req.params.id, req.body);
    
    // 2. 🔥 Delete Cache Key
    await client.del(`product:${req.params.id}`);
    
    res.json({ message: 'Updated & Cache Cleared' });
});
```
:::


## 📚 Glossary

| คำศัพท์ | ความหมาย |
|:--------|:---------|
| **Redis** | Remote Dictionary Server (In-memory Database ยอดฮิต) |
| **TTL** | Time To Live (เวลาหมดอายุของข้อมูล) |
| **Cache-Aside** | รูปแบบการ Cache ที่ App เป็นคนจัดการ (Check -> Query -> Set) |
| **Eviction** | การไล่ข้อมูลเก่าออกจาก Cache เมื่อเมมเต็ม (เช่น LRU - Least Recently Used) |


> 👉 **ไปต่อ: [Project: Fast API](/node/11-project-fast-api)**
