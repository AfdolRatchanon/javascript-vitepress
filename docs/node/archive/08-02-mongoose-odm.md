# 8.2 Mongoose ODM

> *"With great power comes great responsibility."* — **Spider-Man Principle applied to NoSQL**

MongoDB นั้นยืดหยุ่นมาก (Schemaless) ซึ่งเป็นข้อดี แต่ก็เป็นดาบสองคม 🗡️
ถ้าเราปล่อยให้แอปเราโยนข้อมูลอะไรก็ได้ลง Database วันดีคืนดีอาจมีข้อมูลขยะปนมา
เช่น user คนนึงมี field `email` แต่อีกคนดันสะกดว่า `e-mail` ... พังครับ Code พังแน่นอน

เราจึงต้องมี "ผู้คุมกฎ" มาช่วยจัดการ นั่นคือ **Mongoose** (Object Data Modeling - ODM)
Mongoose ช่วยให้เราสร้าง **Schema** (โครงสร้าง) ในระดับ Application (Node.js) เพื่อคอยตรวจสอบข้อมูลก่อนลงถังครับ

---

## 🛠️ Setup & Connection

ติดตั้ง mongoose:

```bash
npm install mongoose
```

เชื่อมต่อ MongoDB (ใช้ Connection String จาก Atlas ที่ได้ในบทที่แล้ว):

```javascript
/* config/db.js */
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // อย่าลืมเอา Username/Password ใส่ใน .env นะ!
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1); // ปิดโปรแกรมทันทีถ้าต่อ DB ไม่ได้
  }
};

module.exports = connectDB;
```

---

## 📝 Define Schema & Model

Schema คือ "แม่พิมพ์" (Blueprint) ที่บอกว่าข้อมูลหน้าตาควรเป็นยังไง
Model คือ "ตัวปั๊ม" ที่เอาแม่พิมพ์ไปปั๊มออกมาเป็นก้อนข้อมูล (Document)

```javascript
const mongoose = require('mongoose');

// 1. สร้าง Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'กรุณาระบุชื่อผู้ใช้'], // Validation Message
    unique: true,
    trim: true, // ตัดเว้นวรรคหน้าหลังอัตโนมัติ
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    lowercase: true, // แปลงเป็นตัวพิมพ์เล็กเสมอ
    match: [/^\S+@\S+\.\S+$/, 'รูปแบบอีเมลไม่ถูกต้อง'] // Regex Validation
  },
  role: {
    type: String,
    enum: ['user', 'admin'], // บังคับค่าได้แค่ 2 อย่างนี้
    default: 'user'
  },
  points: { type: Number, default: 0 },
  hobbies: [String], // Array of Strings
  address: { // Embedded Object
    street: String,
    city: String
  },
  createdAt: { type: Date, default: Date.now }
});

// 2. สร้าง Model
// MongoDB จะสร้าง collection ชื่อ 'users' (เติม s ให้เอง)
const User = mongoose.model('User', userSchema);

module.exports = User;
```

---

## 💻 Mongoose CRUD Operations

วิธีการใช้ Model ในการจัดการข้อมูล (คืนค่าเป็น Promise เสมอ -> ใช้ await)

### 1. Create (สร้าง)

```javascript
// วิธีที่ 1: new + save
const newUser = new User({ username: 'Somchai', email: 'som@chai.com' });
await newUser.save(); // ตรวจสอบ Schema จังหวะนี้

// วิธีที่ 2: create (รวม 2 ขั้นตอน)
try {
  const result = await User.create({
    username: '  JohnDoe  ', // trim จะทำงาน -> 'JohnDoe'
    email: 'JOHN@DOE.COM',   // lowercase จะทำงาน -> 'john@doe.com'
    role: 'superman'         // ❌ Error! เพราะไม่อยู่ใน enum
  });
  console.log(result);
} catch (err) {
  console.log('Validation Error:', err.message);
}
```

### 2. Read (อ่าน)

Mongoose มี Query Helper ที่อ่านง่ายมาก

```javascript
// หาทั้งหมด
const allUsers = await User.find();

// หาและกรอง
const adultUsers = await User.find({ age: { $gte: 18 } })
  .select('username email') // เอาแค่ 2 field นี้
  .sort({ createdAt: -1 })  // เรียงล่าสุดขึ้นก่อน
  .limit(10);               // เอา 10 คน

// หาคนเดียว (เจอคนแรกแล้วหยุด)
const user = await User.findOne({ email: 'som@chai.com' });

// หาด้วย ID (ใช้บ่อยมาก!)
const userById = await User.findById('64f8a...'); 
```

### 3. Update (แก้ไข)

```javascript
// หาด้วย ID แล้วแก้เลย
const updatedUser = await User.findByIdAndUpdate(
  id,
  { $set: { role: 'admin' } }, 
  { 
    new: true, // ✅ สำคัญ! ถ้าไม่ใส่ จะคืนค่าข้อมูล "ก่อนแก้" กลับมา
    runValidators: true // ✅ สำคัญ! บังคับตรวจ Schema อีกรอบ (เช่น enum)
  }
);
```

