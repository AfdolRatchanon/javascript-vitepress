# Module 4.2: Handling Requests (Routing) 🛣️

> **"Routing refers to how an application’s endpoints (URIs) respond to client requests."**
> — *Express.js Guide*

ในบทนี้เราจะเจาะลึก **Routing** ใน Express.js ซึ่งทำได้ง่ายและทรงพลังกว่า Native Node.js มาก!


## 1. Basic Routing (จัดการเส้นทาง) 🛣️

ใน Express เราแยก Route ตาม **Method** ได้เลย ไม่ต้องใช้ `if-else`:

### รูปแบบคำสั่ง
`app.METHOD(PATH, HANDLER)`

```javascript
// GET: ขอข้อมูล
app.get('/about', (req, res) => {
    res.send('About Page');
});

// POST: ส่งข้อมูล
app.post('/login', (req, res) => {
    res.send('Login Request Received');
});

// PUT: แก้ไขข้อมูล
app.put('/user', (req, res) => {
    res.send('Update User');
});

// DELETE: ลบข้อมูล
app.delete('/user', (req, res) => {
    res.send('Delete User');
});

// Catch All (404) - ต้องไว้ล่างสุด!
app.use((req, res) => {
    res.status(404).send('<h1>Page Not Found 😢</h1>');
});
```


## 2. Advanced Routing (เส้นทางขั้นสูง) 🧭

Express ไม่ได้ทำได้แค่ Route ธรรมดา แต่รองรับ **Pattern Matching** ด้วย!

### String Patterns
```javascript
// ? = ตัวอักษรหน้ามีหรือไม่มีก็ได้
// แมตช์ทั้ง /acd และ /abcd
app.get('/ab?cd', (req, res) => res.send('ab?cd'));

// + = มีตัวซ้ำกี่ตัวก็ได้
// แมตช์ /efgh, /effgh, /effffgh
app.get('/ef+gh', (req, res) => res.send('ef+gh'));

// * = อะไรก็ได้ (Wildcard)
// แมตช์ /ab/random/cd
app.get('/ab*cd', (req, res) => res.send('ab*cd'));
```


## 3. `req` และ `res` ที่เก่งกว่าเดิม 💪

Express อัดฉีดพลังเพิ่มให้ `req` และ `res` ทำให้เราทำงานง่ายขึ้นเยอะ

### 3.1 Response Methods (`res`) 📤
| คำสั่ง | ทำหน้าที่ | ตัวอย่าง |
|:---|:---|:---|
| `res.send()` | ส่ง Text/HTML (ฉลาดรู้ว่าเป็นอะไร) | `res.send('<h1>Hi</h1>')` |
| `res.json()` | ส่ง JSON (Auto-stringify + Auto-header) | `res.json({ id: 1 })` |
| `res.status()` | กำหนด Status Code | `res.status(404).send('Not Found')` |
| `res.sendFile()` | ส่งไฟล์ (ต้องใช้ Absolute Path) | `res.sendFile(__dirname + '/index.html')` |
| `res.redirect()` | ย้ายหน้า | `res.redirect('/home')` |

### 3.2 Request Properties (`req`) 📥
| คำสั่ง | ทำหน้าที่ | ตัวอย่าง URL | ค่าที่ได้ |
|:---|:---|:---|:---|
| `req.query` | ดึง Query String | `/search?q=cat` | `{ q: 'cat' }` |
| `req.params` | ดึง Route Parameters | `/users/:id` | `{ id: '1' }` |
| `req.body` | ดึง Body (ต้องมี Middleware) | (POST info) | `{ name: 'Dolar' }` |
| `req.ip` | ดู IP ลูกค้า | - | `::1` |


## 4. Route Parameters (Dynamic Routing) 🧬

การรับค่าจาก URL ทำได้ง่ายมากๆ แค่ใส่ `:` ไว้หน้าชื่อตัวแปร

```javascript
// URL: /products/123
app.get('/products/:id', (req, res) => {
    // Express ดึงค่า 123 มาใส่ req.params.id ให้เลย!
    const id = req.params.id;
    res.send(`Viewing Product ID: ${id}`);
});

// URL: /shop/shoes/nike (หลายตัวแปรก็ได้)
app.get('/shop/:category/:brand', (req, res) => {
    const { category, brand } = req.params;
    res.send(`Category: ${category} | Brand: ${brand}`);
});
```


## 5. Challenges 🏆

### 🎯 Challenge 1: Basic Math API
สร้าง Route `/math/:op/:a/:b` โดยรับ params 3 ตัว:
*   `op`: ชื่อการคำนวณ (`add`, `sub`, `mul`)
*   `a`, `b`: ตัวเลข
*   ตอบกลับเป็น JSON `{ result: ... }`

ตัวอย่าง: `/math/add/10/5` → `{ result: 15 }`

::: details ✨ ดูเฉลย
```javascript
app.get('/math/:op/:a/:b', (req, res) => {
    const { op, a, b } = req.params;
    const numA = Number(a);
    const numB = Number(b);
    let result = 0;

    if (op === 'add') result = numA + numB;
    else if (op === 'sub') result = numA - numB;
    else if (op === 'mul') result = numA * numB;
    else return res.status(400).send('Invalid Operation');

    res.json({ result });
});
```
:::

### 🎯 Challenge 2: Search Query
สร้าง Route `/search` ที่รับ Query Param `?q=...`
*   ถ้ามี `q` ให้ส่ง: `"Searching for: [q]"`
*   ถ้าไม่มี `q` ให้ส่ง: `"Search term is missing"` (Status 400)

::: details ✨ ดูเฉลย
```javascript
app.get('/search', (req, res) => {
    const q = req.query.q;
    if (!q) {
        return res.status(400).send("Search term is missing");
    }
    res.send(`Searching for: ${q}`);
});
```
:::


👉 **[ไปต่อ: 4.3 - Environment Variables](/node/04-03-environment-variables)**
