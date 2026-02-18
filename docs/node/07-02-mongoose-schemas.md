# Module 7.2: Mongoose Schemas & Models 📦

> **"Schema is the blueprint of your data."**

ใน MongoDB จริงๆ แล้วเราสามารถโยน JSON อะไรลงไปก็ได้ (Schemaless)
แต่ในการทำ App จริง... **"ความอิสระ มาพร้อมกับความยุ่งเหยิง"**

ถ้า User A มี field `email` แต่ User B ไม่มี... Frontend แตกแน่นอน! 💥
ดังนั้นเราจึงต้องมี **Mongoose Schema** มาคอยคุมกฎระเบียบ (Structure & Validation)
ให้ข้อมูลของเรามีคุณภาพและเชื่อถือได้

บทนี้เราจะเจาะลึกทุกซอกทุกมุมของ Schema ตั้งแต่ Basic Type ยัน Middleware Hooks ครับ

---

## 🏗️ 1. Schema Types Deep Dive

Mongoose มี Type ให้ใช้มากกว่าแค่ String/Number นะครับ

```javascript
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // 1. Basic Types
  name: String,
  price: Number,
  isAvailable: Boolean,
  tags: [String], // Array of Strings
  
  // 2. Date
  createdAt: { type: Date, default: Date.now },
  
  // 3. Buffer (เก็บไฟล์ Binary - ไม่ค่อยแนะนำให้เก็บใน DB ตรงๆ)
  data: Buffer,
  
  // 4. Mixed (อะไรก็ได้ - เหมือน Schemaless)
  metadata: mongoose.Schema.Types.Mixed,
  
  // 5. ObjectId (Link ไปหา Document อื่น)
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // 6. Decimal128 (สำหรับเงินที่ต้องการทศนิยมแม่นยำสูงมาก)
  salary: mongoose.Schema.Types.Decimal128,
  
  // 7. Map (Key-Value Key เป็น String ได้อิสระ)
  ratings: {
    type: Map,
    of: Number // value ต้องเป็น Number (เช่น "user1": 5, "user2": 4)
  }
});
```

---

## 🛡️ 2. Advanced Validation

Validation คือด่านแรกที่กันไม่ให้ข้อมูลขยะเข้า DB

### Built-in Validators
```javascript
age: {
  type: Number,
  min: [18, 'อายุต้อง 18+ นะจ๊ะ'], // Custom Error Message
  max: 100
},
category: {
  type: String,
  enum: {
    values: ['Electronics', 'Food', 'Books'],
    message: '{VALUE} ไม่ใช่หมวดหมู่ที่รองรับ'
  }
},
phone: {
  type: String,
  match: /^0[0-9]{9}$/ // Regex check เบอร์โทร
}
```

### Custom Validators (Sync & Async)
ถ้า Built-in ไม่พอ เขียนเองได้เลย!

```javascript
// Sync Validator
tags: {
  type: [String],
  validate: {
    validator: function(v) {
      return v.length <= 5; // ห้ามเกิน 5 tags
    },
    message: 'ใส่ Tag ได้มากสุด 5 อัน'
  }
}

// Async Validator (เช็ค DB ได้)
email: {
  type: String,
  validate: {
    validator: async function(email) {
      const user = await mongoose.models.User.findOne({ email });
      return !user; // ถ้าเจอ user แปลว่าซ้ำ (return false)
    },
    message: 'อีเมลนี้ถูกใช้ไปแล้ว'
  }
}
```

---

## 👻 3. Virtuals (ข้อมูลทิพย์)

**Virtuals** คือ field ที่ **ไม่ได้เก็บใน Database จริงๆ**
แต่ถูกคำนวณขึ้นมาตอน Query (Comuted Properties)

### Example: Full Name
ใน DB เก็บ `firstName` และ `lastName` แยกกัน
แต่อยากได้ `fullName`

```javascript
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// การใช้งาน
const user = await User.findOne();
console.log(user.fullName); // "Somchai Jaidee"
// แต่ใน MongoDB จะไม่มี field fullName นะ!
```

> ⚠️ **ข้อควรระวัง**: Virtuals ใช้ใน `find({ fullName: ... })` ไม่ได้นะ เพราะมันไม่มีอยู่จริงใน DB!

---

## 🎣 4. Middleware (Hooks)

Mongoose ให้เราดักจับ event ต่างๆ ได้ (เหมือน Trigger ใน SQL)
แบ่งเป็น `pre` (ก่อนทำ) และ `post` (หลังทำ)

### 4.1 Document Middleware (`save`, `validate`, `remove`)
ทำงานที่ระดับ Document (มี `this` เป็น document นั้นๆ)

**Example: Hash Password ก่อน Save** ✨ (Classic Case)
```javascript
userSchema.pre('save', async function(next) {
  // ถ้า password ไม่ได้ถูกแก้ (เช่นแก้แค่ชื่อ) ก็ไม่ต้อง hash ใหม่
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.hash = await bcrypt.hash(this.password, salt);
  next();
});
```

### 4.2 Query Middleware (`find`, `findOne`, `update`)
ทำงานที่ระดับ Query (มี `this` เป็น Query Object)

**Example: Soft Delete (กรองของที่ถูกลบออกอัตโนมัติ)**
สมมติเราไม่ลบจริง แค่เซ็ต flag `isDeleted: true`

```javascript
// ดักทุกคำสั่งที่ขึ้นต้นด้วย find (find, findOne, findById...)
userSchema.pre(/^find/, function(next) {
  this.find({ isDeleted: { $ne: true } }); // เพิ่มเงื่อนไขอัตโนมัติ
  next();
});
```
*ชีวิตดีขึ้นทันที! ไม่ต้องคอยจำว่าต้อง `where isDeleted = false` ทุกรอบ*