### 4. Delete (ลบ)

```javascript
await User.findByIdAndDelete(id);
```

---

## 🧠 Advanced Mongoose Features

Mongoose ไม่ได้มีแค่ CRUD แต่ยังมีฟีเจอร์ฉลาดๆ อีกเยอะ:

### 1. Virtuals (ข้อมูลทิพย์)
สร้าง field ปลอมๆ ที่ไม่ได้เก็บลง DB จริงๆ แต่คำนวณมาให้ตอนดึง

```javascript
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// ตอนดึงข้อมูลต้องบอกให้เอา virtuals มาด้วย
// const user = await User.findById(id).populate('fullName'); -> ไม่ใช่ populate!
// มันจะติดมากับ object เลยถ้าตั้ง toJSON: { virtuals: true } ใน Schema
```

### 2. Middleware (Hooks)
ดักจับ events ก่อน/หลัง การบันทึก (มีประโยชน์มากตอน Hash Password!)

```javascript
// ทำงาน "ก่อน" (pre) จะ save ลง DB
userSchema.pre('save', function(next) {
  if (this.point < 0) {
    this.point = 0; // กันค่าติดลบ
  }
  console.log('กำลังจะบันทึกข้อมูลของ:', this.username);
  next(); // อนุญาตให้ไปต่อ (ถ้าไม่เรียก next จะค้าง)
});
```

### 3. Population (ความสัมพันธ์)
การทำ "Join" แบบ NoSQL

```javascript
// Post Schema เก็บ User ID
const postSchema = new mongoose.Schema({
  title: String,
  author: { 
    type: mongoose.Schema.Types.ObjectId, // เก็บ ID
    ref: 'User' // บอกว่า ID นี้อ้างอิงไป Model 'User'
  }
});

// เวลาดึง Post อยากได้ข้อมูล User เจ้าของด้วย
const posts = await Post.find().populate('author', 'username email');
// ผลลัพธ์: post.author จะไม่ใช่แค่ ID string แต่จะเป็น Object User เต็มๆ!
```

---

## 🥊 Challenges

### Level 1: Product Schema & Validation
จงออกแบบ Schema `Product` โดยมีข้อกำหนด:
1.  `name`: String, ห้ามซ้ำ, ห้ามว่าง
2.  `price`: Number, ห้ามว่าง, ต้องมากกว่า 0
3.  `category`: String, ต้องเป็นค่า 'electronics', 'clothing', หรือ 'food' เท่านั้น

::: details ✨ เฉลย
```javascript
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true, min: 0.1 },
  category: { 
    type: String, 
    enum: ['electronics', 'clothing', 'food'] 
  }
});
```
:::

### Level 2: Middleware Search
จงเขียน `pre('find')` middleware ที่จะกรองเอาเฉพาะสินค้าที่ `isDeleted: false` เสมอ (Soft Delete Pattern) เพื่อที่เวลาเราเขียน `Product.find()` ธรรมดา สินค้าที่ถูกลบจะไม่โผล่มา

::: details ✨ เฉลย
```javascript
productSchema.pre(/^find/, function(next) {
  // this คือ query object
  this.find({ isDeleted: { $ne: true } });
  next();
});
```
:::

---

## 📚 Glossary

| คำศัพท์ | ความหมาย |
|:--------|:---------|
| **ODM** | Object Data Modeling (Mongoose) เครื่องมือแปลงข้อมูลระหว่าง Object และ Document |
| **Schema** | โครงสร้างข้อมูลที่กำหนดกฎเกณฑ์ (Validation) ในระดับ Application |
| **Model** | Constructor function ที่สร้างจาก Schema ใช้สำหรับ Query ข้อมูล |
| **Validation** | การตรวจสอบความถูกต้องของข้อมูล (เช่น ต้องเป็นตัวเลข, ห้ามว่าง) |
| **Middleware (Hooks)** | ฟังก์ชันที่ทำงานแทรกจังหวะต่างๆ (เช่น ก่อน save, หลัง delete) |
| **Virtuals** | Property ที่คำนวณขึ้นมาโชว์เฉยๆ ไม่ได้เก็บลง DB |
| **Population** | การดึงข้อมูลจาก Collection อื่นมาแทนที่ ID (คล้าย SQL Join) |

---

## 🔗 References

- [Mongoose Docs](https://mongoosejs.com/docs/guide.html) - คัมภีร์หลัก
- [Mongoose Validation](https://mongoosejs.com/docs/validation.html) - ดู Validator ทั้งหมดที่มีให้ใช้
- [Mongoose Middleware](https://mongoosejs.com/docs/middleware.html) - เรียนรู้เรื่อง Pre/Post hooks อย่างละเอียด

---

> 👉 **ไปต่อ: [Module 9: Authentication](/node/09-01-password-security)**
