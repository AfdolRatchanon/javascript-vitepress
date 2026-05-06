# 7.2 Mongoose ODM 🦁

> 💡 **เป้าหมาย:** เข้าใจว่า Mongoose คืออะไรและทำงานอย่างไรในฐานะ ODM Layer บน MongoDB Driver รู้จักการสร้าง Schema, Model และใช้งาน CRUD Operations ครบทุกรูปแบบในบริบท WorldSkills 2026

## 📖 ทฤษฎีและแนวคิด (Theory & Concepts)

### Mongoose คืออะไร?

MongoDB Driver ดิบๆ นั้นสามารถใช้งานได้เลย แต่มันยืดหยุ่นเกินไปจน "อันตราย" ในโปรเจกต์จริง
**Mongoose** คือไลบรารีประเภท **ODM (Object Data Modeling)** ที่ทำหน้าที่เป็น "ชั้นกลาง" ระหว่าง Node.js App กับ MongoDB

```
┌─────────────────────────────────────────────────────────┐
│                   YOUR NODE.JS APP                      │
│                                                         │
│   const sub = await Submission.findById(id)             │
│                       ↑                                 │
│              [ MONGOOSE ODM LAYER ]                     │
│   - Validates data against Schema                       │
│   - Converts JS Object ↔ MongoDB Document               │
│   - Provides Model methods (find, save, etc.)           │
│                       ↑                                 │
│              [ MONGODB DRIVER ]                         │
│   - Raw TCP/IP connection to MongoDB                    │
│                       ↑                                 │
│              [ MONGODB SERVER ]                         │
│   - Stores actual BSON documents                        │
└─────────────────────────────────────────────────────────┘
```

สิ่งที่ Mongoose เพิ่มให้เหนือ Driver ดิบ:
- **Schema Enforcement** — บังคับโครงสร้างข้อมูลก่อน save
- **Built-in Validation** — ตรวจ required, min, max, enum ฯลฯ
- **Middleware / Hooks** — รัน logic ก่อน/หลัง save, delete
- **Virtuals** — field ที่คำนวณเอง ไม่เก็บใน DB
- **Populate** — ดึง referenced document มาแทน ObjectId

---

### Schema → Model → Document Relationship

```
  SCHEMA (แม่พิมพ์ / Blueprint)
  ┌────────────────────────────────────┐
  │  new mongoose.Schema({ ... })      │
  │  บอกว่า field ชื่ออะไร type อะไร  │
  │  validate ยังไง default เท่าไหร่   │
  └──────────────┬─────────────────────┘
                 │  mongoose.model('Name', schema)
                 ▼
  MODEL (ตัวแทนของ Collection)
  ┌────────────────────────────────────┐
  │  Submission (Class-like object)    │
  │  .find()  .create()  .findById()  │
  │  .findByIdAndUpdate()  .delete()   │
  └──────────────┬─────────────────────┘
                 │  new Model(data)  หรือ  Model.create(data)
                 ▼
  DOCUMENT (instance / record ใน Collection)
  ┌────────────────────────────────────┐
  │  {                                 │
  │    _id: ObjectId("65c..."),        │
  │    candidateId: ObjectId("..."),   │
  │    score: 87,                      │
  │    status: "scored"                │
  │  }                                 │
  └────────────────────────────────────┘
```

---

### SchemaTypes ที่ต้องรู้

| SchemaType | ตัวอย่างการใช้งาน | หมายเหตุ |
|:---|:---|:---|
| `String` | username, title, role | รองรับ trim, lowercase, enum |
| `Number` | score, timeLimitMinutes | รองรับ min, max |
| `Date` | submittedAt, createdAt | default: Date.now |
| `Boolean` | isActive, isVerified | true / false |
| `ObjectId` | candidateId, taskId | ใช้กับ ref สำหรับ populate |
| `Array` | tags: [String] | Array ของ type ใดก็ได้ |
| `Mixed` | metadata: mongoose.Schema.Types.Mixed | ยืดหยุ่น ไม่ validate |
| `Buffer` | fileData | ข้อมูลไบนารี |

---

### Schema Validation Options

