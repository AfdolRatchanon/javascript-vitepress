# 7.3 Mongoose Relations & populate() 🔗

> 💡 **เป้าหมาย:** เข้าใจ 2 กลยุทธ์หลักในการสร้าง Relationship ใน MongoDB (Embedding vs Referencing) และสามารถใช้ `populate()` ดึงข้อมูลจาก Collection ที่เกี่ยวข้องได้ทั้งแบบ shallow และ nested ในบริบท TP2026 Submission System

## 📖 ทฤษฎีและแนวคิด (Theory & Concepts)

### MongoDB มี Relationship หรือเปล่า?

หลายคนเข้าใจผิดว่า "NoSQL = ไม่มี Relationship" จริงๆ แล้วใน MongoDB เรา **มี** relationship
เพียงแต่เราต้องตัดสินใจเอง ว่าจะ "เก็บข้อมูลยังไง" ไม่ใช่ Database engine บังคับให้

เรามี **2 ทางเลือก** หลัก:

---

### Embedding vs Referencing — เปรียบเทียบแบบ Side by Side

```
  EMBEDDING (ฝังรวมกัน)          REFERENCING (อ้างอิงถึงกัน)
  ─────────────────────────       ───────────────────────────────
  {                               Collection: users
    _id: "u1",                    { _id: "u1", name: "Somchai" }
    name: "Somchai",
    address: {                    Collection: submissions
      city: "Bangkok",            {
      zip: "10110"                  _id: "s1",
    }                               candidateId: "u1",  ← ref
  }                                 score: 87
                                  }
  ─────────────────────────       ───────────────────────────────
  ✅ อ่านเร็ว ครั้งเดียวจบ       ✅ ข้อมูลไม่ซ้ำซ้อน
  ✅ Atomic update ง่าย           ✅ Document ไม่บวมขึ้นเรื่อยๆ
  ❌ Document บวมถ้าลูกเยอะ       ✅ Scale ได้ดี
  ❌ ลิมิต 16MB ต่อ document      ❌ ต้องใช้ populate() (2 queries)
```

---

### Rule of Thumb — เลือกแบบไหน?

```
  ข้อมูลลูก "น้อย" และ "คงที่"        →  EMBED
  เช่น: user.address, post.metadata

  ข้อมูลลูก "เยอะ" หรือ "โตเรื่อยๆ"  →  REFERENCE
  เช่น: task → submissions (เพิ่มได้เรื่อยๆ)

  ข้อมูลลูก "แชร์ข้าม parent หลายตัว" →  REFERENCE
  เช่น: task ถูกส่งโดย candidate หลายคน
```

ในระบบ TP2026:
- `User.address` → Embed (address อยู่ติดตัว user เสมอ ไม่โตไม่หด)
- `Submission.candidateId` → Reference (submission เชื่อมไปหา user)
- `Submission.taskId` → Reference (submission เชื่อมไปหา task)

---

### One-to-Many ใน TP2026

```
  Task (1)  ────────────────────────────────►  Submission (Many)
  ┌──────────────────────┐                     ┌─────────────────────────┐
  │  _id: ObjectId(t1)   │                     │  _id: ObjectId(s1)      │
  │  title: "Module A"   │◄────── taskId ──────│  taskId: ObjectId(t1)   │
  │  maxScore: 100       │                     │  candidateId: ObjectId  │
  └──────────────────────┘                     │  score: 87              │
                                               └─────────────────────────┘
  Task ไม่ได้เก็บ submissions[]               ┌─────────────────────────┐
  Submission เก็บ taskId ชี้กลับไปหา Task     │  _id: ObjectId(s2)      │
                                               │  taskId: ObjectId(t1)   │
  → Reference Pattern                         │  candidateId: ObjectId  │
                                               │  score: 91              │
                                               └─────────────────────────┘
```

---

### populate() ทำงานยังไงเบื้องหลัง?

