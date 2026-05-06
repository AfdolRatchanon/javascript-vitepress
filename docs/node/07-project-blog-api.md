# Project 7: Submission Tracking API 🏆

> 💡 **เป้าหมาย:** สร้าง RESTful API สำหรับระบบติดตาม Submission ของการแข่งขัน WorldSkills 2026 โดยใช้ Express + Mongoose โดยแสดงข้อมูลแบบ populated ที่รวม candidate name และ task title ในผลลัพธ์เดียว

## 🎯 Project Goals

1. **MongoDB + Mongoose** — เชื่อมต่อ Database และสร้าง Schema ตาม TP2026 spec
2. **Full CRUD** — POST, GET (all + by id), PUT (score) สำหรับ Submissions
3. **populate()** — ดึงข้อมูล candidate และ task มาพร้อมกันใน response เดียว
4. **Validation** — ตรวจสอบ field ก่อน save ด้วย Mongoose Schema options
5. **Aggregation Challenge** — สร้าง leaderboard endpoint ด้วย `$group` + `$sort`

---

## 🏗️ Architecture

```
  ┌─────────────────────────────────────────────────────────┐
  │                  CLIENT (Postman / Frontend)            │
  │                   HTTP Requests                         │
  └────────────────────────┬────────────────────────────────┘
                           │
  ┌────────────────────────▼────────────────────────────────┐
  │               EXPRESS APP (app.js)                      │
  │   Middleware: cors, express.json, dotenv                │
  └────────────────────────┬────────────────────────────────┘
                           │
  ┌────────────────────────▼────────────────────────────────┐
  │                   ROUTES LAYER                          │
  │   /api/submissions  →  submissionRoutes.js              │
  └────────────────────────┬────────────────────────────────┘
                           │
  ┌────────────────────────▼────────────────────────────────┐
  │               CONTROLLERS LAYER                         │
  │   submissionController.js                               │
  │   (business logic: validate, query, respond)            │
  └──────┬─────────────────┬───────────────────────────────┘
         │                 │
  ┌──────▼──────┐  ┌───────▼──────┐  ┌────────────────────┐
  │ Submission  │  │    Task      │  │       User         │
  │  Model      │  │   Model      │  │      Model         │
  └──────┬──────┘  └───────┬──────┘  └────────────────────┘
         │                 │
  ┌──────▼─────────────────▼────────────────────────────────┐
  │               MONGODB (Atlas / Local)                   │
  │   Collections: submissions, tasks, users                │
  └─────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
submission-api/
├── models/
│   ├── User.js
│   ├── Task.js
│   └── Submission.js
├── controllers/
│   └── submissionController.js
├── routes/
│   └── submissionRoutes.js
├── db.js
├── app.js
├── seed.js
├── .env
└── package.json
```

### Installation

```bash
npm init -y
npm install express mongoose dotenv cors
```

---

## 🏗️ Models

::: code-group
```js [models/User.js]
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['candidate', 'judge', 'manager'],
      default: 'candidate',
    },
    country: { type: String, required: true, trim: true },
    region: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
```

```js [models/Task.js]
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    timeLimitMinutes: { type: Number, default: 240, min: 1, max: 480 },
    maxScore: { type: Number, default: 100, min: 0, max: 100 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
```

```js [models/Submission.js]
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'candidateId is required'],
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'taskId is required'],
    },
    submissionUrl: {
      type: String,
      required: [true, 'submissionUrl is required'],
      trim: true,
    },
    submittedAt: { type: Date, default: Date.now },
    score: { type: Number, min: 0, max: 100, default: null },
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

// Virtual: isPassed
submissionSchema.virtual('isPassed').get(function () {
  if (this.score === null) return false;
  return this.score >= 60;
});

// Pre hook: ป้องกัน scored โดยไม่มี score
submissionSchema.pre('save', function (next) {
  if (this.status === 'scored' && this.score === null) {
    return next(new Error('Cannot mark as scored without a score value'));
  }
  next();
});

module.exports = mongoose.model('Submission', submissionSchema);
```
:::

