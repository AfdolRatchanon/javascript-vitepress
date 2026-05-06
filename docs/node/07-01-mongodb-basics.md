# MongoDB Basics 🍃

> 💡 **เป้าหมาย:** เข้าใจความแตกต่างระหว่าง SQL และ NoSQL และเลือกใช้ได้ถูกสถานการณ์
> นักเรียนจะสามารถใช้ mongosh เพื่อทำ CRUD บน Collection ของระบบ WSA2026 ได้อย่างคล่องแคล่ว

---

## 📖 ทฤษฎีและแนวคิด (Theory & Concepts)

### SQL vs NoSQL — เลือกใช้อะไรดี?

ก่อนจะไปแตะ MongoDB ต้องเข้าใจก่อนว่าโลก Database มี 2 ขั้ว ที่คิดต่างกันสุดๆ

| คุณสมบัติ | SQL (Relational) 🏛️ | NoSQL (Document) 🍃 |
|:---|:---|:---|
| **โครงสร้าง** | ตาราง (Table) มี Row/Column | Document (JSON-like) ยืดหยุ่น |
| **Schema** | กำหนดตายตัวก่อนเสมอ | Schemaless — เพิ่ม Field ได้อิสระ |
| **ความสัมพันธ์** | JOIN หลายตาราง | Embedding หรือ Reference + populate() |
| **Scaling** | Vertical (อัปเกรดเครื่องเดิม) | Horizontal (เพิ่มเครื่องง่าย) |
| **ตัวอย่าง** | MySQL, PostgreSQL, SQLite | MongoDB, CouchDB, Firestore |
| **เหมาะกับ** | ข้อมูลมีโครงสร้างชัด, ต้องการ Transaction | ข้อมูลยืดหยุ่น, โปรเจกต์เติบโตเร็ว |

### เมื่อไหร่ควรเลือก MongoDB ✅

- ข้อมูลในแต่ละ Record ไม่เหมือนกัน (Unstructured/Semi-structured)
- ต้องการพัฒนาเร็ว เปลี่ยน schema บ่อย (Rapid Prototyping)
- ข้อมูลซับซ้อนมี Nested Object เยอะ (เช่น Submission + metadata)
- ต้องการ Scale แบบ Horizontal ในอนาคต

### เมื่อไหร่ควรเลือก SQL ✅

- ข้อมูลมีโครงสร้างชัดเจน เปลี่ยนไม่บ่อย
- ต้องการ ACID Transaction เต็มรูปแบบ (เช่น ระบบธนาคาร)
- ข้อมูล Relation ซับซ้อน JOIN หลายตาราง

---

### โครงสร้างข้อมูล: ตาราง SQL vs Document MongoDB

```
┌─────────────────────────────────────────────────────────┐
│            SQL — ตาราง "users"                           │
├────────┬────────────┬───────────────┬──────────┬────────┤
│  id    │  username  │  name         │  role    │country │
├────────┼────────────┼───────────────┼──────────┼────────┤
│  1     │  somchai   │  สมชาย ใจดี    │candidate │ THA    │
│  2     │  judge_k   │  นายกรรมการ    │ judge    │ THA    │
│  3     │  mgr_ann   │  แอน จัดการ    │ manager  │ THA    │
└────────┴────────────┴───────────────┴──────────┴────────┘
   ↑ ทุก Row ต้องมี Column เหมือนกัน ห้ามขาด!

┌──────────────────────────────────────────────────────────┐
│        MongoDB — Collection "users"                       │
│                                                           │
│  Document 1:                                              │
│  {                                                        │
│    _id: ObjectId("665abc..."),                            │
│    username: "somchai",                                   │
│    name: "สมชาย ใจดี",                                    │
│    role: "candidate",                                     │
│    country: "Thailand",                                   │
│    region: "Bangkok"          ← เพิ่ม field ได้เลย!      │
│  }                                                        │
│                                                           │
│  Document 2:                                              │
│  {                                                        │
│    _id: ObjectId("665def..."),                            │
│    username: "judge_k",                                   │
│    name: "นายกรรมการ",                                    │
│    role: "judge"              ← ไม่มี region ก็ได้        │
│  }                                                        │
└──────────────────────────────────────────────────────────┘
   ↑ แต่ละ Document ยืดหยุ่น ไม่ต้องมี field เหมือนกัน
```