```
  Code: Submission.find().populate('candidateId')

  Step 1: MongoDB ยิง query แรก
          db.submissions.find()
          ได้: [{ candidateId: ObjectId("u1"), ... }, ...]

  Step 2: Mongoose รวบรวม candidateId ทั้งหมด
          ids = ["u1", "u2", "u3"]

  Step 3: MongoDB ยิง query ที่สอง
          db.users.find({ _id: { $in: ["u1","u2","u3"] } })
          ได้: [{ _id:"u1", name:"Somchai",... }, ...]

  Step 4: Mongoose ประกอบร่าง (ใน Node.js memory)
          แทนที่ candidateId: "u1"
          ด้วย   candidateId: { _id:"u1", name:"Somchai", ... }
```

ดังนั้น `populate()` ไม่ใช่ SQL JOIN ที่ DB level แต่คือ **2 queries + client-side merge**

---

### Virtual Populate (Reverse Reference)

ปกติ Submission เก็บ `taskId` ชี้ไปหา Task
แต่ถ้าเราอยากรู้จาก Task ฝั่งว่า "มี submissions อะไรบ้าง?" โดยไม่เก็บ array ใน Task
เราใช้ **Virtual Populate**:

```
  taskSchema.virtual('submissions', {
    ref: 'Submission',        ← ไปดูที่ collection นี้
    localField: '_id',        ← เอา _id ของ Task
    foreignField: 'taskId'    ← ไปหาที่ field taskId ของ Submission
  });

  ผลลัพธ์:
  Task document จะมี virtual field 'submissions' ปรากฏขึ้นมา
  เมื่อเรียก .populate('submissions')
  (ไม่เก็บในฐานข้อมูล คำนวณ ณ runtime เท่านั้น)
```

---

## 💻 ตัวอย่างโค้ด (Code Implementation)

### Schema กับ ObjectId Reference

::: code-group
```js [models/Submission.js]
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    // Reference ไปหา User collection
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',      // ← ชื่อต้องตรงกับ mongoose.model('User', ...)
      required: true,
    },
    // Reference ไปหา Task collection
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    submissionUrl: {
      type: String,
      required: true,
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

module.exports = mongoose.model('Submission', submissionSchema);
```

```js [models/Task.js]
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    timeLimitMinutes: { type: Number, default: 240 },
    maxScore: { type: Number, default: 100 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual Populate: Task ดึง submissions ของตัวเองได้
// (ไม่เก็บ array ใน Task document จริง)
taskSchema.virtual('submissions', {
  ref: 'Submission',       // ไปดูที่ Submission collection
  localField: '_id',       // เอา _id ของ Task เอง
  foreignField: 'taskId',  // ไปเทียบกับ taskId ของ Submission
});

module.exports = mongoose.model('Task', taskSchema);
```
:::

---

### populate() แบบต่างๆ

::: code-group
```js [populate-basic.js]
const Submission = require('./models/Submission');

// ── ระดับที่ 1: Basic Populate ────────────────────────────
// แทนที่ candidateId: ObjectId("...") ด้วย object ของ User ทั้งหมด
const getWithCandidate = async () => {
  const submissions = await Submission.find().populate('candidateId');
  // ผลลัพธ์:
  // {
  //   candidateId: {
  //     _id: "65c...",
  //     name: "Somchai",
  //     country: "Thailand",
  //     role: "candidate",
  //     ...all fields
  //   },
  //   score: 87,
  //   ...
  // }
  return submissions;
};

// ── ระดับที่ 2: Populate + Select Fields ─────────────────
// เอาแค่บาง field เพื่อลด payload
const getWithCandidateInfo = async () => {
  const submissions = await Submission.find()
    .populate('candidateId', 'name country role') // เอาแค่ 3 field นี้
    .populate('taskId', 'title maxScore');         // เอาแค่ 2 field นี้
  // ผลลัพธ์:
  // {
  //   candidateId: { name: "Somchai", country: "Thailand", role: "candidate" },
  //   taskId: { title: "Module A - Web Tech", maxScore: 100 },
  //   score: 87,
  //   status: "scored"
  // }
  return submissions;
};
```