---

## 💻 Implementation

::: code-group
```js [db.js]
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[TP2026] MongoDB Connected');
  } catch (err) {
    console.error('[TP2026] MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

```js [app.js]
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const submissionRoutes = require('./routes/submissionRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// Routes
app.use('/api/submissions', submissionRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'TP2026 Submission API is running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[TP2026] Error:', err.message);
  res.status(500).json({ success: false, error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[TP2026] Server running on port ${PORT}`);
});
```

```js [routes/submissionRoutes.js]
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/submissionController');

// POST /api/submissions          — ส่ง submission ใหม่
router.post('/', ctrl.create);

// GET  /api/submissions          — ดึงทั้งหมด (พร้อม populate)
router.get('/', ctrl.getAll);

// GET  /api/submissions/:id      — ดึงเฉพาะอันเดียว (พร้อม populate)
router.get('/:id', ctrl.getById);

// PUT  /api/submissions/:id/score — ตรวจให้คะแนน
router.put('/:id/score', ctrl.scoreSubmission);

module.exports = router;
```

```js [controllers/submissionController.js]
const Submission = require('../models/Submission');

// ─── POST /api/submissions ─────────────────────────────────
exports.create = async (req, res) => {
  try {
    const { candidateId, taskId, submissionUrl } = req.body;

    const submission = await Submission.create({
      candidateId,
      taskId,
      submissionUrl,
    });

    res.status(201).json({
      success: true,
      data: submission,
    });
  } catch (err) {
    // Mongoose validation error
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, error: err.message });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── GET /api/submissions ──────────────────────────────────
// populate candidate name + country, task title + maxScore
exports.getAll = async (req, res) => {
  try {
    const { status } = req.query; // ?status=pending หรือ ?status=scored
    const filter = status ? { status } : {};

    const submissions = await Submission.find(filter)
      .populate('candidateId', 'name country region')
      .populate('taskId', 'title maxScore timeLimitMinutes')
      .sort({ submittedAt: -1 }); // ใหม่สุดขึ้นก่อน

    res.json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── GET /api/submissions/:id ──────────────────────────────
exports.getById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('candidateId', 'name country region role')
      .populate('taskId', 'title description timeLimitMinutes maxScore');

    if (!submission) {
      return res.status(404).json({ success: false, error: 'Submission not found' });
    }

    res.json({ success: true, data: submission });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── PUT /api/submissions/:id/score ───────────────────────
exports.scoreSubmission = async (req, res) => {
  try {
    const { score } = req.body;

    if (score === undefined || score === null) {
      return res.status(400).json({ success: false, error: 'score is required' });
    }

    if (score < 0 || score > 100) {
      return res.status(400).json({ success: false, error: 'score must be between 0 and 100' });
    }

    const updated = await Submission.findByIdAndUpdate(
      req.params.id,
      { $set: { score, status: 'scored' } },
      { new: true, runValidators: true }
    )
      .populate('candidateId', 'name country')
      .populate('taskId', 'title maxScore');

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Submission not found' });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
```
:::

---

## 🌱 Seed Data

::: code-group
```js [seed.js]
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Task = require('./models/Task');
const Submission = require('./models/Submission');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[TP2026] Connected for seeding...');

  // Clear existing
  await User.deleteMany({});
  await Task.deleteMany({});
  await Submission.deleteMany({});

  // Create candidates
  const candidates = await User.insertMany([
    {
      username: 'somchai_th',
      passwordHash: 'hashed_pw_1',
      name: 'Somchai Jaidee',
      role: 'candidate',
      country: 'Thailand',
      region: 'Asia-Pacific',
    },
    {
      username: 'ana_br',
      passwordHash: 'hashed_pw_2',
      name: 'Ana Costa',
      role: 'candidate',
      country: 'Brazil',
      region: 'Americas',
    },
    {
      username: 'li_wei_cn',
      passwordHash: 'hashed_pw_3',
      name: 'Li Wei',
      role: 'candidate',
      country: 'China',
      region: 'Asia-Pacific',
    },
  ]);

  // Create tasks
  const tasks = await Task.insertMany([
    {
      title: 'Module A — Web Technologies',
      description: 'Build a responsive web page with accessibility standards',
      timeLimitMinutes: 240,
      maxScore: 100,
    },
    {
      title: 'Module B — JavaScript Framework',
      description: 'Build an interactive SPA using a modern JS framework',
      timeLimitMinutes: 240,
      maxScore: 100,
    },
  ]);

  // Create submissions
  await Submission.insertMany([
    {
      candidateId: candidates[0]._id,
      taskId: tasks[0]._id,
      submissionUrl: 'https://github.com/somchai_th/wsa2026-modA',
      score: 87,
      status: 'scored',
    },
    {
      candidateId: candidates[1]._id,
      taskId: tasks[0]._id,
      submissionUrl: 'https://github.com/ana_br/wsa2026-modA',
      score: 91,
      status: 'scored',
    },
    {
      candidateId: candidates[2]._id,
      taskId: tasks[0]._id,
      submissionUrl: 'https://github.com/li_wei_cn/wsa2026-modA',
      status: 'pending',
    },
    {
      candidateId: candidates[0]._id,
      taskId: tasks[1]._id,
      submissionUrl: 'https://github.com/somchai_th/wsa2026-modB',
      status: 'pending',
    },
  ]);

  console.log('[TP2026] Seed complete!');
  await mongoose.disconnect();
};

seed().catch(console.error);
```

```env [.env]
MONGODB_URI=mongodb://localhost:27017/tp2026
PORT=3000
```
:::

---

## 🧪 Testing Guide

### 1. POST — ส่ง submission ใหม่

```
POST http://localhost:3000/api/submissions
Content-Type: application/json

{
  "candidateId": "<USER_ID>",
  "taskId": "<TASK_ID>",
  "submissionUrl": "https://github.com/candidate/repo"
}
```

### 2. GET — ดึงทั้งหมดพร้อม populate

```
GET http://localhost:3000/api/submissions
GET http://localhost:3000/api/submissions?status=pending
```

**Expected Response (populated):**
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "_id": "65c4a1b2...",
      "candidateId": {
        "name": "Ana Costa",
        "country": "Brazil",
        "region": "Americas"
      },
      "taskId": {
        "title": "Module A — Web Technologies",
        "maxScore": 100,
        "timeLimitMinutes": 240
      },
      "submissionUrl": "https://github.com/ana_br/wsa2026-modA",
      "score": 91,
      "status": "scored",
      "isPassed": true
    }
  ]
}
```

### 3. GET — ดึงเฉพาะอัน

```
GET http://localhost:3000/api/submissions/<SUBMISSION_ID>
```

### 4. PUT — ให้คะแนน

```
PUT http://localhost:3000/api/submissions/<SUBMISSION_ID>/score
Content-Type: application/json