```
  ตัวเลือก Validation ที่ใช้บ่อย
  ┌──────────────────────────────────────────────────────┐
  │  required: true           → บังคับต้องมีค่า         │
  │  default: 'pending'       → ค่าเริ่มต้นถ้าไม่ใส่    │
  │  unique: true             → ห้ามซ้ำในทั้ง collection │
  │  min: 0 / max: 100        → สำหรับ Number/Date       │
  │  minlength / maxlength    → สำหรับ String            │
  │  enum: ['a','b','c']      → ต้องเป็นค่าใน list เท่านั้น│
  │  trim: true               → ตัด whitespace หัว-ท้าย  │
  │  lowercase: true          → แปลงเป็นตัวเล็กอัตโนมัติ│
  │  match: /regex/           → ต้อง match pattern        │
  └──────────────────────────────────────────────────────┘
```

---

### Instance Methods vs Static Methods

**Instance Method** — ทำงานกับ Document ตัวเดียว (เรียกบน instance)
```
  sub.checkPassed()   ← เรียกบน document instance
```

**Static Method** — ทำงานกับ Collection ทั้งหมด (เรียกบน Model)
```
  Submission.findByCandidate(id)   ← เรียกบน Model class
```

---

### Virtuals คืออะไร

Virtual คือ field ที่ **ไม่ได้เก็บใน MongoDB** แต่คำนวณ (หรืออนุมาน) ได้จาก field จริงๆ
ประโยชน์คือ:
- ลด Redundancy ไม่ต้องเก็บข้อมูลซ้ำซ้อน
- คำนวณ ณ Runtime เช่น `fullName = firstName + ' ' + lastName`
- ใช้กับ Virtual Populate (reverse reference ระหว่าง collections)

---

### Pre / Post Hooks (Middleware)

Mongoose Middleware คือ function ที่รันโดยอัตโนมัติ **ก่อน (pre)** หรือ **หลัง (post)** operation บางอย่าง

```
  pre('save')    → รันก่อน document.save()
  post('save')   → รันหลัง document.save() สำเร็จ
  pre('find')    → รันก่อน Model.find()
  pre('deleteOne') → รันก่อน document.deleteOne()
```

Use case ยอดฮิตในงานจริง:
- **Hash password** ก่อน save User
- **Set timestamps** อัตโนมัติ
- **Cascade delete** ลบ dependent documents
- **Log** ทุกครั้งที่มีการ update

---

## 💻 ตัวอย่างโค้ด (Code Implementation)

### ติดตั้ง Mongoose

```bash
npm install mongoose dotenv
```

### เชื่อมต่อ MongoDB

::: code-group
```js [db.js]
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected: WorldSkills 2026 DB ready');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```
:::

---

### TP2026 Mongoose Schemas (User, Task, Submission)

::: code-group
```js [models/User.js]
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['candidate', 'judge', 'manager'],
      default: 'candidate',
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    region: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,           // createdAt, updatedAt อัตโนมัติ
    toJSON: { virtuals: true }, // ให้ virtual fields ออกมาใน JSON
    toObject: { virtuals: true },
  }
);

// ─── VIRTUAL ────────────────────────────────────────────
// displayLabel ไม่เก็บใน DB แต่คำนวณจาก name + country
userSchema.virtual('displayLabel').get(function () {
  return `${this.name} (${this.country})`;
});

// ─── INSTANCE METHOD ─────────────────────────────────────
// เรียกบน document: user.comparePassword(plain)
userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

// ─── STATIC METHOD ───────────────────────────────────────
// เรียกบน Model: User.findByRole('judge')
userSchema.statics.findByRole = function (role) {
  return this.find({ role });
};

// ─── PRE HOOK ────────────────────────────────────────────
// Hash password ก่อน save ทุกครั้ง (ถ้า passwordHash ถูกแก้)
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);
```