```js [populate-nested.js]
const Submission = require('./models/Submission');

// ── ระดับที่ 3: Nested Populate ───────────────────────────
// ถ้า Submission มี field ที่ซ้อนกัน เช่น judgeId ใน scoreDetail
// ที่ judgeId ก็เป็น ref ไปหา User อีกที
// ต้องใช้ nested populate:
const getFullSubmission = async (id) => {
  const submission = await Submission.findById(id)
    .populate('candidateId', 'name country region')
    .populate('taskId', 'title description timeLimitMinutes maxScore');

  return submission;
};

// ── ระดับที่ 4: Populate ด้วย Object Options ──────────────
// ใช้เมื่อต้องการ options เพิ่มเติม เช่น match, sort, limit
const getTopSubmissions = async (taskId) => {
  const submissions = await Submission.find({ taskId, status: 'scored' })
    .populate({
      path: 'candidateId',
      select: 'name country',
      // match: กรองเฉพาะ candidate จาก region เดียว (ถ้าต้องการ)
      // match: { region: 'Asia-Pacific' }
    })
    .sort({ score: -1 })
    .limit(10);

  return submissions;
};
```

```js [populate-virtual.js]
const Task = require('./models/Task');

// ── Virtual Populate: ดึง submissions จากฝั่ง Task ──────────
// Task ไม่มี submissions[] จริงๆ แต่ใช้ virtual populate ได้
const getTaskWithSubmissions = async (taskId) => {
  const task = await Task.findById(taskId).populate({
    path: 'submissions',             // virtual field ใน taskSchema
    select: 'candidateId score status submittedAt',
    populate: {                      // nested: populate candidateId ใน submission
      path: 'candidateId',
      select: 'name country',
    },
  });

  // ผลลัพธ์:
  // {
  //   _id: "t1",
  //   title: "Module A - Web Tech",
  //   submissions: [                    ← virtual field
  //     {
  //       score: 87,
  //       status: "scored",
  //       candidateId: { name: "Somchai", country: "Thailand" }
  //     },
  //     ...
  //   ]
  // }
  return task;
};
```

```js [full-submission-api.js]
const Submission = require('./models/Submission');
const User = require('./models/User');
const Task = require('./models/Task');

// สร้างข้อมูลตัวอย่าง TP2026
const seedData = async () => {
  // 1. สร้าง candidate
  const candidate = await User.create({
    username: 'somchai_th',
    passwordHash: 'plaintext_will_be_hashed_by_hook',
    name: 'Somchai Jaidee',
    role: 'candidate',
    country: 'Thailand',
    region: 'Asia-Pacific',
  });

  // 2. สร้าง task
  const task = await Task.create({
    title: 'Module A — Web Technologies',
    description: 'Build a responsive frontend with accessibility',
    timeLimitMinutes: 240,
    maxScore: 100,
  });

  // 3. สร้าง submission โดย reference ด้วย _id
  const submission = await Submission.create({
    candidateId: candidate._id,  // ObjectId reference
    taskId: task._id,            // ObjectId reference
    submissionUrl: 'https://github.com/somchai_th/wsa2026-moduleA',
    status: 'pending',
  });

  console.log('[TP2026] Seed complete. Submission ID:', submission._id);
};

// ดึง submission พร้อม populated data ครบ
const getFullSubmissionDetail = async (submissionId) => {
  const sub = await Submission.findById(submissionId)
    .populate('candidateId', 'name country region role')
    .populate('taskId', 'title timeLimitMinutes maxScore');

  if (!sub) return null;
  return sub;
};
```
:::

---

## 🎯 โจทย์ฝึกปฏิบัติเสริมความเข้าใจ