{
  "score": 78
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65c4a1b3...",
    "candidateId": { "name": "Li Wei", "country": "China" },
    "taskId": { "title": "Module A — Web Technologies", "maxScore": 100 },
    "score": 78,
    "status": "scored",
    "isPassed": true
  }
}
```

---

## 🔥 Challenge: Leaderboard with Aggregation

- **โจทย์:** เพิ่ม endpoint `GET /api/submissions/leaderboard/:taskId`
  ที่คืนค่า candidates เรียงตาม score สูงสุดก่อน
  พร้อม rank, ชื่อ, country, score และ percentage (score/maxScore * 100)
  โดยใช้ MongoDB Aggregation Pipeline

::: details 💡 คำใบ้

เพิ่ม route ก่อน `/:id` เพื่อกัน conflict:

```js
// routes/submissionRoutes.js
router.get('/leaderboard/:taskId', ctrl.getLeaderboard);
router.get('/:id', ctrl.getById); // ต้องอยู่หลัง leaderboard
```

```js
// controllers/submissionController.js
exports.getLeaderboard = async (req, res) => {
  try {
    const { taskId } = req.params;

    const leaderboard = await Submission.aggregate([
      // Stage 1: กรองเฉพาะ task นี้ ที่ scored แล้ว
      {
        $match: {
          taskId: new mongoose.Types.ObjectId(taskId),
          status: 'scored',
        },
      },
      // Stage 2: join กับ users collection
      {
        $lookup: {
          from: 'users',
          localField: 'candidateId',
          foreignField: '_id',
          as: 'candidate',
        },
      },
      // Stage 3: แตก array ออกเป็น object
      { $unwind: '$candidate' },
      // Stage 4: join กับ tasks collection
      {
        $lookup: {
          from: 'tasks',
          localField: 'taskId',
          foreignField: '_id',
          as: 'task',
        },
      },
      { $unwind: '$task' },
      // Stage 5: เรียง score DESC, submittedAt ASC
      { $sort: { score: -1, submittedAt: 1 } },
      // Stage 6: เลือก field ที่ต้องการ
      {
        $project: {
          _id: 0,
          candidateName: '$candidate.name',
          country: '$candidate.country',
          score: 1,
          percentage: {
            $multiply: [{ $divide: ['$score', '$task.maxScore'] }, 100],
          },
          submittedAt: 1,
        },
      },
    ]);

    // เพิ่ม rank
    const ranked = leaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

    res.json({ success: true, data: ranked });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
```

**Expected leaderboard response:**
```json
{
  "success": true,
  "data": [
    { "rank": 1, "candidateName": "Ana Costa", "country": "Brazil", "score": 91, "percentage": 91 },
    { "rank": 2, "candidateName": "Somchai Jaidee", "country": "Thailand", "score": 87, "percentage": 87 }
  ]
}
```
:::

---

## 🗣️ ทบทวน

::: details ❓ คำถามทบทวน

**คำถาม 1:** ทำไมต้องเพิ่ม `runValidators: true` ใน `findByIdAndUpdate()` และปกติ Mongoose ทำงานอย่างไรโดย default?
**แนวคำตอบ:** โดย default `findByIdAndUpdate()` **ไม่รัน** Mongoose validators (เช่น min, max, enum) เพราะเป็น "bypass" ระดับ query ต้องใส่ `{ runValidators: true }` จึงจะตรวจสอบ validation ก่อน update ซึ่งสำคัญมากสำหรับ score field ที่มี min/max

**คำถาม 2:** เหตุใด leaderboard endpoint ถึงต้องวางไว้ก่อน `/:id` ใน routes และจะเกิดอะไรถ้าวางไว้หลัง?
**แนวคำตอบ:** Express match routes จากบนลงล่าง ถ้า `/:id` อยู่ก่อน Express จะตีความ `leaderboard` ว่าเป็น `id` parameter แล้วพยายาม query `findById('leaderboard')` ซึ่งจะ error หรือ not found ต้องวาง specific routes ก่อน dynamic routes เสมอ

**คำถาม 3:** ความแตกต่างระหว่างการใช้ `populate()` กับ `$lookup` ใน Aggregation Pipeline คืออะไร ควรใช้อันไหนเมื่อไหร่?
**แนวคำตอบ:** `populate()` ใช้งานง่าย อ่าน code ง่ายกว่า เหมาะสำหรับ CRUD ทั่วไปที่ต้องการ join ข้อมูลแบบตรงไปตรงมา ส่วน `$lookup` ใน Aggregation เหมาะกว่าเมื่อต้องการ transform ข้อมูลหลังจาก join เช่น group, คำนวณ, sort ตาม computed value (อย่างเช่น leaderboard ที่ต้องคำนวณ percentage และ rank)

:::

---

> 👉 **ไปต่อ: [Module 8 — Authentication](/node/08-01-password-hashing)**