---

## 🛠️ 5. Methods & Statics

เราสามารถเพิ่มฟังก์ชันให้ Model ได้

### 5.1 Instance Methods (`documents.method()`)
ทำงานกับข้อมูลของ **คนคนเดียว** (Object นั้นๆ)

```javascript
userSchema.methods.checkPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Usage
const user = await User.findOne({ email: '...' });
const isMatch = await user.checkPassword('1234'); // เรียกผ่าน user
```

### 5.2 Static Methods (`Model.method()`)
ทำงานกับ **ทั้ง Collection** (Utilities)

```javascript
userSchema.statics.findByRole = function(role) {
  return this.find({ role: role }).sort({ name: 1 });
};

// Usage
const admins = await User.findByRole('admin'); // เรียกผ่าน Model (User)
```

---

## 📐 6. Design Patterns: Embedding vs Referencing

คำถามโลกแตกของ NoSQL: **"ควรเก็บซ้อนกัน (Embed) หรือแยกตาราง (Ref)?"**

### Option A: Ref (Normalization) - เหมือน SQL
```json
// User
{ "_id": 1, "name": "Somchai" }
// Order
{ "_id": 101, "user_id": 1, "total": 500 }
```
*   **Pros**: ข้อมูลไม่ซ้ำซ้อน, แก้ชื่อ User ทีเดียวจบ
*   **Cons**: ต้องใช้ `$lookup` หรือ `.populate()` สองรอบถึงจะได้ข้อมูลครบ (ช้ากว่า)
*   **Use Case**: ข้อมูลเยอะ (1:Unlimited), ข้อมูลที่ต้องเข้าถึงแยกกันบ่อยๆ

### Option B: Embed (Denormalization)
```json
// User
{
  "_id": 1,
  "name": "Somchai",
  "orders": [
    { "id": 101, "total": 500 },
    { "id": 102, "total": 1200 }
  ]
}
```
*   **Pros**: อ่านทีเดียวได้ครบ (Read Performance เทพมาก)
*   **Cons**: Document ใหญ่ขึ้นเรื่อยๆ (MongoDB จำกัด 16MB), ถ้าแก้ข้อมูล Order ต้องแก้ใน Array นี้ด้วย
*   **Use Case**: ข้อมูลน้อย (1:Few), ข้อมูลที่เป็นส่วนหนึ่งของกันเสมอ (เช่น Address in User)

> **Rule of Thumb**:
> *   ถ้าเป็นความสัมพันธ์แบบ **"Contains"** (เช่น บ้านมีห้อง) -> **Embed**
> *   ถ้าเป็นความสัมพันธ์แบบ **"Links"** (เช่น บทความคนเขียน) -> **Ref**

---

## ⚡ Challenge: Schema Design 🧠

**โจทย์**: ออกแบบ Schema สำหรับระบบ "Blog Comment"
1.  Blog 1 อัน มีได้เป็นหมื่น Comment
2.  ต้องการแสดง Comment ล่าสุด 5 อันใต้ Blog ทันทีที่เปิดหน้า

**คุณจะออกแบบยังไง? Embed หรือ Ref?**

::: details ✨ เฉลยแนวทาง Hybrid
เนื่องจาก Comment มีเยอะมาก (Unbound growth) -> **Embed ไม่ไหว** (เดี๋ยว User เกิน 16MB)
แต่ต้องการความเร็วในการโชว์ 5 อันแรก -> **Ref ล้วนๆ ก็ต้อง Query 2 รอบ**

**Solution: Hybrid (Bucketing Pattern Lite)**
เก็บ Comment แยก (Ref) แต่... **Embed 5 อันล่าสุดไว้ใน Blog ด้วย!**

```javascript
// Blog Schema
{
  title: String,
  content: String,
  // Cache แค่ 5 อันล่าสุด
  recentComments: [
    { body: String, user: String } 
  ]
}

// Comment Schema (เก็บทั้งหมด)
{
  blogId: Ref,
  body: String,
  user: String
}
```
*   ตอนเปิดหน้า Blog -> ได้ recentComments ไปโชว์เลย (เร็ว)
*   ถ้ากด "Load More" -> ค่อยไป Query จาก Comment Collection (Scalable)
:::

---

## 📚 FAQ

**Q: `_id` กับ `id` ต่างกันยังไง?**
A: `_id` คือของจริงที่ MongoDB สร้าง (ObjectId) ส่วน `id` คือ Virtual getter ที่ Mongoose แถมให้ (แปลง `_id` เป็น String) ปกติใช้ `id` สะดวกกว่าในฝั่ง JS

**Q: Schema เปลี่ยนแล้วข้อมูลเก่าจะเป็นยังไง?**
A: **ไม่เปลี่ยนครับ!** MongoDB ไม่แก้ข้อมูลเก่าให้
ถ้าเราเพิ่ม field `age` และ set default 20... user เก่าจะ **ไม่มี** field นี้จนกว่าเราจะไป save ทับ
(ต้องเขียน Script Migration ถ้าต้องการแก้ของเก่า)

---

## 🔗 References
- [Mongoose Guide](https://mongoosejs.com/docs/guide.html)
- [MongoDB Schema Design Patterns](https://www.mongodb.com/blog/post/6-rules-of-thumb-for-mongodb-schema-design)
- [Mongoose Advanced Validation](https://mongoosejs.com/docs/validation.html#custom-validators)

> 👉 **บทต่อไป: [Module 7.3 - Mongoose Relations (Populate)](/node/07-03-mongoose-relations)**