- **โจทย์:** เขียน function `getCandidateResults(candidateId)` ที่ดึง submissions ทั้งหมดของ candidate คนนั้น
  โดย populate ข้อมูล task มาด้วย (เฉพาะ title และ maxScore)
  แล้วเรียงตาม `submittedAt` จากใหม่ไปเก่า พร้อม return เฉพาะ submission ที่ `status: 'scored'`

::: details 💡 คำใบ้
```js
const getCandidateResults = async (candidateId) => {
  return Submission.find({ candidateId, status: 'scored' })
    .populate('taskId', 'title maxScore')
    .sort({ submittedAt: -1 });
};
```

ทดสอบ:
```js
const results = await getCandidateResults('65c123abc...');
results.forEach(r => {
  console.log(`${r.taskId.title}: ${r.score}/${r.taskId.maxScore}`);
});
```
:::

---

## 🔥 Challenge

- **โจทย์:** สร้างระบบ "Leaderboard per Task" โดย:
  1. รับ `taskId` เป็น input
  2. ดึง submissions ทั้งหมดของ task นั้นที่ `status: 'scored'`
  3. populate candidate ข้อมูล (name, country)
  4. เรียง score จากมากไปน้อย
  5. คืนค่า array พร้อม rank (1, 2, 3, ...)

  Bonus: ถ้า score เท่ากัน ให้ดู `submittedAt` (ใครส่งก่อนได้ rank ดีกว่า)

::: details 💡 คำใบ้
```js
const getLeaderboard = async (taskId) => {
  const submissions = await Submission.find({ taskId, status: 'scored' })
    .populate('candidateId', 'name country')
    .sort({ score: -1, submittedAt: 1 }); // score DESC, time ASC

  return submissions.map((sub, index) => ({
    rank: index + 1,
    name: sub.candidateId.name,
    country: sub.candidateId.country,
    score: sub.score,
    submittedAt: sub.submittedAt,
  }));
};
```
:::

---

## 🗣️ ทบทวน

::: details ❓ คำถามทบทวน

**คำถาม 1:** ในระบบ TP2026 ทำไม Submission ถึงใช้ Reference (ObjectId) ไปหา User และ Task แทนที่จะ Embed ข้อมูลไว้เลย?
**แนวคำตอบ:** เพราะ User และ Task ถูกใช้ร่วมกันโดย Submission หลายตัว (one candidate มีหลาย submissions, one task มีหลาย submissions) ถ้า embed ข้อมูล User ไว้ใน Submission ทุกตัว เมื่อแก้ชื่อ User จะต้องอัปเดตหลายที่พร้อมกัน การ Reference จึงป้องกัน Data Inconsistency

**คำถาม 2:** `populate('candidateId', 'name country')` ต่างจาก `populate('candidateId')` อย่างไร และเราควรเลือกใช้แบบไหน?
**แนวคำตอบ:** การ populate โดยไม่ select จะดึง **ทุก field** ของ User มารวมถึง passwordHash ซึ่งเป็น security risk ที่ไม่ควรส่งออก API นอกจากนี้ยังเปลือง bandwidth โดยไม่จำเป็น ควรเสมอ select เฉพาะ field ที่ใช้จริงเท่านั้น

**คำถาม 3:** Virtual Populate ต่างจาก Regular Populate อย่างไร และต้องทำอะไรพิเศษเพื่อให้มันทำงาน?
**แนวคำตอบ:** Regular Populate ดึงข้อมูลจาก field ที่เก็บ ObjectId จริงๆ ใน document ส่วน Virtual Populate ทำงานในทิศทางตรงกันข้าม (reverse reference) โดยไม่ต้องเก็บ array ของ IDs ใน parent document สิ่งที่ต้องทำคือ: (1) ตั้ง `toJSON: { virtuals: true }` ใน schema options (2) ระบุ `ref`, `localField`, `foreignField` อย่างถูกต้อง (3) เรียก `.populate('virtualFieldName')` ตอน query

:::

---

> 👉 **ไปต่อ: [Project 7 — Submission API](/node/07-project-blog-api)**