```js [models/Task.js]
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    timeLimitMinutes: {
      type: Number,
      default: 240,
      min: [1, 'Time limit must be positive'],
      max: [480, 'Time limit cannot exceed 480 minutes'],
    },
    maxScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

// ─── VIRTUAL ────────────────────────────────────────────
// แสดง time limit ในรูปแบบ "4h 00m"
taskSchema.virtual('timeLimitFormatted').get(function () {
  const h = Math.floor(this.timeLimitMinutes / 60);
  const m = this.timeLimitMinutes % 60;
  return `${h}h ${String(m).padStart(2, '0')}m`;
});

module.exports = mongoose.model('Task', taskSchema);
```

```js [models/Submission.js]
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',          // อ้างอิงไปที่ User collection
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',          // อ้างอิงไปที่ Task collection
      required: true,
    },
    submissionUrl: {
      type: String,
      required: [true, 'Submission URL is required'],
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'scored'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── VIRTUAL ────────────────────────────────────────────
// isPassed: ถ้า score >= 60 ถือว่าผ่าน
submissionSchema.virtual('isPassed').get(function () {
  if (this.score === null) return false;
  return this.score >= 60;
});

// ─── STATIC METHOD ───────────────────────────────────────
// Submission.findPending() — ดึงเฉพาะที่ยังไม่ได้ตรวจ
submissionSchema.statics.findPending = function () {
  return this.find({ status: 'pending' });
};

// ─── POST HOOK ───────────────────────────────────────────
// Log ทุกครั้งที่มี submission ใหม่
submissionSchema.post('save', function (doc) {
  console.log(`[TP2026] New submission saved: ${doc._id} | status: ${doc.status}`);
});

module.exports = mongoose.model('Submission', submissionSchema);
```
:::

---

### CRUD Operations กับ Mongoose

::: code-group
```js [crud-create.js]
const Submission = require('./models/Submission');

// วิธีที่ 1: สร้าง instance แล้ว save()
const submitViaInstance = async (candidateId, taskId, url) => {
  const sub = new Submission({
    candidateId,
    taskId,
    submissionUrl: url,
  });
  const saved = await sub.save(); // trigger pre/post hooks
  return saved;
};

// วิธีที่ 2: Model.create() — สั้นกว่า (ก็ trigger hooks เหมือนกัน)
const submitViaCreate = async (candidateId, taskId, url) => {
  const saved = await Submission.create({
    candidateId,
    taskId,
    submissionUrl: url,
  });
  return saved;
};
```

```js [crud-read.js]
const Submission = require('./models/Submission');

// ดึงทั้งหมด
const getAll = async () => {
  return Submission.find();
};

// ดึงด้วย filter + sort + limit
const getPending = async () => {
  return Submission.find({ status: 'pending' })
    .sort({ submittedAt: 1 })   // เก่าสุดก่อน (FIFO)
    .limit(20)
    .select('candidateId taskId submittedAt submissionUrl'); // เลือกเฉพาะ field
};

// ดึงด้วย ID
const getById = async (id) => {
  return Submission.findById(id); // findById(id) === findOne({ _id: id })
};

// ดึงด้วยเงื่อนไขเดียว
const getByCandidate = async (candidateId) => {
  return Submission.findOne({ candidateId });
};
```

```js [crud-update.js]
const Submission = require('./models/Submission');

// Update และรับ Document หลัง update กลับมา
const scoreSubmission = async (id, score) => {
  const updated = await Submission.findByIdAndUpdate(
    id,
    {
      $set: { score, status: 'scored' },
    },
    { new: true } // คืนค่า document ที่ update แล้ว (ถ้าไม่ใส่จะได้ค่าเก่า!)
  );
  return updated;
};

// Update หลาย documents พร้อมกัน
const resetAllPending = async () => {
  const result = await Submission.updateMany(
    { status: 'scored' },
    { $set: { score: null, status: 'pending' } }
  );
  console.log(`Reset ${result.modifiedCount} submissions`);
};
```

```js [crud-delete.js]
const Submission = require('./models/Submission');

// ลบด้วย ID
const deleteById = async (id) => {
  return Submission.findByIdAndDelete(id);
};

// ลบหลาย documents ตามเงื่อนไข
const deletePendingByTask = async (taskId) => {
  const result = await Submission.deleteMany({ taskId, status: 'pending' });
  return result.deletedCount;
};
```
:::

