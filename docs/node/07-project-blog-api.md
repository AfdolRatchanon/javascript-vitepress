# Project 7: The Bizarre Blog API (Relations) 🧛‍♂️

> **"You thought it was SQL, but it was me, Dio!" - NoSQL**

ในโปรเจกต์นี้ เราจะสร้าง **RESTful API** สำหรับระบบ Blog ที่มีความสัมพันธ์ซับซ้อนขึ้น
User เขียน Post, User เขียน Comment, Post มีหลาย Comment
เราจะใช้พลังของ **Mongoose Populate** และ **Virtuals** มาจัดการความสัมพันธ์เหล่านี้


## 🎯 Project Goals

1.  **Relationships**: เชื่อมโยง User <-> Post <-> Comment
2.  **Population**: ดึงข้อมูล Related Data แบบ Nested (Post -> Comment -> Author)
3.  **Virtuals**: สร้าง Field ปลอม (เช่น จำนวน Comment) โดยไม่ต้องเก็บลง Database
4.  **Pagination**: ทำระบบแบ่งหน้า (เพราะ Post อาจมีเป็นล้าน)
5.  **Cascade Delete**: ลบ Post แล้ว Comment ต้องหายไปด้วย


## 📂 1. Project Structure

แยก Model/Controller/Route ชัดเจนเหมือนเดิม

```
blog-api/
├── models/
│   ├── User.js
│   ├── Post.js
│   └── Comment.js
├── controllers/
│   ├── userController.js
│   └── postController.js
├── routes/
│   ├── userRoutes.js
│   └── postRoutes.js
├── app.js
└── package.json
```

### Installation
```bash
npm init -y
npm install express mongoose dotenv cors
```


## 🏗️ 2. Designing Models

### 2.1 `models/User.js`
User เก็บข้อมูลพื้นฐาน

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true }
}, {
    timestamps: true,
    toJSON: { virtuals: true }, // สำคัญ!
    toObject: { virtuals: true }
});

// Virtual: แอบดูว่า User คนนี้เขียน Post อะไรบ้าง
userSchema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'author'
});

module.exports = mongoose.model('User', userSchema);
```

### 2.2 `models/Comment.js`
Comment ต้องรู้ว่า "ใครเขียน" และ "อยู่บน Post ไหน"

```javascript
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
```

### 2.3 `models/Post.js`
พระเอกของเรา เชื่อมโยงทุกสิ่ง

```javascript
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: [String], // Array of Strings
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true } 
});

// Virtual Relation with Comments
postSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'post'
});

// Middleware: Cascade Delete
// ก่อนลบ Post ให้ลบ Comment ที่เกี่ยวข้องด้วย
postSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
    console.log(`Deleting comments for post ${this._id}`);
    await this.model('Comment').deleteMany({ post: this._id });
    next();
});

module.exports = mongoose.model('Post', postSchema);
```


## 💻 3. Implementation Code

### 3.1 `controllers/postController.js`

```javascript
const Post = require('../models/Post');
const User = require('../models/User');

// GET /posts (With Pagination & Search)
exports.getAllPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        
        // Search Filter
        const query = search ? { title: { $regex: search, $options: 'i' } } : {};

        const posts = await Post.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('author', 'username email') // แปะข้อมูลคนเขียน
            .sort({ createdAt: -1 }); // ใหม่สุดขึ้นก่อน

        const count = await Post.countDocuments(query);

        res.json({
            posts,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /posts/:id (Deep Populate)
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'username')
            .populate({
                path: 'comments', // Virtual field
                select: 'content createdAt',
                populate: { path: 'author', select: 'username' } // Nested Populate
            });

        if (!post) return res.status(404).json({ error: 'Post not found' });
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /posts
exports.createPost = async (req, res) => {
    try {
        // สมมติว่ารับ author_id มาจาก body (ของจริงควรมาจาก Token)
        const post = await Post.create(req.body);
        res.status(201).json(post);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// DELETE /posts/:id
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        // Trigger Pre-remove hook (for Cascade delete)
        await post.deleteOne(); 

        res.json({ msg: 'Post deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
```


## 🧪 4. Testing Guide

1.  **Create Users**: สร้าง User ไว้สัก 2 คน (เก็บ `_id` ไว้)
2.  **Create Post**: สร้าง Post โดยใส่ `author: "USER_ID_1"`
3.  **Add Comments**: (ต้องทำ Controller เพิ่มเองนะ!) สร้าง Comment โดยใส่ `post: "POST_ID"` และ `author: "USER_ID_2"`
4.  **Get Post Detail**: ยิง `GET /posts/POST_ID`
    *   *Expect*: เห็น `author` เป็น Object, และเห็น Array `comments` โผล่มา! (ทั้งที่ใน DB ไม่มี field comments)
5.  **Delete Post**: ลองลบ Post
    *   *Expect*: ไปเช็คในตาราง comments... คอมเม้นท์ของ Post นั้นต้องหายไปหมด! 💥


## ⚡ 5. Challenge: The Like System 👍

โจทย์: อยากให้ User กด Like Post ได้

1.  เพิ่ม field `likes` ใน `Post` Model:
    ```javascript
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    ```
2.  สร้าง API `POST /posts/:id/like`
    *   รับ `userId`
    *   เช็คว่าเคย Like หรือยัง?
    *   ถ้ายัง -> `$addToSet` (Like)
    *   ถ้าเคยแล้ว -> `$pull` (Unlike)
3.  ใน `getAllPosts` ให้ส่ง `likesCount` กลับไปด้วย (ใช้ Virtual)

::: details ✨ แนวทาง Logic
```javascript
exports.toggleLike = async (req, res) => {
    const { userId } = req.body;
    const post = await Post.findById(req.params.id);
    
    // Check exist
    const isLiked = post.likes.includes(userId);

    const update = isLiked 
        ? { $pull: { likes: userId } }  // Unlike
        : { $addToSet: { likes: userId } }; // Like

    const updatedPost = await Post.findByIdAndUpdate(
        req.params.id, 
        update, 
        { new: true }
    );
    
    res.json(updatedPost);
};
```
:::


## 📚 FAQ

**Q: Virtuals vs Real Field?**
A:
*   **Real Field**: เก็บข้อมูลจริง กินพื้นที่ Disk (เช่น `title`, `content`)
*   **Virtual**: คำนวณเอาตอน Runtime ไม่กินพื้นที่ (เช่น `fullName`, `commentsCount`) แต่ Query ไม่ได้ (เช่น `find({ commentsCount: { $gt: 5 } })` ไม่ได้ ต้องใช้ Aggregate)

**Q: ทำไม Pagination ถึงใช้ `skip`?**
A: `skip` + `limit` เข้าใจง่ายสุด แต่ถ้าข้อมูลเยอะมากๆ (ล้านแถว) จะช้า เพราะ DB ต้องนับข้ามไปล้านแถว แนะนำให้ใช้ **Cursor Pagination** (อ้างอิงจาก `_id` ล่าสุด) แทนถ้าซีเรียสเรื่อง Performance


👉 **[ไปต่อ: Module 8 - Authentication](/node/08-01-password-hashing)**