---

### Hierarchy ของ MongoDB

```
MongoDB Server
└── Database: wsa2026_db
    ├── Collection: users
    │   ├── Document (User 1)
    │   ├── Document (User 2)
    │   └── ...
    ├── Collection: tasks
    │   ├── Document (Task 1)
    │   └── ...
    └── Collection: submissions
        ├── Document (Submission 1)
        └── ...
```

| SQL | MongoDB |
|:----|:--------|
| Database | Database |
| Table | Collection |
| Row | Document |
| Column | Field |
| Primary Key | `_id` (ObjectId) |
| Foreign Key | ObjectId ที่ ref ไปยัง Collection อื่น |

---

### Document Structure (BSON)

MongoDB เก็บข้อมูลในรูปแบบ **BSON** (Binary JSON) ซึ่งรองรับ Type เพิ่มเติมจาก JSON ปกติ:

```js
// ตัวอย่าง Document ใน Collection "submissions" ของ WSA2026
{
  _id: ObjectId("665f1a2b3c4d5e6f7a8b9c0d"),   // Auto-generated Unique ID
  candidateId: ObjectId("665abc123def456789"),   // อ้างอิงไป users collection
  taskId: ObjectId("665111222333444555"),          // อ้างอิงไป tasks collection
  submissionUrl: "https://github.com/somchai/task1",
  submittedAt: ISODate("2026-01-15T09:30:00Z"),   // Date Type
  score: 85,
  status: "scored"
}
```

> **ObjectId** คือ ID ขนาด 12 bytes ที่ MongoDB สร้างให้อัตโนมัติ ประกอบด้วย Timestamp + Machine ID + Random จึงไม่มีทางซ้ำกัน

---

## 💻 ตัวอย่างโค้ด (Code Implementation)

### การเชื่อมต่อด้วย mongosh

```bash
# เชื่อมต่อ MongoDB Atlas
mongosh "mongodb+srv://<username>:<password>@cluster0.xyz.mongodb.net/"

# หรือ Local MongoDB
mongosh
```

### เลือก Database และดู Collections

```js
// เลือก Database
use wsa2026_db

// ดู Collections ทั้งหมด
show collections

// ดูจำนวน Document ใน Collection
db.users.countDocuments()
db.submissions.countDocuments()
```

---

### CRUD Commands ใน mongosh

::: code-group

```js [Insert (Create)]
// insertOne — เพิ่ม User คนเดียว
db.users.insertOne({
  username: "somchai_th",
  passwordHash: "$2b$10$abcdefg...",
  name: "สมชาย ใจดี",
  role: "candidate",
  country: "Thailand",
  region: "Bangkok"
})

// insertMany — เพิ่มหลาย Task พร้อมกัน
db.tasks.insertMany([
  {
    title: "Build REST API",
    description: "สร้าง Express REST API ที่มี CRUD ครบถ้วน",
    timeLimitMinutes: 120,
    maxScore: 100,
    createdAt: new Date()
  },
  {
    title: "Database Design",
    description: "ออกแบบ Schema และ Query ให้มีประสิทธิภาพ",
    timeLimitMinutes: 90,
    maxScore: 80,
    createdAt: new Date()
  }
])
```

```js [Find (Read)]
// หา Users ทั้งหมด
db.users.find()

// หาด้วยเงื่อนไข — หา Candidates ทั้งหมดจาก Thailand
db.users.find({ role: "candidate", country: "Thailand" })

// findOne — หาแค่คนเดียว
db.users.findOne({ username: "somchai_th" })

// Comparison Operators
// $eq  = เท่ากับ   | $ne  = ไม่เท่ากับ
// $gt  = มากกว่า   | $gte = มากกว่าหรือเท่ากับ
// $lt  = น้อยกว่า  | $lte = น้อยกว่าหรือเท่ากับ
// $in  = อยู่ในลิสต์
db.submissions.find({ score: { $gte: 80 } })
db.submissions.find({ score: { $lt: 50 } })
db.users.find({ role: { $in: ["judge", "manager"] } })

// Logical Operators — $and, $or
db.users.find({
  $and: [
    { role: "candidate" },
    { country: "Thailand" }
  ]
})

db.submissions.find({
  $or: [
    { status: "pending" },
    { score: { $lt: 60 } }
  ]
})

// หา Submission ที่ยังไม่ได้ตรวจ (status = pending)
db.submissions.find({ status: "pending" })

// Projection — เลือกเฉพาะ Field ที่ต้องการ (1=เอา, 0=ไม่เอา)
// ดูชื่อและ role โดยไม่เอา _id
db.users.find(
  { role: "candidate" },
  { name: 1, role: 1, country: 1, _id: 0 }
)

// เรียงและจำกัดผลลัพธ์
db.submissions.find({ status: "scored" })
  .sort({ score: -1 })   // เรียงคะแนนมาก → น้อย
  .limit(10)              // เอาแค่ 10 รายการ
```