---

## 🎯 โจทย์ฝึกปฏิบัติเสริมความเข้าใจ

- **โจทย์:** เพิ่ม **Instance Method** ชื่อ `getGrade()` ใน `Submission` Schema
  ให้คืนค่าเป็น `'A'` (90-100), `'B'` (75-89), `'C'` (60-74), `'F'` (ต่ำกว่า 60 หรือ null)
  แล้วทดสอบโดยสร้าง submission ที่มี score ต่างๆ และเรียก `.getGrade()`

::: details 💡 คำใบ้
เพิ่ม method เข้าไปใน `submissionSchema.methods` ก่อน `mongoose.model()`

```js
submissionSchema.methods.getGrade = function () {
  if (this.score === null) return 'N/A';
  if (this.score >= 90) return 'A';
  if (this.score >= 75) return 'B';
  if (this.score >= 60) return 'C';
  return 'F';
};
```

เรียกใช้:
```js
const sub = await Submission.findById(someId);
console.log(sub.getGrade()); // 'B'
```
:::

---

## 🔥 Challenge

- **โจทย์:** เขียน **Pre Hook** บน `submissionSchema` สำหรับ `pre('save')` เพื่อตรวจสอบว่า
  ถ้า `status` จะถูกเปลี่ยนเป็น `'scored'` แต่ `score` ยังเป็น `null` อยู่
  ให้ throw Error ว่า `"Cannot mark as scored without a score value"`

  และเขียน **Static Method** `Submission.getLeaderboard(taskId)` ที่คืนค่า
  candidates เรียงตาม score จากมากไปน้อย (เฉพาะ status: 'scored')

::: details 💡 คำใบ้
```js
// Pre hook
submissionSchema.pre('save', function (next) {
  if (this.status === 'scored' && this.score === null) {
    return next(new Error('Cannot mark as scored without a score value'));
  }
  next();
});

// Static method
submissionSchema.statics.getLeaderboard = function (taskId) {
  return this.find({ taskId, status: 'scored' })
    .sort({ score: -1 })
    .populate('candidateId', 'name country');
};
```
:::

---

## 🗣️ ทบทวน

::: details ❓ คำถามทบทวน

**คำถาม 1:** ความแตกต่างระหว่าง `new Model(data).save()` กับ `Model.create(data)` คืออะไร ใช้อันไหนดีกว่าในสถานการณ์ใด?
**แนวคำตอบ:** ทั้งสองทำงานเหมือนกัน (trigger pre/post hooks ทั้งคู่) แต่ `Model.create()` สั้นกว่าและ return document ที่ save แล้วโดยตรง ส่วน `new Model().save()` มีประโยชน์เมื่อต้องการตรวจสอบ validation หรือแก้ไข document object ก่อน save จริง

**คำถาม 2:** `{ new: true }` ใน `findByIdAndUpdate()` มีความสำคัญอย่างไร ถ้าไม่ใส่จะเกิดอะไรขึ้น?
**แนวคำตอบ:** โดย default `findByIdAndUpdate()` จะคืนค่า document **ก่อน** update (old version) กลับมา การใส่ `{ new: true }` บอก Mongoose ให้คืนค่า document **หลัง** update แทน ซึ่งจำเป็นมากเวลาเราต้องการส่ง updated data กลับไปให้ client

**คำถาม 3:** Virtual field แตกต่างจาก field จริงใน Schema อย่างไร และมีข้อจำกัดอะไรบ้าง?
**แนวคำตอบ:** Virtual field ไม่ถูกเก็บใน MongoDB เลย คำนวณ ณ Runtime ใน Node.js เท่านั้น ข้อจำกัดสำคัญคือ **ไม่สามารถใช้ใน query filter ได้** เช่น `find({ isPassed: true })` จะใช้ไม่ได้ ต้องใช้ MongoDB Aggregation `$expr` แทน นอกจากนี้ต้องตั้ง `toJSON: { virtuals: true }` จึงจะปรากฏใน JSON output

:::

---

> 👉 **ไปต่อ: [7.3 Mongoose Relations & populate()](/node/07-03-mongoose-relations)**
