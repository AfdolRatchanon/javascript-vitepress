# 8.1 MongoDB & NoSQL Basics

> *"Not only SQL."*

หลังจากเราได้รู้จัก SQL ที่เป็นระเบียบเป๊ะๆ ไปแล้ว
วันนี้เรามาทำความรู้จักกับ **NoSQL Database** ที่ฮิตที่สุดในวงการ JS นั่นคือ **MongoDB** ครับ 🍃

---

## 🐣 Analogy: File Cabinet (ตู้เก็บเอกสาร)

- **SQL (MySQL)**: เหมือน **ตาราง Excel** ที่ทุกแถวต้องมีคอลัมน์เหมือนกัน เป๊ะๆ
- **NoSQL (MongoDB)**: เหมือน **ตู้เก็บแฟ้มเอกสาร** (Collection)
  - ในตู้ 1 ตู้ เราจะโยนแฟ้ม (Document) ลงไป
  - แฟ้ม A อาจจะมีกระดาษ 1 แผ่น
  - แฟ้ม B อาจจะมีรูปถ่าย 10 ใบ + กระดาษ 5 แผ่น
  - ไม่จำเป็นต้องเหมือนกัน! (Schemaless / Flexible)

เหมาะมากกับข้อมูลที่โครงสร้างไม่แน่นอน หรือมีการเปลี่ยนแปลงบ่อยๆ (เช่น Log, Sensor Data, Social Media Feed)

---

## 📚 Mongoose ODM

แม้ MongoDB จะยืดหยุ่นมาก แต่ในการเขียน App จริง เรามักอยากได้ **ระเบียบ** นิดนึงครับ
เราเลยใช้ไลบรารีชื่อ **Mongoose** (Object Data Modeling - ODM) มาช่วยจัดการ
- ช่วยสร้าง **Schema** (โครงสร้างบังคับ) ให้กับข้อมูล
- ช่วยตรวจสอบ (Validate) ข้อมูลก่อนบันทึก
- ช่วยสร้าง Relationship ระหว่างข้อมูล

### 🛠️ Setup

```bash
npm install mongoose
```

### 1. Connect

```javascript
const mongoose = require('mongoose');

// เชื่อมต่อ MongoDB (ถ้าไม่มี Database ชื่อนี้ มันจะสร้างให้เอง!)
mongoose.connect('mongodb://localhost:27017/blog_db')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ Connection error:', err));
```

### 2. Define Schema & Model

```javascript
// สร้าง "แม่พิมพ์" (Schema)
const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  views: { type: Number, default: 0 },
  tags: [String], // เก็บ Array of String ได้เลย!
  isPublished: Boolean,
  author: { // Embedded Object
     name: String,
     email: String
  },
  createdAt: { type: Date, default: Date.now }
});

// สร้าง "โมเดล" (Model) เพื่อนำไปใช้งาน
const Post = mongoose.model('Post', postSchema);
```

---

## 💻 Basic Operations (CRUD)

### 1. Create (INSERT)

```javascript
const createPost = async () => {
  const newPost = new Post({
    title: "Why I love Node.js",
    content: "It is fast and scalable...",
    tags: ["nodejs", "backend", "javascript"],
    isPublished: true,
    author: { name: "Somchai", email: "som@chai.com" }
  });

  const result = await newPost.save(); // บันทึกลง DB
  console.log(result);
}
```

### 2. Read (SELECT)

```javascript
const getPosts = async () => {
  // หาโพสต์ทั้งหมด
  const posts = await Post.find();
  
  // หาเฉพาะที่ published และยอดวิว > 100
  const popularPosts = await Post.find({ 
    isPublished: true, 
    views: { $gt: 100 } // $gt = Greater Than
  })
  .sort({ createdAt: -1 }) // เรียงจากใหม่ไปเก่า
  .limit(10)               // เอาแค่ 10 อัน
  .select({ title: 1, author: 1 }); // เอาแค่ title กับ author
  
  console.log(popularPosts);
}
```

### 3. Update

```javascript
const updatePost = async (id) => {
  // หาด้วย ID แล้วแก้เลย โดยใช้ $set
  // { new: true } เพื่อให้คืนค่าข้อมูล *หลัง* แก้ไขกลับมา (ถ้าไม่ใส่จะได้ค่าเก่า)
  const updatedPost = await Post.findByIdAndUpdate(
    id, 
    { 
      $set: { title: "Updated Title", isPublished: false },
      $inc: { views: 1 } // เพิ่มยอดวิวทีละ 1 ($inc = increment)
    },
    { new: true } 
  );
}
```

### 4. Delete

```javascript
const deletePost = async (id) => {
  await Post.findByIdAndDelete(id);
}
```

---

## 🥊 SQL vs NoSQL Cheat Sheet

| SQL (MySQL) | NoSQL (MongoDB) |
|:---|:---|
| **Table** | **Collection** |
| **Row** | **Document** (JSON-like) |
| **Column** | **Field** |
| `JOIN` | `Lookup` / `Populate` (แต่ไม่เก่งเท่า) |
| Transaction (Acid) | รองรับ (แต่ช้ากว่า) |
| Structure (Strict) | Structure (Flexible) |
| Scale Up (อัปเกรดเครื่องแรงๆ) | Scale Out (เพิ่มเครื่องหลายๆ เครื่อง) |

---

## 🥊 Challenges

### Level 1: Find Active Users
สมมติมี Model `User` ที่มี field `isActive: Boolean`
จงเขียนคำสั่ง `User.find(...)` เพื่อหา User ที่ Active อยู่ทั้งหมด

::: details ✨ เฉลย
```javascript
const activeUsers = await User.find({ isActive: true });
```
:::

### Level 2: Complex Query
จงหา `Product` ที่:
1.  ราคา (`price`) มากกว่า 500
2.  **และ** อยู่ในหมวด (`category`) "Electronics"
3.  **และ** มีของในสต็อก (`inStock`) เป็นจริง

::: details ✨ เฉลย
```javascript
const gadgets = await Product.find({
  price: { $gt: 500 },
  category: "Electronics",
  inStock: true
});
```
:::

---

## 📚 Glossary

| คำศัพท์ | ความหมาย |
|:--------|:---------|
| **Collection** | กลุ่มของข้อมูลใน MongoDB (เทียบเท่า Table ใน SQL) |
| **Document** | ข้อมูล 1 ชิ้นใน Collection เก็บเป็น BSON (Binary JSON) |
| **Schema** | โครงสร้างข้อมูลที่กำหนดด้วย Mongoose (MongoDB จริงๆ ไม่มี Schema) |
| **Model** | ตัวกลางที่ Mongoose สร้างให้เราใช้คุยกับ Collection (CRUD) |
| **ObjectId** | ID ที่ MongoDB สร้างให้อัตโนมัติ (เช่น `507f1f77bcf86cd799439011`) |
| **Compass** | โปรแกรม GUI สำหรับเปิดดูข้อมูล MongoDB (เหมือน Workbench) |
| **Cluster** | กลุ่มของ Server MongoDB ที่ทำงานร่วมกัน (Replica Set / Sharding) |

---

> 👉 **ไปต่อ: [Project: Blog API with MongoDB](/node/08-project-blog-api)**
