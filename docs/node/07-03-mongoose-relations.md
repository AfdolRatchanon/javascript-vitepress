# Module 7.3: Mongoose Relations (Relationships) 🔗

> **"NoSQL doesn't mean No Relationships. It just means you have options."**

หลายคนเข้าใจผิดว่าใช้ MongoDB แล้วห้ามมีความสัมพันธ์ (Relationship) เหมือน SQL... ผิดถนัด!
ในโลกความเป็นจริง ข้อมูลมักจะเกี่ยวข้องกันเสมอ (เช่น User มีหลาย Order, Post มีคนเขียน)
เพียงแต่ใน MongoDB เรามี **2 ทางเลือก** ในการออกแบบ ซึ่งต้องเลือกให้เหมาะกับงาน


## 🧐 1. Embedding vs Referencing (The Big Decision)

ก่อนจะเขียนโค้ด ต้องตัดสินใจก่อนว่าจะเก็บข้อมูลยังไง

### 1.1 Embedding (ฝังรวมกัน)
เก็บข้อมูลลูก (Child) ฝังลงไปใน Document ของแม่ (Parent) เลย

```javascript
// User Document
{
  "_id": "user1",
  "name": "Somchai",
  "addresses": [
      { "city": "Bangkok", "zip": "10110" }, // 👈 ฝังอยู่ข้างในเลย
      { "city": "Chiang Mai", "zip": "50000" }
  ]
}
```
*   **✅ Pros**: อ่านเร็วมาก (Read Performance) ครั้งเดียวจบ ไม่ต้อง Join
*   **❌ Cons**: ถ้าข้อมูลลูกเยอะเกินไป (เช่น 10,000 comment) Document จะใหญ่เกินลิมิต (16MB) และอัพเดทยาก

### 1.2 Referencing (อ้างอิงถึง / Normalization)
เก็บแยก Collection แล้วเก็บ `_id` มาอ้างอิงหากัน (เหมือน Foreign Key ใน SQL)

```javascript
// User Document
{ "_id": "user1", "name": "Somchai" }

// Order Document
{ "_id": "order99", "amount": 5000, "user_id": "user1" } // 👈 ชี้ไปหา User
```
*   **✅ Pros**: ข้อมูลไม่ซ้ำซ้อน, Scalable, Document ไม่บวม
*   **❌ Cons**: ต้องใช้คำสั่ง `populate` (Join) ซึ่งช้ากว่า Embedding นิดหน่อย

> **Rule of Thumb**:
> *   ถ้าข้อมูลลูก **"มีน้อย"** และ **"ติดตัวแม่เสมอ"** (เช่น Address) -> **Embed**
> *   ถ้าข้อมูลลูก **"มีเยอะ"** หรือ **"โตเรื่อยๆ"** (เช่น Orders, Comments) -> **Reference**


## 🛠️ 2. Implementing References (One-to-Many)

Scenario ยอดฮิต: **Blog System** (User 1 คน เขียนได้หลาย Post)

### 2.1 Parent Model (`User`)
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true }
}, {
    toJSON: { virtuals: true }, // เพื่อให้ Virtuals ทำงาน
    toObject: { virtuals: true }
});

// (Optional) Reverse populate: ให้ User เห็น posts ของตัวเอง
userSchema.virtual('posts', {
    ref: 'Post',          // ไปดูที่โมเดล Post
    localField: '_id',    // เอา _id ของเรา
    foreignField: 'author' // ไปเทียบกับ field 'author' ของ Post
});

const User = mongoose.model('User', userSchema);
```

### 2.2 Child Model (`Post`)
```javascript
const postSchema = new mongoose.Schema({
    title: String,
    content: String,
    author: { 
        type: mongoose.Schema.Types.ObjectId, // 👈 เก็บเป็น ID
        ref: 'User',                          // 🔗 อ้างอิงไปที่ Model 'User'
        required: true 
    }
});