```js [Update]
// updateOne — แก้ Submission เดียว: ตั้งคะแนนและเปลี่ยน status
db.submissions.updateOne(
  { _id: ObjectId("665f1a2b3c4d5e6f7a8b9c0d") },   // Filter
  {
    $set: {
      score: 92,
      status: "scored"
    }
  }
)

// $set บังคับใช้เสมอ ถ้าไม่ใช้ Document จะถูก Replace ทั้งหมด!
// ผิด: db.submissions.updateOne({ ... }, { score: 92 })  ← Document เดิมหายหมด!
// ถูก: db.submissions.updateOne({ ... }, { $set: { score: 92 } })

// updateMany — อัปเดตหลายรายการ
db.submissions.updateMany(
  { status: "pending", submittedAt: { $lt: new Date("2026-01-01") } },
  { $set: { status: "overdue" } }
)

// $inc — เพิ่ม/ลดตัวเลข
db.tasks.updateOne(
  { title: "Build REST API" },
  { $inc: { maxScore: 10 } }  // เพิ่ม maxScore อีก 10
)
```

```js [Delete]
// deleteOne — ลบ Document เดียว
db.submissions.deleteOne({ _id: ObjectId("665f1a2b3c4d5e6f7a8b9c0d") })

// deleteMany — ลบหลายรายการ (ระวัง!)
db.submissions.deleteMany({ status: "pending", score: 0 })

// ลบทั้ง Collection (อันตราย!)
// db.submissions.deleteMany({})
```

:::

---

### Query Operators สรุปรวม

```js
// TP2026 Use Cases

// 1. หา Candidates ทั้งหมดจาก Thailand
db.users.find(
  { role: "candidate", country: "Thailand" },
  { name: 1, username: 1, region: 1, _id: 0 }
)

// 2. หา Submissions ที่ยังไม่ได้ตรวจ (pending)
db.submissions.find({ status: "pending" })

// 3. หา Submissions ที่ได้คะแนน 70 คะแนนขึ้นไป
db.submissions.find({ score: { $gte: 70 }, status: "scored" })

// 4. หา Task ที่มี timeLimitMinutes ระหว่าง 60-120 นาที
db.tasks.find({
  timeLimitMinutes: { $gte: 60, $lte: 120 }
})

// 5. หา Judges และ Managers (ทุก Role ที่ไม่ใช่ candidate)
db.users.find({
  role: { $in: ["judge", "manager"] }
})
```

---

## 🎯 โจทย์ฝึกปฏิบัติเสริมความเข้าใจ (Mini Exercise)

**โจทย์:** ใช้ mongosh เพื่อ Query ข้อมูลจาก WSA2026 Database ให้ครบทุกข้อต่อไปนี้

1. หา Candidates ทั้งหมดจากประเทศ Thailand โดยแสดงเฉพาะ `name`, `username`, `region` (ไม่ต้องแสดง `_id`)
2. หา Submissions ที่ยังไม่ได้ตรวจ (`status: "pending"`) เรียงตาม `submittedAt` จากเก่าไปใหม่
3. หา Tasks ที่มี `maxScore` มากกว่า 80 คะแนน
4. นับจำนวน Submissions ที่ได้ `score` ต่ำกว่า 50 ด้วย `countDocuments()`

::: details 💡 คำใบ้ (Hint)

```js
// ข้อ 1: ใช้ Projection และ find() พร้อม filter
db.users.find(
  { role: "candidate", country: "Thailand" },
  { name: 1, username: 1, region: 1, _id: 0 }
)

// ข้อ 2: ใช้ .sort() กับ submittedAt: 1 (ASC = เก่าก่อน)
db.submissions.find({ status: "pending" }).sort({ submittedAt: 1 })

// ข้อ 3: ใช้ $gt
db.tasks.find({ maxScore: { $gt: 80 } })

// ข้อ 4: ใช้ countDocuments() แทน find()
db.submissions.countDocuments({ score: { $lt: 50 } })
```

