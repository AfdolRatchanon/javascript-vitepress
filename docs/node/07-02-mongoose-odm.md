# 7.2 Mongoose ODM 🦁

> *"Elegant MongoDB object modeling for Node.js"*

แม้ MongoDB จะยืดหยุ่นมาก (Schemaless) แต่ในการเขียน App จริง เรามักอยากได้ **ระเบียบ** นิดนึงครับ
เราเลยใช้ไลบรารีชื่อ **Mongoose** (Object Data Modeling - ODM) มาช่วยจัดการ
- ช่วยสร้าง **Schema** (โครงสร้างบังคับ) ให้กับข้อมูล
- ช่วยตรวจสอบ (Validate) ข้อมูลก่อนบันทึก
- ช่วยสร้าง Relationship ระหว่างข้อมูล


## 🛠️ Setup

```bash
npm install mongoose
```

### 1. Connect

```javascript
// db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ Connection error:', err);
    process.exit(1);
  }
};
module.exports = connectDB;
```


## 🏗️ Define Schema & Model

```javascript
/* models/Post.js */
const mongoose = require('mongoose');

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
// (Mongoose จะแปลง 'Post' -> 'posts' collection ให้อัตโนมัติ)
module.exports = mongoose.model('Post', postSchema);
```


## 💻 Basic Operations (CRUD)

### 1. Create (INSERT)

```javascript
const Post = require('./models/Post');

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


> 👉 **ไปต่อ: [7.3 Mongoose Relations](/node/07-03-mongoose-relations)**