const Post = mongoose.model('Post', postSchema);
```


## 💻 3. Playing with Relations

### 3.1 Creating Related Data
เวลาสร้าง Post เราแค่ใส่ `_id` ของ User ลงไปใน field `author`

```javascript
const createData = async () => {
    // 1. สร้าง User
    const user = await User.create({ name: 'Jojo', email: 'jojo@bizarre.com' });

    // 2. สร้าง Post โดยอ้างอิง User
    const post1 = await Post.create({
        title: 'Star Platinum',
        content: 'Ora Ora Ora!',
        author: user._id // 🔗 Link Here!
    });
    
    const post2 = await Post.create({
        title: 'The World',
        content: 'Muda Muda Muda!',
        author: user._id
    });

    console.log('Created!');
};
```


## 🔍 4. The `populate()` Magic

ถ้าเรา `find()` เฉยๆ:
```javascript
const posts = await Post.find();
// Result: { title: '...', author: "65b123..." } (ได้มาแค่ ID)
```

เราต้องบอก Mongoose ให้ไป "แปะ" ข้อมูลจริงมาให้หน่อย:

### 4.1 Basic Populate
```javascript
const posts = await Post.find().populate('author');
// Result:
// {
//    title: 'Star Platinum',
//    author: {
//        _id: "65b123...", 
//        name: "Jojo", 
//        email: "jojo@..."
//    }
// }
```

### 4.2 Select Fields (เลือกเฉพาะที่ใช้)
ดึงมาทั้ง Object มันหนัก ไปเอาแค่ `name` พอ:
```javascript
// Parameter 2: fields string (เว้นวรรค)
await Post.find().populate('author', 'name -_id'); 
// -_id คือไม่เอา id
```

### 4.3 Nested Populate (ซ้อนของซ้อน)
สมมติ `Comment` มี `author` ซึ่งเป็น `User`
Post -> hasMany -> Comment -> hasOne -> Author

```javascript
await Post.find().populate({
    path: 'comments',
    populate: { path: 'author', select: 'name' }
});
```


## 🏗️ 5. Advanced: Many-to-Many (N:N)

Scenario: **Students** ลงทะเบียนเรียน **Courses**
(นักเรียน 1 คนเรียนหลายวิชา, วิชา 1 มีนักเรียนหลายคน)

### Helper Table? No Need!
ใน SQL ต้องมีตารางกลาง (Join Table) แต่ใน Mongo เราเก็บ Array of IDs ได้เลย!

```javascript
// Student Model
const studentSchema = new mongoose.Schema({
    name: String,
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }] // Array!
});

// Course Model
const courseSchema = new mongoose.Schema({
    title: String,
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }] // Array!
});
```

### How to Query
```javascript
// หาว่า Student A เรียนวิชาอะไรบ้าง
const s = await Student.findOne({ name: 'A' }).populate('courses');

// หาว่า Course B มีใครเรียนบ้าง
const c = await Course.findOne({ title: 'B' }).populate('students');
```


## ⚡ 6. Performance & Indexing

การ `polluate()` คือการทำงานที่ Database (คล้ายๆ Join) ซึ่งถ้าทำเยอะๆ จะช้า
**Best Practice**:
1.  **Index Foreign Key**: ถ้าเราจะหา Post ของ user A `Post.find({ author: user_id })` เราควรทำ Index ที่ `author` ด้วย
2.  **Lean()**: ใช้ `.lean()` ถ้าจะเอาแค่อ่าน (Read-only) ไม่แก้ข้อมูล Mongoose จะข้ามการสร้าง Mongoose Document ทำให้เร็วขึ้น 5-10 เท่า!

```javascript
const posts = await Post.find().populate('author').lean();
```


## 🛡️ 7. Cascade Delete (Middleware)

ปัญหา: ถ้าลบ User ทิ้ง... Post ของเขาล่ะ?
Default: Post จะยังอยู่ แต่ field `author` จะชี้ไปหาศพ (Null/Reference Error)
**Solution**: ใช้ Mongoose Middleware (Pre-hook) เพื่อตามไปลบ

```javascript
// ใน userSchema
userSchema.pre('remove', async function(next) {
    console.log(`Deleting posts of user ${this._id}`);
    await this.model('Post').deleteMany({ author: this._id });
    next();
});
```
*(Note: ตั้งแต่ Mongoose 5.x ขึ้นไป middleware จะทำงานได้ต้องเรียก `doc.remove()` ไม่ใช่ `Model.deleteMany()`)*


## 🏆 Challenge: Social Media Follow System 🐦

โจทย์: ออกแบบระบบ Follower/Following
1.  User Model มี field `followers` และ `following`
2.  เขียน Function `followUser(userId, targetId)`
    *   เอา Id เราไปใส่ใน `followers` ของเขา
    *   เอา Id เขามาใส่ใน `following` ของเรา
    *   (ระวัง: ห้ามกด Follow ซ้ำ!)

::: details ✨ แนวทาง (Hint)
ใช้ `$addToSet` แทน `$push` เพื่อกันค่าซ้ำ!
```javascript
await User.findByIdAndUpdate(myId, { $addToSet: { following: targetId } });
await User.findByIdAndUpdate(targetId, { $addToSet: { followers: myId } });
```
:::


## 📚 FAQ

**Q: Populate ทำงานยังไงเบื้องหลัง?**
A: Mongoose จะยิง 2 Query ครับ
1. `find posts` -> ได้ list of author_ids
2. `find users WHERE _id IN (author_ids)`
3. เอาข้อมูลมาประกอบร่างกันใน Node.js App (ไม่ได้ join ที่ DB level เหมือน SQL)

**Q: Relation ลึกได้แค่ไหน?**
A: ไม่จำกัด แต่ยิ่งลึกยิ่งช้า ถ้าต้อง populate เกิน 3 ชั้น... ให้ทบทวน Schema Design ใหม่ (อาจจะกลับไปใช้ Embedding บางส่วน)


👉 **[ไปต่อ: Project 7 - Blog API](/node/07-project-blog-api)**