:::

---

## 🔥 Challenge (โจทย์ท้าทาย!)

**โจทย์:** สร้างข้อมูล WSA2026 จำลองและ Query ให้ครบ

1. `insertMany` Users 5 คน: มี candidates 3 คน (2 คนจาก Thailand, 1 คนจาก Japan), judge 1 คน, manager 1 คน
2. `insertMany` Tasks 2 งาน ที่มี `timeLimitMinutes` ต่างกัน
3. `insertMany` Submissions 4 รายการ: 2 รายการ `status: "scored"`, 2 รายการ `status: "pending"`
4. เขียน Query: หา Submissions ที่ `status: "pending"` **หรือ** `score` น้อยกว่า 60
5. เขียน Query: อัปเดต Submission ทั้งหมดที่ score เป็น `null` ให้เป็น `0`

::: details 💡 แนวทาง

```js
// ข้อ 4: $or operator
db.submissions.find({
  $or: [
    { status: "pending" },
    { score: { $lt: 60 } }
  ]
})

// ข้อ 5: updateMany + $set + $exists
db.submissions.updateMany(
  { score: null },
  { $set: { score: 0 } }
)
```

:::

---

## 🗣️ ทบทวน (Review)

::: details ❓ คำถามทบทวนความเข้าใจ

**คำถาม 1:** NoSQL (MongoDB) แตกต่างจาก SQL (MySQL) อย่างไรในเรื่อง Schema?

**แนวคำตอบ:** SQL ต้องกำหนด Schema (ชื่อ Column และ Type) ล่วงหน้าก่อนเสมอ ทุก Row ต้องมีโครงสร้างเหมือนกัน ส่วน MongoDB เป็น Schemaless — แต่ละ Document ในชอง Collection เดียวกัน ไม่จำเป็นต้องมี Field เหมือนกัน จึงยืดหยุ่นกว่ามาก แต่ต้องระวังเรื่อง Consistency ของข้อมูลเอง

**คำถาม 2:** ทำไมต้องใช้ `$set` ใน updateOne แทนที่จะใส่ค่าใหม่ตรงๆ?

**แนวคำตอบ:** ถ้าไม่ใช้ `$set` MongoDB จะ **Replace** Document ทั้งหมดด้วย Object ที่ส่งไป ทำให้ Field เดิมที่ไม่ได้ระบุหายไปหมด ตัวอย่าง: `updateOne({name:"A"}, {score:10})` จะเหลือแค่ `{score:10}` ส่วน Field อื่นหายหมด แต่ `updateOne({name:"A"}, {$set:{score:10}})` จะอัปเดตแค่ `score` โดย Field อื่นยังอยู่ครบ

**คำถาม 3:** Projection ใน MongoDB คืออะไร และใช้ยังไง?

**แนวคำตอบ:** Projection คือการเลือกเฉพาะ Field ที่ต้องการในผลลัพธ์ คล้ายกับ `SELECT column1, column2` ใน SQL รูปแบบคือ parameter ที่ 2 ของ `find()`: ใส่ `1` สำหรับ Field ที่ต้องการ และ `0` สำหรับ Field ที่ไม่ต้องการ (ไม่ควรผสมกัน ยกเว้น `_id`) เช่น `db.users.find({}, { name: 1, role: 1, _id: 0 })`

**คำถาม 4:** ObjectId คืออะไร และทำไม MongoDB ใช้มันแทน Auto-increment Integer?

**แนวคำตอบ:** ObjectId คือ Unique ID ขนาด 12 bytes ที่ประกอบด้วย Timestamp (4 bytes) + Machine ID (5 bytes) + Random Counter (3 bytes) ข้อดีคือสามารถ Generate ได้จากหลายเครื่องพร้อมกันโดยไม่ชนกัน เหมาะกับระบบ Distributed ที่ MongoDB ถนัด ส่วน Auto-increment ต้องการ Central Counter ทำให้ Scale แบบ Horizontal ยาก

:::

---

> 👉 **[ไปต่อ: 7.2 Mongoose ODM](/node/07-02-mongoose-odm)**
