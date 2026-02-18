# 🍃 Project: Blog API with MongoDB

เราลองทำ API มาเชื่อมต่อกับ MySQL แล้ว คราวนี้เรามาลองเชื่อมต่อกับ **MongoDB** กันบ้างครับ
โดยโปรเจกต์นี้เราจะทำ **ระบบ Backend สำหรับ Blog** 📝
ที่มีฟีเจอร์เด็ดคือ **"Comments"** ที่จะถูกเก็บเป็น Array ซ้อนอยู่ใน Post เลย (Embedded Document) ซึ่งเป็นจุดเด่นของ NoSQL!

> **Pre-requisites**:
> - ติดตั้ง MongoDB Community Server หรือสมัคร MongoDB Atlas (Cloud)
> - ติดตั้ง Compass (เอาไว้ดูข้อมูล)

---

## 🎯 เป้าหมาย (Goal)

สร้าง API Endpoints สำหรับ:
1.  **Post**: สร้าง/อ่าน/แก้ไข/ลบ บทความ
2.  **Comment**: เพิ่มคอมเมนต์ลงในบทความ

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/posts` | ดูบทความทั้งหมด |
| `POST` | `/posts` | สร้างบทความใหม่ |
| `GET` | `/posts/:id` | ดูบทความรายตัว (พร้อม Comments) |
| `POST` | `/posts/:id/comments` | คอมเมนต์บทความ |

---

## 🛠️ Step 1: Project Setup

```bash
mkdir mongo-blog
cd mongo-blog
npm init -y
npm install express mongoose dotenv
```

สร้าง `.env`:
```env
MONGO_URI=mongodb://localhost:27017/my_blog_db
PORT=3000
```

---

## 🛠️ Step 2: Create Model (`models/Post.js`)

เราจะออกแบบให้ 1 Post มีหลาย Comment โดยเก็บ Comment ฝังลงไปใน Post เลย

```javascript
const mongoose = require('mongoose');

// Schema ย่อย (Comment)
const commentSchema = new mongoose.Schema({
    username: { type: String, required: true },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

// Schema หลัก (Post)
const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: [String], // Array ของ String ง่ายๆ
    published: { type: Boolean, default: true },
    
    // ฝัง Comment ลงไปเลย (Embedded Document)
    comments: [commentSchema] 
}, { 
    timestamps: true // สร้าง createdAt, updatedAt ให้เองอัตโนมัติ!
});

module.exports = mongoose.model('Post', postSchema);
```

---

## 🛠️ Step 3: Implement Server (`index.js`)

```javascript
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const Post = require('./models/Post'); // Import Model

const app = express();
app.use(express.json());

// 1. Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error(err));

// --- ROutes ---

// 1. Create Post
app.post('/posts', async (req, res) => {
    try {
        // รับข้อมูลจาก Body แล้วโยนเข้า Model เลย
        const newPost = await Post.create(req.body);
        res.status(201).json(newPost);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 2. Get All Posts (Filter & Sort)
app.get('/posts', async (req, res) => {
    try {
         // ค้นหาเฉพาะที่ published และเรียงวันใหม่สุดขึ้นก่อน
        const posts = await Post.find({ published: true }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Get Single Post
app.get('/posts/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Add Comment (จุดเด่น NoSQL!)
app.post('/posts/:id/comments', async (req, res) => {
    try {
        const { username, text } = req.body;
        
        // 1. หา Post ก่อน
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        // 2. Push comment ลง array
        post.comments.push({ username, text });
        
        // 3. Save ทั้งก้อนกลับลง DB
        await post.save();
        
        res.json(post); // ส่ง Post ที่อัปเดตแล้วกลับไป
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Delete Post
app.delete('/posts/:id', async (req, res) => {
    try {
        const result = await Post.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ error: "Not found" });
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

---

## 🧪 Testing

1.  **POST** `/posts`: สร้างบทความ
    ```json
    {
      "title": "Learning MongoDB",
      "content": "It uses JSON documents.",
      "tags": ["db", "nosql"]
    }
    ```
2.  **POST** `/posts/:id/comments`: ลองคอมเมนต์
    ```json
    {
      "username": "DevUser",
      "text": "Awesome content!"
    }
    ```
3.  **GET** `/posts/:id`: ดูผลลัพธ์ จะเห็นว่ามี `comments` array งอกขึ้นมาใน object เลย!

---

## 🧩 Challenge: Delete Comment

การลบ comment ที่ฝังอยู่ข้างใน ยากกว่าปกตินิดนึงครับ
ลองสร้าง Endpoint `DELETE /posts/:postId/comments/:commentId`
โดยใช้เมธอด `$pull` ของ MongoDB หรือใช้ `post.comments.id(commentId).remove()` ของ Mongoose

::: details ✨ เฉลย
```javascript
app.delete('/posts/:postId/comments/:commentId', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        
        // ใช้ pull เพื่อดึง item ออกจาก array
        post.comments.pull({ _id: req.params.commentId });
        
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
```
:::

---

> 👉 **บทต่อไป: [Module 9 - Authentication & JWT](/node/09-01-auth-jwt)**
